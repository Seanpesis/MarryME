'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

// ============= BADGE =============
type BadgeVariant = 'confirmed' | 'pending' | 'declined' | 'maybe' | 'paid' | 'partial' | 'default'

const BADGE_STYLES: Record<BadgeVariant, string> = {
  confirmed: 'bg-sage-100 text-sage-700 border border-sage-200',
  pending:   'bg-champagne-100 text-champagne-700 border border-champagne-200',
  declined:  'bg-red-100 text-red-700 border border-red-200',
  maybe:     'bg-blue-100 text-blue-700 border border-blue-200',
  paid:      'bg-sage-100 text-sage-700 border border-sage-200',
  partial:   'bg-amber-100 text-amber-700 border border-amber-200',
  default:   'bg-stone-100 text-stone-600 border border-stone-200',
}

export function Badge({ variant = 'default', children }: { variant?: BadgeVariant; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-hebrew font-semibold ${BADGE_STYLES[variant]}`}>
      {children}
    </span>
  )
}

// ============= PROGRESS BAR =============
export function ProgressBar({ value, max, color = 'champagne' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="progress-bar">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          color === 'red' ? 'bg-gradient-to-r from-red-400 to-red-600' :
          color === 'sage' ? 'bg-gradient-to-r from-sage-400 to-sage-600' :
          'bg-gradient-to-r from-champagne-400 to-champagne-600'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ============= EMPTY STATE =============
export function EmptyState({
  icon, title, description, action
}: {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="text-5xl mb-4 opacity-50">{icon}</div>
      <h3 className="font-bold font-hebrew text-stone-700 text-lg">{title}</h3>
      {description && <p className="text-stone-400 font-hebrew text-sm mt-2 max-w-xs">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// ============= CONFIRM DIALOG =============
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({ open: false, title: '', message: '', onConfirm: () => {} })

  const confirm = (title: string, message: string) =>
    new Promise<boolean>(resolve => {
      setState({ open: true, title, message, onConfirm: () => resolve(true) })
    })

  const Dialog = () =>
    state.open ? (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-luxury p-6 max-w-sm w-full">
          <h3 className="font-bold font-hebrew text-dark-brown text-lg mb-2">{state.title}</h3>
          <p className="text-stone-500 font-hebrew text-sm mb-6">{state.message}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setState(s => ({ ...s, open: false }))}
              className="btn-secondary flex-1 justify-center"
            >
              ביטול
            </button>
            <button
              onClick={() => { state.onConfirm(); setState(s => ({ ...s, open: false })) }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-hebrew font-semibold hover:bg-red-600 transition-colors"
            >
              <Check className="w-4 h-4" />
              אישור
            </button>
          </div>
        </div>
      </div>
    ) : null

  return { confirm, Dialog }
}

// ============= TOOLTIP =============
export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-dark-brown text-white text-xs font-hebrew px-2.5 py-1.5 rounded-lg whitespace-nowrap z-50 shadow-lg">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark-brown" />
        </div>
      )}
    </div>
  )
}

// ============= SELECT DROPDOWN =============
export function Select({
  options, value, onChange, placeholder
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input-field flex items-center justify-between cursor-pointer"
      >
        <span className={selected ? 'text-dark-brown' : 'text-stone-400'}>
          {selected?.label || placeholder || 'בחר...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-right px-4 py-2.5 text-sm font-hebrew hover:bg-champagne-50 transition-colors flex items-center justify-between ${value === opt.value ? 'text-champagne-700 font-bold' : 'text-stone-700'}`}
            >
              {opt.label}
              {value === opt.value && <Check className="w-4 h-4 text-champagne-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============= STAT CARD =============
export function StatCard({
  icon, label, value, trend, trendLabel, color = 'champagne'
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: number
  trendLabel?: string
  color?: string
}) {
  const colors: Record<string, string> = {
    champagne: 'bg-gradient-to-br from-champagne-400 to-champagne-600',
    sage:      'bg-gradient-to-br from-sage-400 to-sage-600',
    amber:     'bg-gradient-to-br from-amber-400 to-amber-600',
    red:       'bg-gradient-to-br from-red-400 to-red-600',
    violet:    'bg-gradient-to-br from-violet-400 to-violet-600',
  }

  return (
    <div className="card-hover flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl ${colors[color] || colors.champagne} flex items-center justify-center shrink-0 shadow-md`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-dark-brown">{value}</p>
        <p className="text-stone-500 font-hebrew text-sm mt-0.5">{label}</p>
        {trend !== undefined && (
          <p className={`text-xs font-hebrew mt-1 flex items-center gap-1 ${trend >= 0 ? 'text-sage-600' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
          </p>
        )}
      </div>
    </div>
  )
}
