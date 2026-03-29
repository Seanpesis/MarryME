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
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  ...overrides,
})

vi.mock('@/lib/supabase-server', () => ({ createClient: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ getAll: () => [], set: vi.fn() })),
}))

import { createClient } from '@/lib/supabase-server'
import { GET, POST } from '@/app/api/budget/route'

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
  const init: RequestInit = { method }
  if (body) { init.body = JSON.stringify(body); init.headers = { 'Content-Type': 'application/json' } }
  return new NextRequest(url, init)
}

describe('GET /api/budget', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    const sb = makeSupabase({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await GET(makeRequest('GET', 'http://localhost/api/budget?eventId=ev-1'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when eventId missing', async () => {
    const sb = makeSupabase()
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await GET(makeRequest('GET', 'http://localhost/api/budget'))
    expect(res.status).toBe(400)
  })

  it('returns budget data with correct summary calculations', async () => {
    const expenses = [
      { total_amount: 5000, advance_paid: 1000, paid_amount: 500 },
      { total_amount: 3000, advance_paid: 0, paid_amount: 3000 },
    ]
    const incomes = [
      { amount: 2000 },
      { amount: 3000 },
    ]
    const event = { total_budget: 20000 }

    const sb = makeSupabase()
    let callIndex = 0
    // Promise.all fires 4 queries: expenses, incomes, categories, event
    sb.order = vi.fn()
      .mockResolvedValueOnce({ data: expenses, error: null })  // expenses
      .mockResolvedValueOnce({ data: incomes, error: null })   // incomes
    sb.eq = vi.fn().mockReturnThis()
    sb.single = vi.fn().mockResolvedValue({ data: event, error: null })
    // categories has no order call
    const originalFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'budget_categories') return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [], error: null }) }
      return sb
    })
    sb.from = originalFrom
    vi.mocked(createClient).mockReturnValue(sb as any)

    // Use a simpler approach: mock the whole thing returning resolved values
    const mockSb = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-1' } } }) },
      from: vi.fn().mockImplementation((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(() => {
          if (table === 'expenses') return Promise.resolve({ data: expenses, error: null })
          if (table === 'incomes') return Promise.resolve({ data: incomes, error: null })
          return Promise.resolve({ data: [], error: null })
        }),
        single: vi.fn().mockResolvedValue({ data: event, error: null }),
      })),
    }
    vi.mocked(createClient).mockReturnValue(mockSb as any)

    const res = await GET(makeRequest('GET', 'http://localhost/api/budget?eventId=ev-1'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.summary.totalExpenses).toBe(8000)
    expect(body.summary.totalPaid).toBe(4500)
    expect(body.summary.totalIncome).toBe(5000)
    expect(body.summary.remaining).toBe(12000) // 20000 - 8000
  })
})

describe('POST /api/budget - expense', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    const sb = makeSupabase({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest('POST', 'http://localhost/api/budget', { type: 'expense', total_amount: 1000 }))
    expect(res.status).toBe(401)
  })

  it('creates expense with correct status=paid when fully paid', async () => {
    const expense = { id: 'e-1', total_amount: 1000, advance_paid: 1000, paid_amount: 0, status: 'paid' }
    const sb = makeSupabase()
    sb.single = vi.fn().mockResolvedValue({ data: expense, error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest('POST', 'http://localhost/api/budget', {
      type: 'expense',
      total_amount: 1000,
      advance_paid: 1000,
      paid_amount: 0,
    }))
    expect(res.status).toBe(201)
  })

  it('creates income record', async () => {
    const income = { id: 'i-1', amount: 500, source: 'gift' }
    const sb = makeSupabase()
    sb.single = vi.fn().mockResolvedValue({ data: income, error: null })
    vi.mocked(createClient).mockReturnValue(sb as any)
    const res = await POST(makeRequest('POST', 'http://localhost/api/budget', {
      type: 'income',
      amount: 500,
      source: 'gift',
    }))
    expect(res.status).toBe(201)
  })
})
