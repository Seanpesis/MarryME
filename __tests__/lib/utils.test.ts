import { describe, it, expect } from 'vitest'
import {
  cn,
  formatPhone,
  normalizePhoneForWhatsApp,
  formatCurrency,
  formatDateHebrew,
  daysUntil,
  truncate,
  getStatusLabel,
  getCategoryLabel,
  generateInvitationMessage,
  debounce,
  parseCSVRowToGuest,
  stringToColor,
} from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })
  it('merges conflicting Tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})

describe('formatPhone', () => {
  it('formats 10-digit Israeli number', () => {
    expect(formatPhone('0501234567')).toBe('050-1234567')
  })
  it('formats with dashes already stripped', () => {
    expect(formatPhone('0521234567')).toBe('052-1234567')
  })
  it('returns original if not 10 digits', () => {
    expect(formatPhone('123')).toBe('123')
  })
  it('returns original if not starting with 0', () => {
    expect(formatPhone('9721234567')).toBe('9721234567')
  })
})

describe('normalizePhoneForWhatsApp', () => {
  it('converts 05x format to 972', () => {
    expect(normalizePhoneForWhatsApp('0501234567')).toBe('972501234567')
  })
  it('keeps 972 prefix unchanged', () => {
    expect(normalizePhoneForWhatsApp('972501234567')).toBe('972501234567')
  })
  it('prepends 972 to bare number without 0 or 972', () => {
    expect(normalizePhoneForWhatsApp('501234567')).toBe('972501234567')
  })
  it('strips non-digits before normalizing', () => {
    expect(normalizePhoneForWhatsApp('050-123-4567')).toBe('972501234567')
  })
})

describe('formatCurrency', () => {
  it('formats positive amount in ILS', () => {
    const result = formatCurrency(5000)
    expect(result).toContain('5,000')
    expect(result).toContain('₪')
  })
  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })
  it('formats large numbers with commas', () => {
    const result = formatCurrency(100000)
    expect(result).toContain('100,000')
  })
})

