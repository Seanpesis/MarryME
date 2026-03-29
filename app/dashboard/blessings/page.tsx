'use client'

import { useState, useEffect } from 'react'
import { Heart, Trash2, Search, Loader2, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

export default function BlessingsPage() {
  const [blessings, setBlessings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [eventId, setEventId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const id = localStorage.getItem('activeEventId') || ''
    setEventId(id)
    if (id) load(id)
  }, [])

  const load = async (id: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('blessings')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false })
    setBlessings(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק ברכה זו?')) return
    await supabase.from('blessings').delete().eq('id', id)
    toast.success('נמחק')
    load(eventId)
  }

  const filtered = blessings.filter(b =>
    !search || b.author_name.includes(search) || b.message.includes(search)
  )

  // Colour palette for blessing cards
  const cardColors = [
    'bg-champagne-50 border-champagne-200',
    'bg-sage-50 border-sage-200',
    'bg-blush-50 border-blush-200',
    'bg-violet-50 border-violet-200',
    'bg-amber-50 border-amber-200',
    'bg-blue-50 border-blue-200',
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-brown flex items-center gap-2">
            <Heart className="w-6 h-6 text-blush-500 fill-blush-500" />
            ברכות מהאורחים
          </h1>
          <p className="text-stone-500 font-hebrew text-sm mt-1">
            {blessings.length} ברכות נכתבו עבורכם
          </p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש ברכות..."
            className="input-field pr-10 py-2 text-sm w-56"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-champagne-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="text-6xl opacity-30">💌</div>
          <p className="font-hebrew text-stone-400 text-lg font-bold">
            {blessings.length === 0 ? 'עדיין אין ברכות' : 'לא נמצאו תוצאות'}
          </p>
          {blessings.length === 0 && (
            <p className="text-stone-300 font-hebrew text-sm max-w-xs mx-auto">
              ברכות יופיעו כאן כשאורחים יכתבו דרך אתר האירוע שלכם
            </p>
          )}
        </div>
      ) : (
        /* Masonry-like grid */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((b, i) => (
            <div
              key={b.id}
              className={`break-inside-avoid rounded-2xl border-2 p-5 ${cardColors[i % cardColors.length]} group relative`}
              style={{ animation: `slideUp 0.4s ease-out ${i * 0.05}s both` }}
            >
              {/* Quote mark */}
              <div className="text-4xl text-stone-200 font-display leading-none mb-2 select-none">"</div>

              {/* Message */}
              <p className="font-hebrew text-stone-700 leading-relaxed text-sm mb-4 whitespace-pre-wrap">
                {b.message}
              </p>

              {/* Author + date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-champagne-300 to-champagne-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {b.author_name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-600 font-hebrew">{b.author_name}</p>
                    <p className="text-xs text-stone-400">
                      {new Date(b.created_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-300 hover:text-red-400 hover:bg-white/50 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
