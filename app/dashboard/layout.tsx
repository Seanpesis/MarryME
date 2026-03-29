'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Heart, Users, MessageCircle, LayoutGrid, DollarSign,
  Globe, Search, BarChart3, Settings, LogOut, Menu, X,
  ChevronDown, Bell, Plus, Calendar, FileText
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { MobileBottomNav } from '@/components/dashboard/MobileNav'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { href: '/dashboard', icon: BarChart3, label: 'לוח בקרה', exact: true },
  { href: '/dashboard/guests', icon: Users, label: 'מוזמנים' },
  { href: '/dashboard/invitations', icon: MessageCircle, label: 'הזמנות WhatsApp' },
  { href: '/dashboard/tables', icon: LayoutGrid, label: 'סידורי הושבה' },
  { href: '/dashboard/budget', icon: DollarSign, label: 'תקציב' },
  { href: '/dashboard/vendors', icon: Search, label: 'ספקים' },
  { href: '/dashboard/event-site', icon: Globe, label: 'אתר האירוע' },
  { href: '/dashboard/reports', icon: FileText, label: 'דוחות' },
  { href: '/dashboard/blessings', icon: Heart, label: 'ברכות' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      // Load first event
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (events && events.length > 0) {
        setEvent(events[0])
        localStorage.setItem('activeEventId', events[0].id)
      }
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('להתראות! 👋')
    router.push('/')
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'משתמש'

  return (
    <div className="min-h-screen bg-stone-50 flex" dir="rtl">
      
      {/* ===== SIDEBAR ===== */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 right-0 h-full w-64 bg-white border-l border-stone-100 shadow-lg z-50
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-stone-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-champagne-400 to-champagne-600 rounded-xl flex items-center justify-center shadow-md">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display text-xl font-bold text-dark-brown">MarryME</span>
          </Link>
        </div>

        {/* Event selector */}
        {event ? (
          <div className="mx-3 mt-3 p-3 bg-champagne-50 rounded-xl border border-champagne-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-champagne-200 flex items-center justify-center text-sm">
                  💍
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-brown font-hebrew truncate max-w-28">{event.name}</p>
                  <p className="text-xs text-stone-500 font-hebrew flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {event.date ? new Date(event.date).toLocaleDateString('he-IL') : '—'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400" />
            </div>
          </div>
        ) : (
          <Link
            href="/dashboard"
            className="mx-3 mt-3 p-3 bg-champagne-50 border-2 border-dashed border-champagne-300 rounded-xl flex items-center gap-2 text-champagne-600 hover:bg-champagne-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-hebrew font-semibold">צור אירוע ראשון</span>
          </Link>
        )}

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1 mt-2 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={isActive(href, exact) ? 'nav-item-active' : 'nav-item'}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom: settings + user */}
        <div className="p-3 border-t border-stone-100 space-y-1">
          <Link href="/dashboard/settings" className="nav-item">
            <Settings className="w-5 h-5" />
            הגדרות
          </Link>

          <div className="flex items-center gap-3 p-3 rounded-xl mt-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-champagne-300 to-champagne-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-dark-brown font-hebrew truncate">{displayName}</p>
              <p className="text-xs text-stone-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-stone-400 hover:text-red-500 transition-colors"
              title="התנתק"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-stone-100 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb */}
            <div className="font-hebrew text-sm text-stone-500">
              <span className="text-dark-brown font-bold">
                {NAV_ITEMS.find(n => isActive(n.href, n.exact))?.label || 'לוח בקרה'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-champagne-500 rounded-full" />
            </button>

            {/* New event button */}
            <Link href="/dashboard" className="btn-primary py-2 text-sm hidden sm:inline-flex">
              <Plus className="w-4 h-4" />
              אירוע חדש
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  )
}
