'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

interface RealtimeStats {
  confirmed: number
  pending: number
  declined: number
  total: number
  lastUpdate: Date | null
}

interface RealtimeContextValue {
  stats: RealtimeStats
  isConnected: boolean
}

const RealtimeContext = createContext<RealtimeContextValue>({
  stats: { confirmed: 0, pending: 0, declined: 0, total: 0, lastUpdate: null },
  isConnected: false,
})

export function useRealtimeStats() {
  return useContext(RealtimeContext)
}

export function RealtimeProvider({ children, eventId }: { children: ReactNode; eventId: string }) {
  const [stats, setStats] = useState<RealtimeStats>({
    confirmed: 0, pending: 0, declined: 0, total: 0, lastUpdate: null
  })
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()

  const loadStats = useCallback(async () => {
    if (!eventId) return
    const { data } = await supabase
      .from('guests')
      .select('status')
      .eq('event_id', eventId)

    if (data) {
      setStats({
        confirmed: data.filter(g => g.status === 'confirmed').length,
        pending: data.filter(g => g.status === 'pending').length,
        declined: data.filter(g => g.status === 'declined').length,
        total: data.length,
        lastUpdate: new Date(),
      })
    }
  }, [eventId])

  useEffect(() => {
    if (!eventId) return
    loadStats()

    const channel = supabase
      .channel(`event-${eventId}-guests`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests', filter: `event_id=eq.${eventId}` },
        (payload) => {
          const newRecord = payload.new as any
          const oldRecord = payload.old as any

          // Show notification for new confirmations
          if (payload.eventType === 'UPDATE' && oldRecord?.status !== 'confirmed' && newRecord?.status === 'confirmed') {
            toast.success(`🎉 ${newRecord.name} אישר/ה הגעה!`, {
              duration: 5000,
              icon: '✅',
            })
          }
          if (payload.eventType === 'UPDATE' && oldRecord?.status !== 'declined' && newRecord?.status === 'declined') {
            toast(`😔 ${newRecord.name} לא יוכל/תוכל להגיע`, {
              duration: 4000,
              icon: '❌',
            })
          }

          // Reload stats
          loadStats()
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, loadStats])

  return (
    <RealtimeContext.Provider value={{ stats, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  )
}

// Realtime status indicator — self-contained, no provider needed
export function RealtimeIndicator() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const eventId = localStorage.getItem('activeEventId')
    if (!eventId) return

    const channel = supabase
      .channel(`indicator-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests', filter: `event_id=eq.${eventId}` }, () => {})
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="flex items-center gap-2 text-xs font-hebrew" title={isConnected ? 'מחובר בזמן אמת' : 'מתחבר...'}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-sage-500 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
      <span className={isConnected ? 'text-sage-600' : 'text-amber-500'}>
        {isConnected ? 'עדכונים בזמן אמת' : 'מתחבר...'}
      </span>
    </div>
  )
}
