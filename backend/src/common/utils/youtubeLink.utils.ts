export const extractVideoId = (url: string): string | null => {
  if (!url) return null

  // Explicitly reject Shorts and Live streams
  if (url.includes("/shorts/") || url.includes("/live/")) {
    return null
  }

  // 0. If it's a plain video ID (exactly 11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url

  // 1. Check for youtu.be/ID (Share option)
  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (youtuBeMatch) return youtuBeMatch[1]

  // 2. Check for youtube.com/embed/ID (Embed links)
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  if (embedMatch) return embedMatch[1]

  // 3. Check for watch?v=ID or &v=ID (Standard web links with query parameters)
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch) return watchMatch[1]

  return null
}

export const isValidYoutubeLink = (url: string): boolean => {
  return extractVideoId(url) !== null
}

export const parseISO8601Duration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)
  return hours * 3600 + minutes * 60 + seconds
}