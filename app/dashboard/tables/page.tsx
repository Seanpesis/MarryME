'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, Trash2, Edit2, X, Check, Loader2, LayoutGrid } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

function TableModal({ table, eventId, onClose, onSaved }: any) {
  const [form, setForm] = useState({ name: table?.name||'', capacity: String(table?.capacity||10), shape: table?.shape||'round', notes: table?.notes||'' })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const payload = { event_id: eventId, name: form.name, capacity: parseInt(form.capacity)||10, shape: form.shape as any, notes: form.notes }
    const { error } = table?.id
      ? await supabase.from('tables').update(payload).eq('id', table.id)
      : await supabase.from('tables').insert(payload)
    if (error) { toast.error('שגיאה'); setLoading(false); return }
    toast.success('נשמר ✓'); onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-sm">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-bold text-dark-brown font-hebrew">{table?.id ? 'עריכת שולחן' : 'שולחן חדש'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">שם *</label>
            <input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required className="input-field" placeholder="שולחן 1"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">קיבולת</label>
              <input type="number" value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))} min="1" max="50" className="input-field" dir="ltr"/>
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">צורה</label>
              <select value={form.shape} onChange={e=>setForm(f=>({...f,shape:e.target.value}))} className="input-field">
                <option value="round">עגול</option>
                <option value="rectangle">מלבני</option>
                <option value="oval">אובלי</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">הערות</label>
            <input type="text" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className="input-field"/>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">ביטול</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading?<Loader2 className="w-4 h-4 animate-spin"/>:<Check className="w-4 h-4"/>}שמור
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BulkCreateModal({ eventId, onClose, onCreated }: any) {
  const [count, setCount] = useState('10')
  const [capacity, setCapacity] = useState('10')
  const [prefix, setPrefix] = useState('שולחן')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCreate = async () => {
    setLoading(true)
    const tables = Array.from({length:parseInt(count)||10},(_,i)=>({event_id:eventId,name:`${prefix} ${i+1}`,capacity:parseInt(capacity)||10,shape:'round'}))
    const {error} = await supabase.from('tables').insert(tables)
    if(error){toast.error('שגיאה');setLoading(false);return}
    toast.success(`✅ ${count} שולחנות נוצרו!`); onCreated()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-sm">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-bold text-dark-brown font-hebrew">יצירת שולחנות בכמות</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">קידומת</label>
            <input type="text" value={prefix} onChange={e=>setPrefix(e.target.value)} className="input-field"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">כמות</label>
              <input type="number" value={count} onChange={e=>setCount(e.target.value)} min="1" max="50" className="input-field" dir="ltr"/>
            </div>
            <div>
              <label className="block text-sm font-semibold font-hebrew text-stone-700 mb-1.5">קיבולת כ"א</label>
              <input type="number" value={capacity} onChange={e=>setCapacity(e.target.value)} min="1" max="50" className="input-field" dir="ltr"/>
            </div>
          </div>
          <div className="bg-champagne-50 rounded-xl p-3 text-xs font-hebrew text-champagne-700">
            ייצור: {prefix} 1 עד {prefix} {count} — {capacity} מקומות כל שולחן
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">ביטול</button>
            <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1 justify-center">
              {loading?<Loader2 className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4"/>}צור
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

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
    const [{data:tbls},{data:gs}] = await Promise.all([
      supabase.from('tables').select('*').eq('event_id',eid).order('name'),
      supabase.from('guests').select('*').eq('event_id',eid).eq('status','confirmed').order('name'),
    ])
    setTables(tbls||[]); setGuests(gs||[]); setLoading(false)
  }, [eventId])

  const onDragEnd = async (result: DropResult) => {
    const {source, destination, draggableId} = result
    if (!destination || source.droppableId === destination.droppableId) return
    const newTableId = destination.droppableId === 'unassigned' ? null : destination.droppableId
    setGuests(prev => prev.map(g => g.id===draggableId ? {...g, table_id:newTableId} : g))
    const {error} = await supabase.from('guests').update({table_id:newTableId}).eq('id',draggableId)
    if (error) { toast.error('שגיאה'); loadData() }
    else {
      const g = guests.find(g=>g.id===draggableId)
      const t = tables.find(t=>t.id===newTableId)
      if (g && t) toast.success(`${g.name} → ${t.name} ✓`)
      else if (g && !newTableId) toast(`${g.name} הוסר מהשולחן`, {icon:'↩️'})
    }
  }

  const handleDeleteTable = async (id: string) => {
    if (!confirm('למחוק שולחן זה?')) return
    await supabase.from('guests').update({table_id:null}).eq('table_id',id)
    await supabase.from('tables').delete().eq('id',id)
    toast.success('שולחן נמחק'); loadData()
  }

  const unassigned = guests.filter(g => !g.table_id)
  const filteredUnassigned = unassigned.filter(g => !searchGuest || g.name.includes(searchGuest))
  const totalSeats = tables.reduce((a,t)=>a+t.capacity,0)
  const usedSeats = guests.filter(g=>g.table_id).reduce((a,g)=>a+(g.party_size||1),0)

  return (
    <>
      {(showTableModal||editTable) && (
        <TableModal table={editTable} eventId={eventId}
          onClose={()=>{setShowTableModal(false);setEditTable(null)}}
          onSaved={()=>{setShowTableModal(false);setEditTable(null);loadData()}}/>
      )}
      {showBulkModal && (
        <BulkCreateModal eventId={eventId}
          onClose={()=>setShowBulkModal(false)}
          onCreated={()=>{setShowBulkModal(false);loadData()}}/>
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto" dir="rtl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-dark-brown">סידורי הושבה</h1>
            <p className="text-stone-500 font-hebrew text-sm mt-0.5">גרור ושחרר אורחים לשולחנות</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setShowBulkModal(true)} className="btn-secondary text-sm py-2">
              <LayoutGrid className="w-4 h-4"/>כמות
            </button>
            <button onClick={()=>{setEditTable(null);setShowTableModal(true)}} className="btn-primary text-sm py-2">
              <Plus className="w-4 h-4"/>שולחן חדש
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            {label:'שולחנות', value:tables.length, icon:'🪑', extra:''},
            {label:'ניצול מקומות', value:`${usedSeats}/${totalSeats}`, icon:'👥', extra:''},
            {label:'לא משובצים', value:unassigned.length, icon:unassigned.length>0?'⚠️':'✅', extra:''},
          ].map(s=>(
            <div key={s.label} className={`bg-white rounded-xl p-3 text-center border ${unassigned.length>0&&s.icon==='⚠️'?'border-amber-200 bg-amber-50':'border-stone-100'}`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <p className="text-lg font-bold font-display text-dark-brown">{s.value}</p>
              <p className="text-xs text-stone-500 font-hebrew">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-champagne-500"/></div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid lg:grid-cols-4 gap-5">

              {/* Unassigned panel */}
              <div className="lg:col-span-1">
                <div className="card sticky top-20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-dark-brown font-hebrew text-sm">לא משובצים</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-hebrew font-bold ${unassigned.length>0?'bg-amber-100 text-amber-700':'bg-sage-100 text-sage-700'}`}>{unassigned.length}</span>
                  </div>
                  <input type="text" value={searchGuest} onChange={e=>setSearchGuest(e.target.value)} placeholder="חפש..." className="input-field py-2 text-xs mb-3"/>
                  <Droppable droppableId="unassigned">
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}
                        className={`min-h-16 space-y-1.5 rounded-xl p-2 transition-colors ${snapshot.isDraggingOver?'bg-champagne-50 border-2 border-dashed border-champagne-300':'border-2 border-dashed border-stone-100'}`}>
                        {filteredUnassigned.length===0 && !snapshot.isDraggingOver && (
                          <p className="text-xs text-stone-300 font-hebrew text-center py-3">{unassigned.length===0?'🎉 הכל משובץ!':'לא נמצא'}</p>
                        )}
                        {filteredUnassigned.map((g,index)=>(
                          <Draggable key={g.id} draggableId={g.id} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-hebrew cursor-grab active:cursor-grabbing select-none transition-all ${snapshot.isDragging?'bg-champagne-100 shadow-lg border border-champagne-300 rotate-1':'bg-white border border-stone-200 hover:border-champagne-300 hover:bg-champagne-50'}`}>
                                <div className="w-6 h-6 rounded-full bg-champagne-200 flex items-center justify-center text-xs font-bold text-champagne-800 shrink-0">{g.name[0]}</div>
                                <span className="truncate font-semibold text-stone-700">{g.name}</span>
                                {g.party_size>1&&<span className="shrink-0 text-stone-400">×{g.party_size}</span>}
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
                {tables.length===0?(
                  <div className="text-center py-16 text-stone-400">
                    <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                    <p className="font-hebrew text-lg">אין שולחנות</p>
                    <div className="flex gap-3 justify-center mt-4">
                      <button onClick={()=>setShowBulkModal(true)} className="btn-secondary text-sm"><LayoutGrid className="w-4 h-4"/>כמות</button>
                      <button onClick={()=>setShowTableModal(true)} className="btn-primary text-sm"><Plus className="w-4 h-4"/>ראשון</button>
                    </div>
                  </div>
                ):(
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tables.map(table=>{
                      const tGuests = guests.filter(g=>g.table_id===table.id)
                      const used = tGuests.reduce((a,g)=>a+(g.party_size||1),0)
                      const pct = Math.min((used/table.capacity)*100,100)
                      const isFull = used>=table.capacity
                      const isOver = used>table.capacity
                      return (
                        <Droppable key={table.id} droppableId={table.id}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}
                              className={`rounded-2xl border-2 p-4 min-h-28 transition-all ${snapshot.isDraggingOver?'border-champagne-400 bg-champagne-50 shadow-md':isOver?'border-red-300 bg-red-50/50':isFull?'border-amber-200 bg-amber-50/30':'border-stone-200 bg-white hover:border-champagne-200'}`}>
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 ${table.shape==='round'?'rounded-full':table.shape==='oval'?'rounded-[50%]':'rounded-xl'} flex items-center justify-center text-white text-xs font-bold shadow-sm ${isOver?'bg-red-500':isFull?'bg-amber-500':'bg-champagne-500'}`}>
                                    {String(table.name).replace(/[^\d]/g,'')||'?'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-dark-brown font-hebrew text-sm">{table.name}</p>
                                    <p className={`text-xs font-hebrew ${isOver?'text-red-500 font-bold':isFull?'text-amber-600':'text-stone-400'}`}>{used}/{table.capacity}{isOver?' ⚠️':''}</p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={()=>{setEditTable(table);setShowTableModal(true)}} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-champagne-600 transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                                  <button onClick={()=>handleDeleteTable(table.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                                </div>
                              </div>
                              <div className="h-1 bg-stone-100 rounded-full mb-3">
                                <div className={`h-full rounded-full transition-all ${isOver?'bg-red-500':isFull?'bg-amber-500':'bg-champagne-500'}`} style={{width:`${pct}%`}}/>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {tGuests.map((g,index)=>(
                                  <Draggable key={g.id} draggableId={g.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-hebrew cursor-grab active:cursor-grabbing select-none ${snapshot.isDragging?'bg-champagne-200 shadow-md border border-champagne-400':'bg-champagne-50 border border-champagne-200 text-champagne-800 hover:bg-champagne-100'}`}>
                                        {g.name}{g.party_size>1&&<span className="text-champagne-500 text-xs">×{g.party_size}</span>}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {tGuests.length===0&&<p className="text-xs text-stone-300 font-hebrew w-full text-center py-1">גרור לכאן</p>}
                              </div>
                              {provided.placeholder}
                              {table.notes&&<p className="text-xs text-stone-400 font-hebrew mt-2 italic">{table.notes}</p>}
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
