'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, Trash2, Edit2, X, Check, Loader2, LayoutGrid, Circle, Square, RectangleHorizontal, AlignJustify } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

/* ─── Table 3D Visual ─── */
function TableVisual({ table, tableGuests }: { table: any; tableGuests: any[] }) {
  const capacity = Math.max(1, table.capacity || 8)
  const shape = table.shape || 'round'

  const guestAtSeat = (seat: number) => tableGuests.find(g => g.seat_number === seat)

  const renderChair = (seat: number, cx: number, cy: number, angleDeg: number) => {
    const guest = guestAtSeat(seat)
    const initials = guest
      ? guest.name.replace(/\s+/g, '').substring(0, 2)
      : ''
    const filled = !!guest
    const rad = angleDeg * (Math.PI / 180)
    const cw = 22, ch = 14

    return (
      <g key={seat} transform={`translate(${cx},${cy}) rotate(${angleDeg})`}>
        {/* Chair back */}
        <rect
          x={-cw / 2} y={-ch / 2 - 5}
          width={cw} height={6}
          rx={3}
          fill={filled ? '#a35c19' : '#c8bfb5'}
          stroke={filled ? '#7a4010' : '#a09890'}
          strokeWidth={1}
        />
        {/* Chair seat */}
        <rect
          x={-cw / 2} y={-ch / 2}
          width={cw} height={ch}
          rx={4}
          fill={filled ? '#dc9229' : '#e2dbd3'}
          stroke={filled ? '#a35c19' : '#b5ada5'}
          strokeWidth={1.2}
        />
        {filled ? (
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={7}
            fontWeight="bold"
            fill="white"
            y={1}
          >{initials}</text>
        ) : (
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={6.5}
            fill="#9c9289"
            y={1}
          >{seat}</text>
        )}
      </g>
    )
  }

  if (shape === 'round' || shape === 'oval') {
    const svgW = 240, svgH = 210
    const cx = svgW / 2, cy = svgH / 2
    const tableR = Math.min(52, Math.max(30, 52 - (capacity > 12 ? 4 : 0)))
    const chairR = tableR + 28

    const chairs = Array.from({ length: capacity }, (_, i) => {
      const angle = (360 / capacity) * i - 90
      const rad = angle * (Math.PI / 180)
      const x = cx + chairR * Math.cos(rad)
      const y = cy + chairR * Math.sin(rad)
      return renderChair(i + 1, x, y, angle + 90)
    })

    return (
      <div style={{ perspective: '500px', perspectiveOrigin: 'center 30%' }}>
        <div style={{ transform: 'rotateX(18deg)', transformOrigin: 'center bottom' }}>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-h-48">
            <defs>
              <radialGradient id={`woodR-${table.id}`} cx="40%" cy="35%">
                <stop offset="0%" stopColor="#d9a86c" />
                <stop offset="60%" stopColor="#b07a3a" />
                <stop offset="100%" stopColor="#7a4f1e" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx={cx} cy={cy + 4} rx={tableR + 3} ry={tableR + 3} fill="rgba(0,0,0,0.12)" />
            {/* Table surface */}
            <circle cx={cx} cy={cy} r={tableR} fill={`url(#woodR-${table.id})`} stroke="#7a4f1e" strokeWidth={2} />
            {/* Sheen */}
            <ellipse cx={cx - tableR * 0.2} cy={cy - tableR * 0.25} rx={tableR * 0.35} ry={tableR * 0.2} fill="rgba(255,255,255,0.12)" />
            {/* Ring */}
            <circle cx={cx} cy={cy} r={tableR - 8} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
            {chairs}
          </svg>
        </div>
      </div>
    )
  }

  if (shape === 'long') {
    const svgW = 320, svgH = 200
    const cx = svgW / 2, cy = svgH / 2
    const tw = 200, th = 52
    const tx = cx - tw / 2, ty = cy - th / 2
    const perSide = Math.ceil(capacity / 2)
    const spacing = tw / perSide

    let seat = 1
    const chairs: React.ReactNode[] = []
    for (let i = 0; i < perSide && seat <= capacity; i++, seat++) {
      chairs.push(renderChair(seat, tx + spacing * (i + 0.5), ty - 18, 0))
    }
    for (let i = 0; i < perSide && seat <= capacity; i++, seat++) {
      chairs.push(renderChair(seat, tx + spacing * (i + 0.5), ty + th + 18, 180))
    }

    return (
      <div style={{ perspective: '500px', perspectiveOrigin: 'center 30%' }}>
        <div style={{ transform: 'rotateX(18deg)', transformOrigin: 'center bottom' }}>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-h-40">
            <defs>
              <linearGradient id={`woodL-${table.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d9a86c" />
                <stop offset="100%" stopColor="#7a4f1e" />
              </linearGradient>
            </defs>
            <rect x={tx + 2} y={ty + 4} width={tw} height={th} rx={6} fill="rgba(0,0,0,0.12)" />
            <rect x={tx} y={ty} width={tw} height={th} rx={6} fill={`url(#woodL-${table.id})`} stroke="#7a4f1e" strokeWidth={2} />
            <rect x={tx + 8} y={ty + 6} width={tw - 16} height={th - 12} rx={3} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            {chairs}
          </svg>
        </div>
      </div>
    )
  }

  // rectangle or square
  const isSquare = shape === 'square'
  const svgW = 260, svgH = 220
  const cx = svgW / 2, cy = svgH / 2
  const tw = isSquare ? 90 : 140, th = isSquare ? 90 : 70
  const tx = cx - tw / 2, ty = cy - th / 2

  const topCount = Math.ceil(capacity / 4)
  const bottomCount = Math.floor(capacity / 4)
  const leftCount = Math.floor((capacity - topCount - bottomCount) / 2)
  const rightCount = capacity - topCount - bottomCount - leftCount

  let seat = 1
  const chairs: React.ReactNode[] = []
  for (let i = 0; i < topCount && seat <= capacity; i++, seat++)
    chairs.push(renderChair(seat, tx + (tw / (topCount + 1)) * (i + 1), ty - 18, 0))
  for (let i = 0; i < rightCount && seat <= capacity; i++, seat++)
    chairs.push(renderChair(seat, tx + tw + 18, ty + (th / (rightCount + 1)) * (i + 1), 90))
  for (let i = 0; i < bottomCount && seat <= capacity; i++, seat++)
    chairs.push(renderChair(seat, tx + (tw / (bottomCount + 1)) * (i + 1), ty + th + 18, 180))
  for (let i = 0; i < leftCount && seat <= capacity; i++, seat++)
    chairs.push(renderChair(seat, tx - 18, ty + (th / (leftCount + 1)) * (i + 1), 270))

  return (
    <div style={{ perspective: '500px', perspectiveOrigin: 'center 30%' }}>
      <div style={{ transform: 'rotateX(18deg)', transformOrigin: 'center bottom' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-h-48">
          <defs>
            <linearGradient id={`woodS-${table.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d9a86c" />
              <stop offset="100%" stopColor="#7a4f1e" />
            </linearGradient>
          </defs>
          <rect x={tx + 3} y={ty + 4} width={tw} height={th} rx={8} fill="rgba(0,0,0,0.12)" />
          <rect x={tx} y={ty} width={tw} height={th} rx={8} fill={`url(#woodS-${table.id})`} stroke="#7a4f1e" strokeWidth={2} />
          <rect x={tx + 8} y={ty + 6} width={tw - 16} height={th - 12} rx={4} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          {chairs}
        </svg>
      </div>
    </div>
  )
}

/* ─── Shape Icons ─── */
const SHAPES = [
  { value: 'round', label: 'עגול', icon: Circle },
  { value: 'square', label: 'מרובע', icon: Square },
  { value: 'rectangle', label: 'מלבני', icon: RectangleHorizontal },
  { value: 'long', label: 'ארוך', icon: AlignJustify },
]

/* ─── TableModal ─── */
function TableModal({ table, eventId, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    name: table?.name || '',
    capacity: String(table?.capacity || 8),
    shape: table?.shape || 'round',
    notes: table?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      event_id: eventId,
      name: form.name,
      capacity: parseInt(form.capacity) || 8,
      shape: form.shape,
      notes: form.notes,
    }
    const { error } = table?.id
      ? await supabase.from('tables').update(payload).eq('id', table.id)
      : await supabase.from('tables').insert(payload)
    if (error) { toast.error('שגיאה בשמירה'); setLoading(false); return }
    toast.success('נשמר ✓')
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-md">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-dark-brown">{table?.id ? 'עריכת שולחן' : 'שולחן חדש'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם השולחן *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="input-field" placeholder="שולחן 1" />
          </div>

          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">מספר כיסאות</label>
            <input
              type="number" value={form.capacity}
              onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
              min="1" max="30" className="input-field" dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-2">צורת השולחן</label>
            <div className="grid grid-cols-4 gap-2">
              {SHAPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value} type="button"
                  onClick={() => setForm(f => ({ ...f, shape: value }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    form.shape === value
                      ? 'border-champagne-500 bg-champagne-50 text-champagne-700'
                      : 'border-stone-200 hover:border-champagne-300 text-stone-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-hebrew font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-stone-50 rounded-2xl p-3">
            <p className="text-xs text-stone-400 font-hebrew text-center mb-2">תצוגה מקדימה</p>
            <TableVisual
              table={{ ...form, id: 'preview', capacity: parseInt(form.capacity) || 8 }}
              tableGuests={[]}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">הערות</label>
            <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" placeholder="הערות אופציונליות" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">ביטול</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}שמור
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── BulkCreateModal ─── */
function BulkCreateModal({ eventId, onClose, onCreated }: any) {
  const [count, setCount] = useState('10')
  const [capacity, setCapacity] = useState('8')
  const [prefix, setPrefix] = useState('שולחן')
  const [shape, setShape] = useState('round')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCreate = async () => {
    setLoading(true)
    const tables = Array.from({ length: parseInt(count) || 10 }, (_, i) => ({
      event_id: eventId,
      name: `${prefix} ${i + 1}`,
      capacity: parseInt(capacity) || 8,
      shape,
    }))
    const { error } = await supabase.from('tables').insert(tables)
    if (error) { toast.error('שגיאה'); setLoading(false); return }
    toast.success(`✅ ${count} שולחנות נוצרו!`)
    onCreated()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-sm">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-dark-brown">יצירת שולחנות בכמות</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">קידומת שם</label>
            <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">כמות שולחנות</label>
              <input type="number" value={count} onChange={e => setCount(e.target.value)} min="1" max="50" className="input-field" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">כיסאות לשולחן</label>
              <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} min="1" max="30" className="input-field" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-2">צורה</label>
            <div className="grid grid-cols-4 gap-2">
              {SHAPES.map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" onClick={() => setShape(value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-hebrew ${
                    shape === value ? 'border-champagne-500 bg-champagne-50 text-champagne-700' : 'border-stone-200 text-stone-500'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-champagne-50 rounded-xl p-3 text-xs font-hebrew text-champagne-700">
            ייצור: {prefix} 1 עד {prefix} {count} — {capacity} כיסאות כל שולחן
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">ביטול</button>
            <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}צור
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showTableModal, setShowTableModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editTable, setEditTable] = useState<any>(null)
  const [searchGuest, setSearchGuest] = useState('')
  const [eventId, setEventId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const id = localStorage.getItem('activeEventId') || ''
    setEventId(id)
    if (id) loadData(id)
  }, [])

  const loadData = useCallback(async (id?: string) => {
    const eid = id || eventId
    if (!eid) return
    setLoading(true)
    const [{ data: tbls }, { data: gs }] = await Promise.all([
      supabase.from('tables').select('*').eq('event_id', eid).order('name'),
      supabase.from('guests').select('*').eq('event_id', eid).eq('status', 'confirmed').order('name'),
    ])
    setTables(tbls || [])
    setGuests(gs || [])
    setLoading(false)
  }, [eventId])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination || source.droppableId === destination.droppableId) return

    const newTableId = destination.droppableId === 'unassigned' ? null : destination.droppableId

    let nextSeat: number | null = null
    if (newTableId) {
      const table = tables.find(t => t.id === newTableId)
      const cap = table?.capacity || 10
      const occupied = guests
        .filter(g => g.table_id === newTableId && g.id !== draggableId)
        .map(g => g.seat_number)
        .filter(Boolean) as number[]
      for (let s = 1; s <= cap; s++) {
        if (!occupied.includes(s)) { nextSeat = s; break }
      }
      if (!nextSeat) nextSeat = occupied.length + 1
    }

    setGuests(prev =>
      prev.map(g =>
        g.id === draggableId
          ? { ...g, table_id: newTableId, seat_number: newTableId ? nextSeat : null }
          : g
      )
    )

    const { error } = await supabase
      .from('guests')
      .update({ table_id: newTableId, seat_number: newTableId ? nextSeat : null })
      .eq('id', draggableId)

    if (error) {
      toast.error('שגיאה')
      loadData()
    } else {
      const g = guests.find(g => g.id === draggableId)
      const t = tables.find(t => t.id === newTableId)
      if (g && t) toast.success(`${g.name} → ${t.name} (כיסא ${nextSeat}) ✓`)
      else if (g && !newTableId) toast(`${g.name} הוסר מהשולחן`, { icon: '↩️' })
    }
  }

  const handleDeleteTable = async (id: string) => {
    if (!confirm('למחוק שולחן זה?')) return
    await supabase.from('guests').update({ table_id: null, seat_number: null }).eq('table_id', id)
    await supabase.from('tables').delete().eq('id', id)
    toast.success('שולחן נמחק')
    loadData()
  }

  const unassigned = guests.filter(g => !g.table_id)
  const filteredUnassigned = unassigned.filter(g => !searchGuest || g.name.includes(searchGuest))
  const totalSeats = tables.reduce((a, t) => a + t.capacity, 0)
  const assignedCount = guests.filter(g => g.table_id).length

  const shapeLabel = (shape: string) => {
    const s = SHAPES.find(s => s.value === shape)
    return s ? s.label : shape
  }

  return (
    <>
      {(showTableModal || editTable) && (
        <TableModal
          table={editTable} eventId={eventId}
          onClose={() => { setShowTableModal(false); setEditTable(null) }}
          onSaved={() => { setShowTableModal(false); setEditTable(null); loadData() }}
        />
      )}
      {showBulkModal && (
        <BulkCreateModal
          eventId={eventId}
          onClose={() => setShowBulkModal(false)}
          onCreated={() => { setShowBulkModal(false); loadData() }}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-dark-brown">סידורי הושבה</h1>
            <p className="text-stone-500 font-hebrew text-sm mt-0.5">תצוגה תלת-ממדית של שולחנות וכיסאות — גרור ושחרר אורחים</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowBulkModal(true)} className="btn-secondary text-sm py-2">
              <LayoutGrid className="w-4 h-4" />כמות
            </button>
            <button onClick={() => { setEditTable(null); setShowTableModal(true) }} className="btn-primary text-sm py-2">
              <Plus className="w-4 h-4" />שולחן חדש
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'שולחנות', value: tables.length, icon: '🪑' },
            { label: 'משובצים', value: `${assignedCount}/${guests.length}`, icon: '👥' },
            { label: 'לא משובצים', value: unassigned.length, icon: unassigned.length > 0 ? '⚠️' : '✅' },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl p-3 text-center border shadow-sm ${
              s.icon === '⚠️' ? 'border-amber-200 bg-amber-50' : 'border-stone-100'
            }`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-lg font-bold font-display text-dark-brown">{s.value}</p>
              <p className="text-xs text-stone-500 font-hebrew">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-champagne-500" />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid lg:grid-cols-4 gap-5">

              {/* Unassigned panel */}
              <div className="lg:col-span-1">
                <div className="card sticky top-20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-dark-brown font-hebrew text-sm">לא משובצים</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-hebrew font-bold ${
                      unassigned.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-sage-100 text-sage-700'
                    }`}>{unassigned.length}</span>
                  </div>
                  <input
                    type="text" value={searchGuest}
                    onChange={e => setSearchGuest(e.target.value)}
                    placeholder="חפש אורח..." className="input-field py-2 text-xs mb-3"
                  />
                  <Droppable droppableId="unassigned">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef} {...provided.droppableProps}
                        className={`min-h-16 space-y-1.5 rounded-xl p-2 transition-colors ${
                          snapshot.isDraggingOver
                            ? 'bg-champagne-50 border-2 border-dashed border-champagne-300'
                            : 'border-2 border-dashed border-stone-100'
                        }`}
                      >
                        {filteredUnassigned.length === 0 && !snapshot.isDraggingOver && (
                          <p className="text-xs text-stone-300 font-hebrew text-center py-3">
                            {unassigned.length === 0 ? '🎉 הכל משובץ!' : 'לא נמצא'}
                          </p>
                        )}
                        {filteredUnassigned.map((g, index) => (
                          <Draggable key={g.id} draggableId={g.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-hebrew cursor-grab active:cursor-grabbing select-none transition-all ${
                                  snapshot.isDragging
                                    ? 'bg-champagne-100 shadow-lg border border-champagne-300 rotate-1'
                                    : 'bg-white border border-stone-200 hover:border-champagne-300 hover:bg-champagne-50'
                                }`}
                              >
                                <div className="w-6 h-6 rounded-full bg-champagne-200 flex items-center justify-center text-xs font-bold text-champagne-800 shrink-0">
                                  {g.name[0]}
                                </div>
                                <span className="truncate font-semibold text-stone-700">{g.name}</span>
                                {g.party_size > 1 && <span className="shrink-0 text-stone-400">×{g.party_size}</span>}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>

              {/* Tables grid */}
              <div className="lg:col-span-3">
                {tables.length === 0 ? (
                  <div className="text-center py-16 text-stone-400">
                    <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-hebrew text-lg">אין שולחנות — צרו שולחנות ראשונים</p>
                    <div className="flex gap-3 justify-center mt-4">
                      <button onClick={() => setShowBulkModal(true)} className="btn-secondary text-sm">
                        <LayoutGrid className="w-4 h-4" />כמות
                      </button>
                      <button onClick={() => setShowTableModal(true)} className="btn-primary text-sm">
                        <Plus className="w-4 h-4" />ראשון
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {tables.map(table => {
                      const tGuests = guests.filter(g => g.table_id === table.id)
                      const used = tGuests.reduce((a, g) => a + (g.party_size || 1), 0)
                      const pct = Math.min((used / table.capacity) * 100, 100)
                      const isFull = used >= table.capacity
                      const isOver = used > table.capacity

                      return (
                        <Droppable key={table.id} droppableId={table.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef} {...provided.droppableProps}
                              className={`rounded-2xl border-2 p-4 transition-all ${
                                snapshot.isDraggingOver
                                  ? 'border-champagne-400 bg-champagne-50/50 shadow-md scale-[1.01]'
                                  : isOver
                                    ? 'border-red-300 bg-red-50/30'
                                    : isFull
                                      ? 'border-amber-200 bg-amber-50/30'
                                      : 'border-stone-200 bg-white hover:border-champagne-200 hover:shadow-sm'
                              }`}
                            >
                              {/* Card header */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                                    isOver ? 'bg-red-500' : isFull ? 'bg-amber-500' : 'bg-champagne-500'
                                  }`}>
                                    {String(table.name).replace(/[^\d]/g, '') || '?'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-dark-brown font-hebrew text-sm leading-tight">{table.name}</p>
                                    <p className={`text-xs font-hebrew ${isOver ? 'text-red-500 font-bold' : isFull ? 'text-amber-600' : 'text-stone-400'}`}>
                                      {shapeLabel(table.shape)} · {used}/{table.capacity}{isOver ? ' ⚠️' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => { setEditTable(table); setShowTableModal(true) }}
                                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-champagne-600 transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTable(table.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="h-1 bg-stone-100 rounded-full mb-3">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : isFull ? 'bg-amber-500' : 'bg-champagne-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>

                              {/* 3D Table Visual */}
                              <div className="mb-2">
                                <TableVisual table={table} tableGuests={tGuests} />
                              </div>

                              {/* Unassigned guests in this table (no seat_number) */}
                              {tGuests.filter(g => !g.seat_number).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-stone-100">
                                  <p className="text-xs text-stone-400 font-hebrew mb-1.5">ממתינים לשיבוץ כיסא:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {tGuests.filter(g => !g.seat_number).map((g, index) => (
                                      <Draggable key={g.id} draggableId={g.id} index={index}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-hebrew cursor-grab active:cursor-grabbing select-none ${
                                              snapshot.isDragging
                                                ? 'bg-champagne-200 shadow-md border border-champagne-400'
                                                : 'bg-champagne-50 border border-champagne-200 text-champagne-800'
                                            }`}
                                          >
                                            {g.name}
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {tGuests.length === 0 && !snapshot.isDraggingOver && (
                                <p className="text-xs text-stone-300 font-hebrew text-center py-2">גרור אורח לכאן</p>
                              )}

                              {provided.placeholder}
                              {table.notes && (
                                <p className="text-xs text-stone-400 font-hebrew mt-2 italic">{table.notes}</p>
                              )}
                            </div>
                          )}
                        </Droppable>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </DragDropContext>
        )}
      </div>
    </>
  )
}
