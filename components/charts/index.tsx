'use client'

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart,
} from 'recharts'

const COLORS = ['#dc9229', '#548150', '#e85555', '#7B4EA6', '#D4500E', '#2B7FA6', '#C44B6A', '#5A8A3E', '#C4901A', '#6B7280']

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="var(--font-heebo)" fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const hebrewTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-lg text-right" dir="rtl">
      {label && <p className="font-bold font-hebrew text-stone-700 mb-1">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-hebrew" style={{ color: entry.color }}>
          {entry.name}: ₪{Number(entry.value).toLocaleString('he-IL')}
        </p>
      ))}
    </div>
  )
}

// ============= PIE CHART - Budget by Category =============
export function BudgetPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={110}
          innerRadius={50}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={hebrewTooltip} />
        <Legend
          formatter={(value) => <span className="font-hebrew text-xs text-stone-600">{value}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ============= BAR CHART - Expenses vs Budget =============
export function ExpensesBarChart({ data }: { data: { name: string; budget: number; spent: number; remaining: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 10 }} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1ede8" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontFamily: 'var(--font-heebo)', fontSize: 11, fill: '#78716c' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontFamily: 'var(--font-heebo)', fontSize: 10, fill: '#78716c' }}
          tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={hebrewTooltip} />
        <Legend
          formatter={(value) => (
            <span className="font-hebrew text-xs text-stone-600">
              {value === 'budget' ? 'תקציב' : value === 'spent' ? 'שולם' : 'נותר'}
            </span>
          )}
        />
        <Bar dataKey="budget" fill="#f4ddb0" radius={[4, 4, 0, 0]} name="budget" />
        <Bar dataKey="spent" fill="#dc9229" radius={[4, 4, 0, 0]} name="spent" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ============= AREA CHART - RSVP over time =============
export function RsvpAreaChart({ data }: { data: { date: string; confirmed: number; pending: number; declined: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="confirmedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#548150" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#548150" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#dc9229" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#dc9229" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1ede8" vertical={false} />
        <XAxis dataKey="date" tick={{ fontFamily: 'var(--font-heebo)', fontSize: 10, fill: '#78716c' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontFamily: 'var(--font-heebo)', fontSize: 10, fill: '#78716c' }} axisLine={false} tickLine={false} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-lg text-right" dir="rtl">
                <p className="font-bold font-hebrew text-stone-700 mb-1 text-xs">{label}</p>
                {payload.map((p: any, i: number) => (
                  <p key={i} className="text-xs font-hebrew" style={{ color: p.color }}>
                    {p.name === 'confirmed' ? 'אישרו' : p.name === 'pending' ? 'ממתינים' : 'לא מגיעים'}: {p.value}
                  </p>
                ))}
              </div>
            )
          }}
        />
        <Area type="monotone" dataKey="confirmed" stroke="#548150" strokeWidth={2} fill="url(#confirmedGrad)" dot={false} />
        <Area type="monotone" dataKey="pending" stroke="#dc9229" strokeWidth={2} fill="url(#pendingGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ============= DONUT CHART - Guest status =============
export function GuestDonut({ confirmed, pending, declined, maybe }: {
  confirmed: number; pending: number; declined: number; maybe: number
}) {
  const data = [
    { name: 'אישרו', value: confirmed, color: '#548150' },
    { name: 'ממתינים', value: pending, color: '#dc9229' },
    { name: 'לא מגיעים', value: declined, color: '#e85555' },
    { name: 'אולי', value: maybe, color: '#7B4EA6' },
  ].filter(d => d.value > 0)

  const total = confirmed + pending + declined + maybe

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" strokeWidth={0}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0]
              return (
                <div className="bg-white border border-stone-200 rounded-xl p-2.5 shadow-lg text-right" dir="rtl">
                  <p className="font-hebrew text-sm font-bold" style={{ color: d.payload.color }}>{d.name}</p>
                  <p className="font-hebrew text-xs text-stone-500">{d.value} ({total > 0 ? Math.round((Number(d.value) / total) * 100) : 0}%)</p>
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="font-bold font-display text-2xl text-dark-brown">{total}</p>
        <p className="text-xs text-stone-400 font-hebrew">מוזמנים</p>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs font-hebrew text-stone-600">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name}: {d.value}
          </div>
        ))}
      </div>
    </div>
  )
}
