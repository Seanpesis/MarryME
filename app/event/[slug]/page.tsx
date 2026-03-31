import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import PublicEventClient from './client'
import { Loader2 } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: event } = await supabase
    .from('events')
    .select('name, bride_name, groom_name, date, venue')
    .ilike('id', `${params.slug}%`)
    .single()

  if (!event) return { title: 'אירוע' }

  return {
    title: event.name || `חתונת ${event.bride_name} ו${event.groom_name}`,
    description: `${event.venue} • ${event.date ? new Date(event.date).toLocaleDateString('he-IL') : ''}`,
    openGraph: {
      title: event.name,
      description: `הוזמנת לחתונה! ${event.venue}`,
    }
  }
}

export default async function PublicEventPage({ params }: Props) {
  const supabase = createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .ilike('id', `${params.slug}%`)
    .single()

  if (!event) notFound()

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <Loader2 className="w-8 h-8 animate-spin text-champagne-500" />
      </div>
    }>
      <PublicEventClient event={event} />
    </Suspense>
  )
}
