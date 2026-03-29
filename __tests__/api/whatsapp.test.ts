import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const makeSupabase = (overrides: Record<string, any> = {}) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    ...overrides.auth,
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: { id: 'ev-1' }, error: null }),
  ...overrides,
})

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ getAll: () => [], set: vi.fn() })),
}))

import { createClient } from '@/lib/supabase-server'
import { POST } from '@/app/api/whatsapp/send/route'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/whatsapp/send', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GREEN_API_INSTANCE_ID', '')
    vi.stubEnv('GREEN_API_TOKEN', '')
  })

  it('returns 401 when unauthenticated', async () => {
    const sb = makeSupabase({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest({ guestId: 'g-1', phone: '050', message: 'hi', eventId: 'ev-1' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when phone or message missing', async () => {
    const sb = makeSupabase()
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest({ guestId: 'g-1', phone: '', message: '', eventId: 'ev-1' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when event not found', async () => {
    const sb = makeSupabase()
    sb.single = vi.fn().mockResolvedValue({ data: null, error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest({ guestId: 'g-1', phone: '0501234567', message: 'hi', eventId: 'ev-bad' }))
    expect(res.status).toBe(404)
  })

  it('succeeds in simulation mode (no GREEN_API keys set)', async () => {
    const sb = makeSupabase()
    // event ownership check returns an event; guest update returns no error
    sb.single = vi.fn().mockResolvedValue({ data: { id: 'ev-1' }, error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)

    const res = await POST(makeRequest({
      guestId: 'g-1',
      phone: '0501234567',
      message: 'שלום יעל, הוזמנת לחתונה',
      eventId: 'ev-1',
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.messageId).toMatch(/^sim_/)
  })
})

describe('Phone number normalization (via WhatsApp send)', () => {
  // Tests that the normalizePhoneForWhatsApp logic embedded in the route works correctly
  // These are validated indirectly by the GREEN_API path succeeding
  it('normalizes 05x numbers to 972 format', async () => {
    const { normalizePhoneForWhatsApp } = await import('@/lib/utils')
    expect(normalizePhoneForWhatsApp('0501234567')).toBe('972501234567')
    expect(normalizePhoneForWhatsApp('052-123-4567')).toBe('972521234567')
    expect(normalizePhoneForWhatsApp('+972501234567')).toBe('972501234567')
  })
})
