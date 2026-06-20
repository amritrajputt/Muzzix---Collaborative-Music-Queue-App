export interface JoinSpacePayload {
  spaceId: string
  guestUuid: string
  guestName: string
}

export interface LeaveSpacePayload {
  spaceId: string
  guestName: string
  guestUuid: string
}

export interface MemberJoinedPayload {
  guestName: string
}

export interface MemberLeftPayload {
  guestName: string
}

export interface QueueUpdatedPayload {
  queue: any[]
}