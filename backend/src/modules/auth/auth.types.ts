export interface ClerkWebhookEvent {
  type: string
  data: {
    id: string
    email_addresses: { email_address: string }[]
    first_name: string | null
    last_name: string | null
  }
}