'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Users, MessageCircle, DollarSign, LayoutGrid } from 'lucide-react'

const MOBILE_NAV = [
  { href: '/dashboard', icon: BarChart3, label: 'בקרה', exact: true },
  { href: '/dashboard/guests', icon: Users, label: 'מוזמנים' },
  { href: '/dashboard/invitations', icon: MessageCircle, label: 'הזמנות' },
  { href: '/dashboard/budget', icon: DollarSign, label: 'תקציב' },
  { href: '/dashboard/tables', icon: LayoutGrid, label: 'שולחנות' },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-100 lg:hidden safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-0 ${
                active
                  ? 'text-champagne-600'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all ${active ? 'bg-champagne-100' : ''}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-champagne-600' : ''}`} />
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-champagne-500 rounded-full" />
                )}
              </div>
              <span className={`text-xs font-hebrew font-medium ${active ? 'text-champagne-600' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
