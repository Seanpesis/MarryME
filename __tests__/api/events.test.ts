import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const makeSupabase = (overrides: Record<string, any> = {}) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    ...overrides.auth,
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  ...overrides,
})

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ getAll: () => [], set: vi.fn() })),
}))

import { createClient } from '@/lib/supabase-server'
import { GET, POST, PUT } from '@/app/api/events/route'

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
  const init: RequestInit = { method }
  if (body) { init.body = JSON.stringify(body); init.headers = { 'Content-Type': 'application/json' } }
  return new NextRequest(url, init)
}

describe('GET /api/events', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    const sb = makeSupabase({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns events for authenticated user', async () => {
    const events = [{ id: 'ev-1', name: 'חתונת יעל ואורי' }]
    const sb = makeSupabase()
    sb.order = vi.fn().mockResolvedValue({ data: events, error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.events).toEqual(events)
  })
})

describe('POST /api/events', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    const sb = makeSupabase({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest('POST', 'http://localhost/api/events', { name: 'test' }))
    expect(res.status).toBe(401)
  })

  it('creates event and returns 201', async () => {
    const event = { id: 'ev-1', name: 'test', user_id: 'user-1' }
    const sb = makeSupabase()
    sb.single = vi.fn().mockResolvedValue({ data: event, error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest('POST', 'http://localhost/api/events', { name: 'test' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.event.name).toBe('test')
  })

  it('returns 500 on DB insert error', async () => {
    const sb = makeSupabase()
    sb.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest('POST', 'http://localhost/api/events', { name: 'test' }))
    expect(res.status).toBe(500)
  })
})

describe('PUT /api/events', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    const sb = makeSupabase({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await PUT(makeRequest('PUT', 'http://localhost/api/events', { id: 'ev-1', name: 'new' }))
    expect(res.status).toBe(401)
  })

  it('updates event with user ownership check', async () => {
    const updated = { id: 'ev-1', name: 'new name' }
    const sb = makeSupabase()
    sb.single = vi.fn().mockResolvedValue({ data: updated, error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await PUT(makeRequest('PUT', 'http://localhost/api/events', { id: 'ev-1', name: 'new name' }))
    expect(res.status).toBe(200)
  })
})
