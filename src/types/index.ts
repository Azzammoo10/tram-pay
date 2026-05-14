export type TicketStatus = 'PENDING' | 'USED' | 'EXPIRED'
export type CardStatus = 'ACTIVE' | 'BLOCKED'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  created_at: string
}

export interface Card {
  id: number
  user_id: string
  card_token: string
  label: string
  status: CardStatus
  created_at: string
}

export interface Ticket {
  id: number
  user_id: string
  card_id: number | null
  transaction_id: string
  qr_payload: string
  amount: number
  status: TicketStatus
  generated_at: string
  expires_at: string
  used_at: string | null
}