describe('formatDateHebrew', () => {
  it('returns empty string for invalid date', () => {
    expect(formatDateHebrew('not-a-date')).toBe('')
  })
  it('formats a valid ISO date string', () => {
    const result = formatDateHebrew('2025-08-15')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
  it('accepts Date object', () => {
    const d = new Date('2025-08-15')
    const result = formatDateHebrew(d)
    expect(result).toBeTruthy()
  })
  it('supports long format', () => {
    const result = formatDateHebrew('2025-08-15', 'long')
    expect(result.length).toBeGreaterThan(formatDateHebrew('2025-08-15', 'short').length)
  })
})

describe('daysUntil', () => {
  it('returns positive number for future date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 10)
    expect(daysUntil(future)).toBeGreaterThan(0)
  })
  it('returns negative number for past date', () => {
    const past = new Date()
    past.setDate(past.getDate() - 10)
    expect(daysUntil(past)).toBeLessThan(0)
  })
  it('accepts ISO string', () => {
    const future = new Date()
    future.setDate(future.getDate() + 5)
    const result = daysUntil(future.toISOString())
    expect(result).toBeGreaterThan(0)
  })
})

describe('truncate', () => {
  it('returns text unchanged when shorter than limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })
  it('truncates and appends ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })
  it('returns exact text when equal to limit', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })
})

describe('getStatusLabel', () => {
  it('returns Hebrew label for confirmed', () => {
    expect(getStatusLabel('confirmed')).toBe('אישר הגעה')
  })
  it('returns Hebrew label for pending', () => {
    expect(getStatusLabel('pending')).toBe('ממתין לתשובה')
  })
  it('returns Hebrew label for declined', () => {
    expect(getStatusLabel('declined')).toBe('לא מגיע')
  })
  it('returns Hebrew label for maybe', () => {
    expect(getStatusLabel('maybe')).toBe('אולי')
  })
  it('returns original string for unknown status', () => {
    expect(getStatusLabel('unknown')).toBe('unknown')
  })
})

describe('getCategoryLabel', () => {
  it('returns Hebrew label for family', () => {
    expect(getCategoryLabel('family')).toBe('משפחה')
  })
  it('returns Hebrew label for friends', () => {
    expect(getCategoryLabel('friends')).toBe('חברים')
  })
  it('returns original for unknown category', () => {
    expect(getCategoryLabel('unknown')).toBe('unknown')
  })
})

describe('generateInvitationMessage', () => {
  const guest = { name: 'יעל כהן' }
  const event = { name: 'חתונת יעל ואורי', date: '2025-08-15', venue: 'אולם השושנים' }

  it('replaces {name} placeholder', () => {
    const msg = generateInvitationMessage('שלום {name}', guest, event)
    expect(msg).toBe('שלום יעל כהן')
  })
  it('replaces {event_name} placeholder', () => {
    const msg = generateInvitationMessage('{event_name}', guest, event)
    expect(msg).toBe('חתונת יעל ואורי')
  })
  it('replaces {venue} placeholder', () => {
    const msg = generateInvitationMessage('{venue}', guest, event)
    expect(msg).toBe('אולם השושנים')
  })
  it('replaces {time} with default 19:00', () => {
    const msg = generateInvitationMessage('{time}', guest, event)
    expect(msg).toBe('19:00')
  })
  it('replaces all placeholders in one message', () => {
    const template = 'שלום {name}, מוזמן/ת ל{event_name} ב{venue} בשעה {time}'
    const msg = generateInvitationMessage(template, guest, event)
    expect(msg).toContain('יעל כהן')
    expect(msg).toContain('חתונת יעל ואורי')
    expect(msg).toContain('אולם השושנים')
    expect(msg).toContain('19:00')
  })
  it('handles missing event fields gracefully', () => {
    const msg = generateInvitationMessage('{event_name} - {venue}', guest, {})
    expect(msg).toBe(' - ')
  })
})

describe('debounce', () => {
  it('delays function call', async () => {
    let count = 0
    const fn = debounce(() => { count++ }, 50)
    fn(); fn(); fn()
    expect(count).toBe(0)
    await new Promise(r => setTimeout(r, 100))
    expect(count).toBe(1)
  })
  it('resets timer on repeated calls', async () => {
    let count = 0
    const fn = debounce(() => { count++ }, 50)
    fn()
    await new Promise(r => setTimeout(r, 30))
    fn() // resets
    await new Promise(r => setTimeout(r, 30))
    expect(count).toBe(0) // not yet fired
    await new Promise(r => setTimeout(r, 30))
    expect(count).toBe(1)
  })
})

describe('parseCSVRowToGuest', () => {
  it('parses Hebrew column names', () => {
    const row = { 'שם': 'דני לוי', 'טלפון': '0501234567', 'קטגוריה': 'family' }
    const guest = parseCSVRowToGuest(row)
    expect(guest.name).toBe('דני לוי')
    expect(guest.phone).toBe('0501234567')
    expect(guest.category).toBe('family')
  })
  it('parses English column names', () => {
    const row = { name: 'Danny', phone: '0521234567', category: 'friends' }
    const guest = parseCSVRowToGuest(row)
    expect(guest.name).toBe('Danny')
    expect(guest.phone).toBe('0521234567')
  })
  it('defaults party_size to 1', () => {
    const guest = parseCSVRowToGuest({ name: 'test', phone: '' })
    expect(guest.party_size).toBe(1)
  })
  it('defaults category to other', () => {
    const guest = parseCSVRowToGuest({ name: 'test', phone: '' })
    expect(guest.category).toBe('other')
  })
  it('parses party_size from Hebrew column', () => {
    const row = { 'שם': 'test', 'כמות': '3' }
    const guest = parseCSVRowToGuest(row)
    expect(guest.party_size).toBe(3)
  })
})

describe('stringToColor', () => {
  it('returns a non-empty string', () => {
    expect(stringToColor('test')).toBeTruthy()
  })
  it('returns consistent result for same input', () => {
    expect(stringToColor('hello')).toBe(stringToColor('hello'))
  })
  it('returns different colors for different inputs', () => {
    const colors = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map(stringToColor))
    expect(colors.size).toBeGreaterThan(1)
  })
  it('returns a Tailwind gradient class', () => {
    const color = stringToColor('test')
    expect(color).toMatch(/from-/)
    expect(color).toMatch(/to-/)
  })
})
