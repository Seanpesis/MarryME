export type GuestStatus = 'pending' | 'confirmed' | 'declined' | 'maybe'
export type GuestCategory = 'family' | 'friends' | 'work' | 'other'

export interface Event {
  id: string
  user_id: string
  name: string
  date: string
  venue: string
  venue_address: string
  bride_name: string
  groom_name: string
  total_budget: number
  created_at: string
  updated_at: string
}

export interface Guest {
  id: string
  event_id: string
  name: string
  phone: string
  email?: string
  status: GuestStatus
  category: GuestCategory
  table_id?: string
  seat_number?: number
  party_size: number
  confirmed_count: number
  notes?: string
  invitation_sent: boolean
  invitation_sent_at?: string
  reminder_sent: boolean
  whatsapp_status?: 'sent' | 'delivered' | 'read' | 'failed'
  created_at: string
}

export interface Table {
  id: string
  event_id: string
  name: string
  capacity: number
  shape: 'round' | 'rectangle' | 'oval'
  position_x: number
  position_y: number
  notes?: string
}

export interface BudgetCategory {
  id: string
  event_id: string
  name: string
  icon: string
  color: string
}

export interface Expense {
  id: string
  event_id: string
  category_id: string
  vendor_id?: string
  description: string
  total_amount: number
  advance_paid: number
  paid_amount: number
  remaining: number
  due_date?: string
  paid_date?: string
  status: 'pending' | 'partial' | 'paid'
  notes?: string
  created_at: string
}

export interface Income {
  id: string
  event_id: string
  source: string
  amount: number
  received_at: string
  notes?: string
}

export interface Vendor {
  id: string
  name: string
  category: string
  phone: string
  email?: string
  website?: string
  description?: string
  price_range?: string
  location?: string
  rating?: number
  review_count?: number
  is_recommended: boolean
  is_system: boolean
  user_id?: string
  image_url?: string
  created_at: string
}

export interface InvitationTemplate {
  id: string
  name: string
  preview_url: string
  message_template: string
  category: string
}
