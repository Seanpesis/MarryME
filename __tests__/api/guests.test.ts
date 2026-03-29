import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---- Supabase mock factory ----
const makeSupabase = (overrides: Record<string, any> = {}) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    ...overrides.auth,
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  ...overrides,
})

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ getAll: () => [], set: vi.fn() })),
}))

import { createClient } from '@/lib/supabase-server'
import { GET, POST, PATCH, DELETE } from '@/app/api/guests/route'

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
  const init: RequestInit = { method }
  if (body) {
    init.body = JSON.stringify(body)
    init.headers = { 'Content-Type': 'application/json' }
  }
  return new NextRequest(url, init)
}

describe('GET /api/guests', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    const sb = makeSupabase({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await GET(makeRequest('GET', 'http://localhost/api/guests?eventId=ev-1'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when eventId missing', async () => {
    const sb = makeSupabase()
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await GET(makeRequest('GET', 'http://localhost/api/guests'))
    expect(res.status).toBe(400)
  })

  it('returns guests list on success', async () => {
    const guests = [{ id: 'g-1', name: 'יעל', status: 'confirmed' }]
    const sb = makeSupabase()
    sb.order = vi.fn().mockResolvedValue({ data: guests, error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await GET(makeRequest('GET', 'http://localhost/api/guests?eventId=ev-1'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.guests).toEqual(guests)
  })

  it('returns 500 on DB error', async () => {
    const sb = makeSupabase()
    sb.order = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await GET(makeRequest('GET', 'http://localhost/api/guests?eventId=ev-1'))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/guests - single guest', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    const sb = makeSupabase({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest('POST', 'http://localhost/api/guests', { name: 'test' }))
    expect(res.status).toBe(401)
  })

  it('creates a single guest successfully', async () => {
    const newGuest = { id: 'g-2', name: 'דני', event_id: 'ev-1' }
    const sb = makeSupabase()
    sb.single = vi.fn().mockResolvedValue({ data: newGuest, error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest('POST', 'http://localhost/api/guests', { name: 'דני', event_id: 'ev-1' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.guest).toEqual(newGuest)
  })
})

describe('POST /api/guests - bulk import', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    const sb = makeSupabase({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest('POST', 'http://localhost/api/guests', { guests: [], eventId: 'ev-1' }))
    expect(res.status).toBe(401)
  })

  it('returns 404 when event not found', async () => {
    const sb = makeSupabase()
    // first eq chain returns null for event ownership check
    sb.single = vi.fn().mockResolvedValue({ data: null, error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest('POST', 'http://localhost/api/guests', {
      guests: [{ name: 'test', phone: '050' }],
      eventId: 'ev-bad',
    }))
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/guests', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    const sb = makeSupabase({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await PATCH(makeRequest('PATCH', 'http://localhost/api/guests', { id: 'g-1', status: 'confirmed' }))
    expect(res.status).toBe(401)
  })

  it('updates guest status successfully', async () => {
    const updated = { id: 'g-1', status: 'confirmed' }
    const sb = makeSupabase()
    sb.single = vi.fn().mockResolvedValue({ data: updated, error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await PATCH(makeRequest('PATCH', 'http://localhost/api/guests', { id: 'g-1', status: 'confirmed' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.guest.status).toBe('confirmed')
  })
})

describe('DELETE /api/guests', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    const sb = makeSupabase({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await DELETE(makeRequest('DELETE', 'http://localhost/api/guests?id=g-1'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when id missing', async () => {
    const sb = makeSupabase()
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await DELETE(makeRequest('DELETE', 'http://localhost/api/guests'))
    expect(res.status).toBe(400)
  })

  it('deletes single guest successfully', async () => {
    const sb = makeSupabase()
    sb.eq = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await DELETE(makeRequest('DELETE', 'http://localhost/api/guests?id=g-1'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('deletes multiple guests with ids param', async () => {
    const sb = makeSupabase()
    sb.in = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await DELETE(makeRequest('DELETE', 'http://localhost/api/guests?ids=g-1,g-2,g-3'))
    expect(res.status).toBe(200)
  })
})
