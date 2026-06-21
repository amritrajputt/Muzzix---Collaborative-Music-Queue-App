import { RedisSortedSet } from "../redis/redis.sortedSet.js"
import { emitToRoom } from "../redis/redis.pubsub.js"
import ApiError from "../../common/errors/ApiError.js"
import { NowPlayingState } from "./nowPlaying.types.js"

const activeTimeouts = new Map<string, NodeJS.Timeout>()

export class NowPlayingService {
    
    // pop queue, save history, update nowPlaying, broadcast update
    static async advanceToNextSong(spaceId: string): Promise<NowPlayingState | null> {
        try {
            this.clearPlaybackTimeout(spaceId)
            const queueItems = await RedisSortedSet.getFullQueue(spaceId)

            if (queueItems.length === 0) {
                await RedisSortedSet.clearNowPlaying(spaceId)
                emitToRoom("nowPlayingChanged", {}, spaceId)
                return null
            }

            const nextSongItem = queueItems[0]
            const songId = nextSongItem.value

            const songMetadata = await RedisSortedSet.getSongMetadata(spaceId, songId)
            if (!songMetadata) {
                throw ApiError.notFound("Song metadata not found")
            }

            await RedisSortedSet.removeSongFromQueue(spaceId, songId)

            const nowPlayingInfo: NowPlayingState = {
                songId,
                title: songMetadata.title,
                url: songMetadata.url,
                thumbnail: songMetadata.thumbnail,
                startedAt: Date.now()
            }
            await RedisSortedSet.setNowPlaying(spaceId, nowPlayingInfo)

            const broadcastSong = {
                songId: nowPlayingInfo.songId,
                title: nowPlayingInfo.title,
                url: nowPlayingInfo.url,
                thumbnail: nowPlayingInfo.thumbnail
            }
            emitToRoom("nowPlayingChanged", { song: broadcastSong }, spaceId)

            const updatedQueue = await RedisSortedSet.getMergedQueue(spaceId)
            emitToRoom("queueUpdated", { queue: updatedQueue }, spaceId)

            return nowPlayingInfo
        } catch (error) {
            throw error
        }
    }

    // save duration, broadcast nowPlaying, trigger playback timer
    static async onDurationReported(spaceId: string, songId: string, duration: number): Promise<void> {
        const nowPlaying = await RedisSortedSet.getNowPlaying(spaceId)
        if (!nowPlaying) {
            throw ApiError.notFound("No song is currently playing in this space")
        }

        if (nowPlaying.songId !== songId) {
            // Ignore stale duration reports for songs that are no longer playing
            return
        }

        const updatedNowPlaying = {
            ...nowPlaying,
            duration
        }
        await RedisSortedSet.setNowPlaying(spaceId, updatedNowPlaying)

        const broadcastSong = {
            songId: updatedNowPlaying.songId,
            title: updatedNowPlaying.title,
            url: updatedNowPlaying.url,
            thumbnail: updatedNowPlaying.thumbnail
        }
        emitToRoom("nowPlayingChanged", { song: broadcastSong }, spaceId)

        await this.tryStartPlayback(spaceId)
    }

    //schedule auto-advance timeout
    static async tryStartPlayback(spaceId: string): Promise<void> {
        if (activeTimeouts.has(spaceId)) {
            return
        }

        const nowPlaying = await RedisSortedSet.getNowPlaying(spaceId)
        if (!nowPlaying) {
            await this.advanceToNextSong(spaceId)
        } else if (nowPlaying.duration !== undefined) {
            const elapsedMs = Date.now() - nowPlaying.startedAt
            const remainingMs = (nowPlaying.duration * 1000) - elapsedMs

            if (remainingMs > 0) {
                this.schedulePlaybackTimeout(spaceId, remainingMs / 1000)
            } else {
                await this.advanceToNextSong(spaceId)
            }
        }
    }

    // schedule auto-advance timeout with a specific duration
    private static schedulePlaybackTimeout(spaceId: string, durationSeconds: number): void {
        this.clearPlaybackTimeout(spaceId)

        const timeout = setTimeout(async () => {
            try {
                await this.advanceToNextSong(spaceId)
            } catch (err) {
                console.error(`Error auto-advancing song for space ${spaceId}:`, err)
            }
        }, durationSeconds * 1000)

        activeTimeouts.set(spaceId, timeout)
    }

    // clear active playback timeout
    private static clearPlaybackTimeout(spaceId: string): void {
        const timeout = activeTimeouts.get(spaceId)
        if (timeout) {
            clearTimeout(timeout)
            activeTimeouts.delete(spaceId)
        }
    }
}

export default NowPlayingService
