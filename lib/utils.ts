import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format Israeli phone number
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 10 && clean.startsWith('0')) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`
  }
  return phone
}

// Normalize phone for WhatsApp (Israel)
export function normalizePhoneForWhatsApp(phone: string): string {
  let clean = phone.replace(/\D/g, '')
  if (clean.startsWith('0')) clean = '972' + clean.slice(1)
  if (!clean.startsWith('972')) clean = '972' + clean
  return clean
}

// Format currency in ILS
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date in Hebrew
export function formatDateHebrew(date: string | Date, format: 'short' | 'long' | 'full' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  const options: Intl.DateTimeFormatOptions =
    format === 'full'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : format === 'long'
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : { day: 'numeric', month: 'numeric', year: 'numeric' }

  return d.toLocaleDateString('he-IL', options)
}

// Days until date
export function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Get guest status label
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    confirmed: 'אישר הגעה',
    pending:   'ממתין לתשובה',
    declined:  'לא מגיע',
    maybe:     'אולי',
  }
  return labels[status] || status
}

// Get category label
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    family:  'משפחה',
    friends: 'חברים',
    work:    'עבודה',
    other:   'אחר',
  }
  return labels[category] || category
}

// Generate invitation message
export function generateInvitationMessage(
  template: string,
  guest: { name: string },
  event: { name?: string; date?: string; venue?: string; cover_message?: string }
): string {
  return template
    .replace(/{name}/g, guest.name)
    .replace(/{event_name}/g, event.name || '')
    .replace(/{date}/g, event.date ? formatDateHebrew(event.date) : '')
    .replace(/{venue}/g, event.venue || '')
    .replace(/{time}/g, '19:00')
}

// Debounce
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Parse CSV row to guest
export function parseCSVRowToGuest(row: Record<string, string>) {
  return {
    name: row['שם'] || row['name'] || row['Name'] || Object.values(row)[0] || '',
    phone: row['טלפון'] || row['phone'] || row['Phone'] || Object.values(row)[1] || '',
    email: row['אימייל'] || row['email'] || '',
    party_size: parseInt(row['כמות'] || row['size'] || row['מספר'] || '1') || 1,
    category: row['קטגוריה'] || row['category'] || 'other',
  }
}

// Color from string (for avatars)
export function stringToColor(str: string): string {
  const colors = [
    'from-champagne-300 to-champagne-500',
    'from-sage-300 to-sage-500',
    'from-blush-300 to-blush-500',
    'from-violet-300 to-violet-500',
    'from-amber-300 to-amber-500',
    'from-teal-300 to-teal-500',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
