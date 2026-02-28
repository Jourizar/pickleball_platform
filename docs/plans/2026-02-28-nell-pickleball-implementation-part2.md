# Nell Pickleball Club — Implementation Plan (Part 2: Tasks 11–25)

> Continuation of `2026-02-28-nell-pickleball-implementation.md`

---

## Task 11: Admin Content Manager (Tiptap + site_content)

**Files:**
- Create: `app/[locale]/admin/content/page.tsx`
- Create: `components/admin/TiptapEditor.tsx`
- Create: `app/[locale]/admin/content/actions.ts`

**Step 1: Create `components/admin/TiptapEditor.tsx`**

```typescript
// components/admin/TiptapEditor.tsx
'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import { useCallback, useEffect } from 'react'
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Link2, Youtube as YoutubeIcon } from 'lucide-react'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  onBlur?: () => void
}

export function TiptapEditor({ content, onChange, onBlur }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Youtube.configure({ controls: true, width: 640, height: 360 }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onBlur: () => onBlur?.(),
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none min-h-[200px] px-4 py-3 focus:outline-none',
      },
    },
  })

  // Sync external content changes
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const addYoutube = useCallback(() => {
    const url = prompt('YouTube URL:')
    if (url) editor?.commands.setYoutubeVideo({ src: url })
  }, [editor])

  const setLink = useCallback(() => {
    const url = prompt('URL:')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
    else editor?.chain().focus().unsetLink().run()
  }, [editor])

  if (!editor) return null

  const ToolbarBtn = ({ onClick, active = false, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} title={title}
      className={`p-2 rounded transition-colors min-h-[36px] min-w-[36px] ${active ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100 text-gray-700'}`}>
      {children}
    </button>
  )

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={16} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={16} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 size={16} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 size={16} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={16} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={16} /></ToolbarBtn>
        <ToolbarBtn onClick={setLink} active={editor.isActive('link')} title="Link"><Link2 size={16} /></ToolbarBtn>
        <ToolbarBtn onClick={addYoutube} title="YouTube"><YoutubeIcon size={16} /></ToolbarBtn>
      </div>
      <EditorContent editor={editor} className="bg-white" />
    </div>
  )
}
```

**Step 2: Create `app/[locale]/admin/content/actions.ts`**

```typescript
// app/[locale]/admin/content/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertContent(page: string, section: string, key: string, value: string) {
  const supabase = createClient()
  const { error } = await supabase.from('site_content').upsert(
    { page, section, key, value, updated_at: new Date().toISOString() },
    { onConflict: 'page,section,key' }
  )
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}
```

**Step 3: Create `app/[locale]/admin/content/page.tsx`**

```typescript
// app/[locale]/admin/content/page.tsx
'use client'
import { useState, useTransition } from 'react'
import { useParams } from 'next/navigation'
import { TiptapEditor } from '@/components/admin/TiptapEditor'
import { Button } from '@/components/ui/Button'
import { upsertContent } from './actions'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

type ContentMap = Record<string, string>

export default function ContentPage() {
  const { locale } = useParams<{ locale: string }>()
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState<ContentMap>({})
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'guide'>('home')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('site_content').select('*').eq('page', activeTab).then(({ data }) => {
      const map: ContentMap = {}
      data?.forEach(row => { map[`${row.section}__${row.key}`] = row.value ?? '' })
      setContent(map)
    })
  }, [activeTab])

  const update = (section: string, key: string, value: string) => {
    setContent(prev => ({ ...prev, [`${section}__${key}`]: value }))
  }

  const save = (section: string, key: string) => {
    const value = content[`${section}__${key}`] ?? ''
    startTransition(async () => {
      const result = await upsertContent(activeTab, section, key, value)
      if (result.error) toast.error(result.error)
      else toast.success('Guardado')
    })
  }

  const Field = ({ section, key: k, label, multiline = false }: { section: string; key: string; label: string; multiline?: boolean }) => {
    const val = content[`${section}__${k}`] ?? ''
    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        {multiline ? (
          <TiptapEditor content={val} onChange={v => update(section, k, v)} onBlur={() => save(section, k)} />
        ) : (
          <input value={val} onChange={e => update(section, k, e.target.value)}
            onBlur={() => save(section, k)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-green-500 min-h-[48px]" />
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Contenido</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {(['home', 'about', 'guide'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500 hover:text-gray-800'}`}>
            {tab === 'home' ? 'Inicio' : tab === 'about' ? 'Nosotros' : 'Guía'}
          </button>
        ))}
      </div>

      {activeTab === 'home' && (
        <>
          <Field section="hero" key="title" label="Título del Hero" />
          <Field section="hero" key="subtitle" label="Subtítulo del Hero" />
          <Field section="mission" key="body" label="Texto de Misión" multiline />
          <Field section="vision" key="body" label="Texto de Visión" multiline />
        </>
      )}
      {activeTab === 'about' && (
        <>
          <Field section="story" key="body" label="Historia del Club" multiline />
          <Field section="video" key="url" label="URL del Video (YouTube)" />
        </>
      )}
      {activeTab === 'guide' && (
        <>
          <Field section="body" key="content" label="Contenido de la Guía" multiline />
          <Field section="video" key="url" label="URL del Video (YouTube)" />
        </>
      )}
    </div>
  )
}
```

**Step 4: Add Toaster to locale layout**

In `app/[locale]/layout.tsx`, add `<Toaster />` from `react-hot-toast`:

```typescript
import { Toaster } from 'react-hot-toast'
// Inside <body>:
<Toaster position="top-right" />
```

**Step 5: Verify content editing works**

```bash
npm run dev
```

Visit `/es/admin/content`. Edit mission text. Navigate to `/es` — changes should reflect immediately.

**Step 6: Commit**

```bash
git add "app/[locale]/admin/content/" "components/admin/TiptapEditor.tsx"
git commit -m "feat: add admin content manager with Tiptap editor"
```

---

## Task 12: Admin FAQ Manager (Drag-to-Reorder)

**Files:**
- Create: `app/[locale]/admin/faqs/page.tsx`
- Create: `app/[locale]/admin/faqs/actions.ts`
- Create: `components/admin/DragSortList.tsx`

**Step 1: Create `app/[locale]/admin/faqs/actions.ts`**

```typescript
// app/[locale]/admin/faqs/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFaq(question: string, answer: string) {
  const supabase = createClient()
  const { data: existing } = await supabase.from('faqs').select('display_order').order('display_order', { ascending: false }).limit(1)
  const nextOrder = (existing?.[0]?.display_order ?? 0) + 1
  const { error } = await supabase.from('faqs').insert({ question, answer, display_order: nextOrder })
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateFaq(id: string, data: { question?: string; answer?: string; is_visible?: boolean }) {
  const supabase = createClient()
  const { error } = await supabase.from('faqs').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteFaq(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('faqs').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function reorderFaqs(ids: string[]) {
  const supabase = createClient()
  const updates = ids.map((id, index) => supabase.from('faqs').update({ display_order: index + 1 }).eq('id', id))
  await Promise.all(updates)
  revalidatePath('/', 'layout')
}
```

**Step 2: Create `app/[locale]/admin/faqs/page.tsx`**

```typescript
// app/[locale]/admin/faqs/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Trash2, Eye, EyeOff, GripVertical, Plus } from 'lucide-react'
import { createFaq, updateFaq, deleteFaq, reorderFaqs } from './actions'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import toast from 'react-hot-toast'

interface Faq { id: string; question: string; answer: string; display_order: number; is_visible: boolean }

function SortableFaq({ faq, onUpdate, onDelete }: { faq: Faq; onUpdate: (id: string, data: Partial<Faq>) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: faq.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const [editing, setEditing] = useState(false)
  const [q, setQ] = useState(faq.question)
  const [a, setA] = useState(faq.answer)

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3">
      <button {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 mt-1 min-h-[48px] min-w-[24px] flex items-start justify-center pt-1">
        <GripVertical size={20} />
      </button>
      <div className="flex-1">
        {editing ? (
          <div className="space-y-2">
            <input value={q} onChange={e => setQ(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[48px]" placeholder="Pregunta" />
            <textarea value={a} onChange={e => setA(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" placeholder="Respuesta" />
            <div className="flex gap-2">
              <Button size="sm" onClick={async () => {
                await onUpdate(faq.id, { question: q, answer: a })
                setEditing(false)
              }}>Guardar</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="font-semibold text-gray-900 text-sm">{faq.question}</p>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{faq.answer}</p>
          </>
        )}
      </div>
      <div className="flex flex-col gap-1 items-end">
        <button onClick={() => setEditing(!editing)} className="p-2 text-gray-400 hover:text-gray-700 min-h-[36px]">✏️</button>
        <button onClick={() => onUpdate(faq.id, { is_visible: !faq.is_visible })} className="p-2 text-gray-400 hover:text-gray-700 min-h-[36px]">
          {faq.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button onClick={() => onDelete(faq.id)} className="p-2 text-red-400 hover:text-red-700 min-h-[36px]">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

export default function FaqsAdminPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('faqs').select('*').order('display_order').then(({ data }) => setFaqs(data ?? []))
  }, [])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = faqs.findIndex(f => f.id === active.id)
    const newIndex = faqs.findIndex(f => f.id === over.id)
    const newOrder = arrayMove(faqs, oldIndex, newIndex)
    setFaqs(newOrder)
    await reorderFaqs(newOrder.map(f => f.id))
  }

  async function handleUpdate(id: string, data: Partial<Faq>) {
    await updateFaq(id, data)
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, ...data } : f))
    toast.success('Guardado')
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta pregunta?')) return
    await deleteFaq(id)
    setFaqs(prev => prev.filter(f => f.id !== id))
    toast.success('Eliminado')
  }

  async function handleCreate() {
    if (!newQ.trim() || !newA.trim()) return
    const result = await createFaq(newQ, newA)
    if (result.error) { toast.error(result.error); return }
    const supabase = createClient()
    const { data } = await supabase.from('faqs').select('*').order('display_order')
    setFaqs(data ?? [])
    setNewQ(''); setNewA(''); setShowForm(false)
    toast.success('Pregunta agregada')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-1" /> Agregar
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
          <input value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="Pregunta"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm min-h-[48px]" />
          <textarea value={newA} onChange={e => setNewA(e.target.value)} placeholder="Respuesta" rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate}>Guardar</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={faqs.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {faqs.map(faq => (
              <SortableFaq key={faq.id} faq={faq} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
```

**Step 3: Verify FAQ manager**

```bash
npm run dev
```

Visit `/es/admin/faqs`. Add, edit, reorder, toggle visibility. Verify changes appear at `/es/guide`.

**Step 4: Commit**

```bash
git add "app/[locale]/admin/faqs/"
git commit -m "feat: add admin FAQ manager with drag-to-reorder"
```

---

## Task 13: Admin Membership Plan Manager

**Files:**
- Create: `app/[locale]/admin/plans/page.tsx`
- Create: `app/[locale]/admin/plans/actions.ts`

**Step 1: Create `app/[locale]/admin/plans/actions.ts`**

```typescript
// app/[locale]/admin/plans/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/lib/supabase/types'

type PlanInput = Omit<Tables<'membership_plans'>, 'id' | 'created_at'>

export async function upsertPlan(plan: PlanInput & { id?: string }) {
  const supabase = createClient()
  const { id, ...data } = plan
  if (id) {
    const { error } = await supabase.from('membership_plans').update(data).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('membership_plans').insert(data)
    if (error) return { error: error.message }
  }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deletePlan(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('membership_plans').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function reorderPlans(ids: string[]) {
  const supabase = createClient()
  await Promise.all(ids.map((id, index) =>
    supabase.from('membership_plans').update({ display_order: index + 1 }).eq('id', id)
  ))
  revalidatePath('/', 'layout')
}
```

**Step 2: Create `app/[locale]/admin/plans/page.tsx`**

This page provides a form to add/edit plans, drag-to-reorder, and a live preview of the MembershipCard. The full implementation follows the same pattern as the FAQ manager: fetch plans on mount, render sortable list, show edit form in a modal/inline panel, call server actions on save/delete.

Key fields to expose: name, age_range, price, benefits (textarea, one per line), thumbnail_url, badge_color (color picker `<input type="color">`), cta_label, stripe_price_id, is_active.

Live preview: import `<MembershipCard>` and render it with current form values as props.

```typescript
// app/[locale]/admin/plans/page.tsx
// (abbreviated — full structure same as FAQs page)
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MembershipCard } from '@/components/membership/MembershipCard'
import { Button } from '@/components/ui/Button'
import { upsertPlan, deletePlan, reorderPlans } from './actions'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Edit, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Tables } from '@/lib/supabase/types'

type Plan = Tables<'membership_plans'>

const EMPTY_PLAN: Omit<Plan, 'id' | 'created_at'> = {
  name: '', age_range: '', price: 0, benefits: [],
  thumbnail_url: null, badge_color: '#22c55e', cta_label: 'Suscribirse',
  is_active: true, display_order: 0, stripe_price_id: null, stripe_product_id: null,
}

export default function PlansAdminPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [editing, setEditing] = useState<(Omit<Plan, 'created_at'> | typeof EMPTY_PLAN) | null>(null)
  const [isNew, setIsNew] = useState(false)

  const loadPlans = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('membership_plans').select('*').order('display_order')
    setPlans(data ?? [])
  }
  useEffect(() => { loadPlans() }, [])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = plans.findIndex(p => p.id === active.id)
    const newIndex = plans.findIndex(p => p.id === over.id)
    const newOrder = arrayMove(plans, oldIndex, newIndex)
    setPlans(newOrder)
    await reorderPlans(newOrder.map(p => p.id))
  }

  async function handleSave() {
    if (!editing) return
    const result = await upsertPlan(editing as Plan & { id?: string })
    if (result.error) { toast.error(result.error); return }
    toast.success('Guardado')
    setEditing(null)
    await loadPlans()
  }

  const benefitsArray = (editing && Array.isArray((editing as Plan).benefits))
    ? (editing as Plan).benefits as string[]
    : []

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Planes de Membresía</h1>
        <Button size="sm" onClick={() => { setEditing({ ...EMPTY_PLAN }); setIsNew(true) }}>
          <Plus size={16} className="mr-1" /> Agregar Plan
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Plan list */}
        <div>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={plans.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {plans.map(plan => {
                  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: plan.id }) // eslint-disable-line
                  const style = { transform: CSS.Transform.toString(transform), transition }
                  return (
                    <div key={plan.id} ref={setNodeRef} style={style}
                      className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                      <button {...attributes} {...listeners} className="cursor-grab text-gray-300 min-h-[36px]">
                        <GripVertical size={18} />
                      </button>
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: plan.badge_color }} />
                      <span className="flex-1 font-medium text-sm text-gray-900">{plan.name}</span>
                      <span className="text-sm text-gray-500 font-medium">RD${plan.price}</span>
                      <button onClick={() => { setEditing(plan); setIsNew(false) }} className="p-2 text-gray-400 hover:text-blue-600 min-h-[36px]"><Edit size={16} /></button>
                      <button onClick={async () => { if (confirm('¿Eliminar?')) { await deletePlan(plan.id); await loadPlans(); toast.success('Eliminado') } }} className="p-2 text-gray-400 hover:text-red-600 min-h-[36px]"><Trash2 size={16} /></button>
                    </div>
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Edit form + preview */}
        {editing && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h2 className="font-bold text-gray-900">{isNew ? 'Nuevo Plan' : 'Editar Plan'}</h2>
            {[
              { key: 'name', label: 'Nombre', type: 'text' },
              { key: 'age_range', label: 'Rango de edad', type: 'text' },
              { key: 'price', label: 'Precio (RD$)', type: 'number' },
              { key: 'cta_label', label: 'Texto del botón', type: 'text' },
              { key: 'stripe_price_id', label: 'Stripe Price ID', type: 'text' },
              { key: 'thumbnail_url', label: 'URL de imagen', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                <input type={field.type} value={(editing as any)[field.key] ?? ''}
                  onChange={e => setEditing(prev => prev ? { ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value } : prev)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[48px]" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color del badge</label>
              <input type="color" value={(editing as any).badge_color ?? '#22c55e'}
                onChange={e => setEditing(prev => prev ? { ...prev, badge_color: e.target.value } : prev)}
                className="w-12 h-10 cursor-pointer rounded border border-gray-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Beneficios (uno por línea)</label>
              <textarea rows={4} value={benefitsArray.join('\n')}
                onChange={e => setEditing(prev => prev ? { ...prev, benefits: e.target.value.split('\n').filter(Boolean) } : prev)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={(editing as any).is_active ?? true}
                onChange={e => setEditing(prev => prev ? { ...prev, is_active: e.target.checked } : prev)}
                className="w-5 h-5 rounded" />
              <label htmlFor="is_active" className="text-sm text-gray-700">Activo</label>
            </div>

            {/* Preview */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Vista previa:</p>
              <div className="transform scale-90 origin-top-left">
                <MembershipCard id="preview" {...(editing as any)} benefits={benefitsArray} />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} size="sm">Guardar</Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Verify plan manager**

```bash
npm run dev
```

Visit `/es/admin/plans`. Edit the Adult Member plan price. Verify change appears at `/es`.

**Step 4: Commit**

```bash
git add "app/[locale]/admin/plans/"
git commit -m "feat: add admin membership plan manager with live preview"
```

---

## Task 14: Admin Staff + Court Manager

**Files:**
- Create: `app/[locale]/admin/courts/page.tsx`
- Create: `app/[locale]/admin/courts/actions.ts`

**Step 1: Create `app/[locale]/admin/courts/actions.ts`**

```typescript
// app/[locale]/admin/courts/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertCourt(data: { id?: string; name: string; description?: string; photo_url?: string; is_active: boolean }) {
  const supabase = createClient()
  const { id, ...rest } = data
  if (id) {
    const { error } = await supabase.from('courts').update(rest).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('courts').insert(rest)
    if (error) return { error: error.message }
  }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function upsertTimeSlot(data: {
  id?: string; court_id: string; date: string; start_time: string; end_time: string
  max_capacity: number; price_override?: number | null; is_blocked: boolean
}) {
  const supabase = createClient()
  const { id, ...rest } = data
  if (id) {
    const { error } = await supabase.from('time_slots').update(rest).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('time_slots').insert(rest)
    if (error) return { error: error.message }
  }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteTimeSlot(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('time_slots').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}
```

**Step 2: Create `app/[locale]/admin/courts/page.tsx`**

Implement a two-panel page:
- Left panel: list of courts with add/edit form (name, description, photo_url, is_active)
- Right panel: when a court is selected, show its time slots for a selected date; form to add new slots (date, start_time, end_time, max_capacity, price_override); toggle is_blocked; delete slot; view reservation count per slot

Fetch reservation counts with: `supabase.from('reservations').select('id', { count: 'exact' }).eq('time_slot_id', slot.id).eq('status', 'confirmed')`

**Step 3: Commit**

```bash
git add "app/[locale]/admin/courts/"
git commit -m "feat: add admin court and time slot manager"
```

---

## Task 15: Court Reservations Page (User-Facing)

**Files:**
- Create: `app/[locale]/(protected)/reservations/page.tsx`
- Create: `app/[locale]/(protected)/reservations/actions.ts`
- Create: `app/[locale]/(protected)/layout.tsx`

**Step 1: Create `app/[locale]/(protected)/layout.tsx`**

```typescript
// app/[locale]/(protected)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function ProtectedLayout({
  children, params: { locale }
}: { children: React.ReactNode; params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  )
}
```

**Step 2: Create `app/[locale]/(protected)/reservations/actions.ts`**

```typescript
// app/[locale]/(protected)/reservations/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createReservation(time_slot_id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Check capacity
  const { count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('time_slot_id', time_slot_id)
    .eq('status', 'confirmed')

  const { data: slot } = await supabase.from('time_slots').select('max_capacity, is_blocked').eq('id', time_slot_id).single()

  if (slot?.is_blocked) return { error: 'Este horario no está disponible' }
  if ((count ?? 0) >= (slot?.max_capacity ?? 0)) return { error: 'No hay cupos disponibles' }

  const { error } = await supabase.from('reservations').insert({ user_id: user.id, time_slot_id, status: 'confirmed' })
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function cancelReservation(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('reservations').update({ status: 'canceled' }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}
```

**Step 3: Create `app/[locale]/(protected)/reservations/page.tsx`**

Implement a two-tab page:

**Tab 1 — Available Courts:**
- `<input type="date">` for date selection (default today)
- On date change, fetch: `time_slots + courts` joined, filtered by date, not blocked
- Show slots grouped by court (name + time range + price + available spots)
- "Reserve" button calls `createReservation(slot.id)` — disable if full or already reserved

**Tab 2 — My Reservations:**
- Fetch: `reservations` for current user, joined with `time_slots` and `courts`, ordered by date desc
- Show: court name, date, time, status badge (green=confirmed, gray=canceled)
- "Cancel" button (only for future confirmed reservations) calls `cancelReservation(id)`

**Step 4: Verify reservations page**

```bash
npm run dev
```

Login, visit `/es/reservations`. Add a time slot in admin for today. Verify it appears, reserve it, see it in "My Reservations".

**Step 5: Commit**

```bash
git add "app/[locale]/(protected)/"
git commit -m "feat: add court reservations page with booking and cancellation"
```

---

## Task 16: Tournament Manager + Registration

**Files:**
- Create: `app/[locale]/admin/tournaments/page.tsx`
- Create: `app/[locale]/admin/tournaments/actions.ts`
- Modify: `app/[locale]/(protected)/reservations/page.tsx` → add tournament tab

**Step 1: Create `app/[locale]/admin/tournaments/actions.ts`**

```typescript
// app/[locale]/admin/tournaments/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertTournament(data: {
  id?: string; name: string; date?: string; description?: string
  max_participants?: number; entry_fee: number; is_open: boolean
}) {
  const supabase = createClient()
  const { id, ...rest } = data
  if (id) {
    const { error } = await supabase.from('tournaments').update(rest).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('tournaments').insert(rest)
    if (error) return { error: error.message }
  }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteTournament(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('tournaments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function registerForTournament(tournament_id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { error } = await supabase.from('tournament_registrations').insert({ user_id: user.id, tournament_id })
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function unregisterFromTournament(tournament_id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { error } = await supabase.from('tournament_registrations').delete()
    .eq('user_id', user.id).eq('tournament_id', tournament_id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}
```

**Step 2: Create admin tournaments page**

CRUD form with fields: name, date, description, max_participants, entry_fee, is_open. Table view showing registrant count per tournament with a "View Registrants" expandable list showing user names/emails.

**Step 3: Add tournament tab to reservations page**

Fetch open tournaments. For each, show name, date, entry fee, spots remaining. "Inscribirse" button calls `registerForTournament`. Already registered shows "Inscrito ✓" badge + "Cancelar inscripción" link.

**Step 4: Commit**

```bash
git add "app/[locale]/admin/tournaments/"
git commit -m "feat: add tournament manager and user registration"
```

---

## Task 17: Stripe Integration

**Files:**
- Create: `lib/stripe/server.ts`
- Create: `app/api/stripe/checkout/route.ts`
- Create: `app/api/stripe/webhook/route.ts`
- Modify: `components/membership/MembershipCard.tsx` → wire up Subscribe button

**Step 1: Create `lib/stripe/server.ts`**

```typescript
// lib/stripe/server.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})
```

**Step 2: Create `app/api/stripe/checkout/route.ts`**

```typescript
// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { price_id, locale } = await req.json()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('user_id', user.id).single()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : user.email,
    line_items: [{ price: price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/account?subscribed=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}#membership`,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
  })

  return NextResponse.json({ url: session.url })
}
```

**Step 3: Create `app/api/stripe/webhook/route.ts`**

```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const user_id = session.metadata?.user_id
    if (user_id) {
      // Get plan name from price
      const price = await stripe.prices.retrieve(session.line_items?.data[0]?.price?.id ?? '')
      const product = await stripe.products.retrieve(price.product as string)
      await supabase.from('profiles').update({
        stripe_customer_id: session.customer as string,
        subscription_id: session.subscription as string,
        subscription_status: 'active',
        membership_type: product.name,
      }).eq('user_id', user_id)
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const user_id = sub.metadata?.user_id
    if (user_id) {
      await supabase.from('profiles').update({
        subscription_status: sub.status === 'active' ? 'active' : 'inactive',
      }).eq('user_id', user_id)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const user_id = sub.metadata?.user_id
    if (user_id) {
      await supabase.from('profiles').update({
        subscription_status: 'canceled', membership_type: null, subscription_id: null,
      }).eq('user_id', user_id)
    }
  }

  return NextResponse.json({ received: true })
}
```

**Step 4: Update MembershipCard Subscribe button**

```typescript
// In MembershipCard.tsx, make the button a client component that POSTs to /api/stripe/checkout:
'use client'
// Add at the bottom of MembershipCard — extract button to separate Client Component:

function SubscribeButton({ stripe_price_id, cta_label, badge_color }: { stripe_price_id: string | null; cta_label: string; badge_color: string }) {
  const params = useParams<{ locale: string }>()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubscribe() {
    if (!stripe_price_id) return
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_id: stripe_price_id, locale: params.locale }),
    })
    const { url, error } = await res.json()
    if (error === 'Unauthorized') { router.push(`/${params.locale}/login?redirect=/#membership`); return }
    if (url) window.location.href = url
    setLoading(false)
  }

  return (
    <button onClick={handleSubscribe} disabled={!stripe_price_id || loading}
      className="w-full py-3 px-5 font-semibold rounded-lg text-white transition min-h-[48px] disabled:opacity-50"
      style={{ backgroundColor: badge_color }}>
      {loading ? 'Redirigiendo...' : cta_label}
    </button>
  )
}
```

**Step 5: Test Stripe webhook locally**

```bash
# In a separate terminal:
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook signing secret to .env.local STRIPE_WEBHOOK_SECRET
```

**Step 6: Commit**

```bash
git add lib/stripe/ app/api/stripe/
git commit -m "feat: add Stripe Checkout and webhook for subscription payments"
```

---

## Task 18: Help Bot (`/api/chat` + HelpBot Component)

**Files:**
- Create: `app/api/chat/route.ts`
- Create: `components/layout/HelpBot.tsx`
- Modify: `app/[locale]/layout.tsx` → add `<HelpBot />`

**Step 1: Create `app/api/chat/route.ts`**

```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/server'

const anthropic = new Anthropic()

// Simple in-memory rate limiter (resets on server restart)
const rateLimiter = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimiter.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return new Response('Rate limit exceeded', { status: 429 })
  }

  const { messages } = await req.json()
  const supabase = createServiceClient()

  // Fetch FAQs and plans to inject into system prompt
  const [{ data: faqs }, { data: plans }, { data: settings }] = await Promise.all([
    supabase.from('faqs').select('question, answer').eq('is_visible', true).order('display_order'),
    supabase.from('membership_plans').select('name, age_range, price, benefits').eq('is_active', true).order('display_order'),
    supabase.from('site_settings').select('key, value').in('key', ['whatsapp_number']),
  ])

  const whatsappNumber = settings?.find(s => s.key === 'whatsapp_number')?.value ?? '18091234567'
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hola%2C%20necesito%20ayuda`

  const faqText = faqs?.map(f => `P: ${f.question}\nR: ${f.answer}`).join('\n\n') ?? ''
  const plansText = plans?.map(p =>
    `${p.name} (${p.age_range}) — RD$${p.price}/mes — Beneficios: ${(p.benefits as string[]).join(', ')}`
  ).join('\n') ?? ''

  const systemPrompt = `Eres el asistente virtual del Nell Pickleball Club en República Dominicana.
Responde SIEMPRE en el idioma del usuario (español o inglés). Sé amable, conciso y útil.

PREGUNTAS FRECUENTES:
${faqText}

PLANES DE MEMBRESÍA:
${plansText}

INFORMACIÓN ADICIONAL:
- Horario: Lunes a viernes 7am–9pm, fines de semana 7am–8pm
- Reservas: a través de la página web en la sección de Reservaciones (requiere cuenta)
- Para suscribirse: hacer clic en "Suscribirse" en la tarjeta del plan deseado

Si no sabes la respuesta, di EXACTAMENTE: "Para más información, contáctanos directamente por WhatsApp: ${whatsappLink}"
No inventes información. No respondas preguntas no relacionadas con el club o el pickleball.`

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    system: systemPrompt,
    messages,
  })

  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
```

**Step 2: Create `components/layout/HelpBot.tsx`**

```typescript
// components/layout/HelpBot.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

export function HelpBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        // Parse SSE chunks from Anthropic stream
        const lines = chunk.split('\n').filter(l => l.startsWith('data:'))
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(5))
            if (data.type === 'content_block_delta' && data.delta?.text) {
              assistantContent += data.delta.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
                return updated
              })
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, ocurrió un error. Por favor intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-32 right-4 z-51 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: '420px' }}>
          {/* Header */}
          <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="font-semibold text-sm">Asistente Nell</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-green-600 rounded min-h-[36px] min-w-[36px] flex items-center justify-center">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm mt-8">
                <p className="text-2xl mb-2">👋</p>
                <p>¡Hola! ¿En qué puedo ayudarte?</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-green-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}>
                  {msg.content || (loading && i === messages.length - 1 ? (
                    <span className="flex gap-1 items-center">
                      <span className="animate-bounce delay-0">·</span>
                      <span className="animate-bounce delay-100">·</span>
                      <span className="animate-bounce delay-200">·</span>
                    </span>
                  ) : '')}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-sm flex gap-1 items-center">
                  <span className="animate-bounce text-gray-500 text-xl leading-none delay-0">·</span>
                  <span className="animate-bounce text-gray-500 text-xl leading-none delay-100">·</span>
                  <span className="animate-bounce text-gray-500 text-xl leading-none delay-200">·</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 px-3 py-3 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[40px]"
              disabled={loading} />
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition min-h-[40px] min-w-[40px] flex items-center justify-center">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-51 w-14 h-14 bg-green-700 text-white rounded-full shadow-lg hover:bg-green-800 transition flex items-center justify-center"
        aria-label="Abrir asistente">
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  )
}
```

**Step 3: Add HelpBot to locale layout**

In `app/[locale]/layout.tsx`, add inside `<body>`:
```typescript
import { HelpBot } from '@/components/layout/HelpBot'
// Inside body, after NextIntlClientProvider:
<HelpBot />
```

**Step 4: Test help bot**

```bash
npm run dev
```

Open the bot, ask "¿Cuánto cuesta la membresía adulta?" — should stream a correct answer from the DB data.

**Step 5: Commit**

```bash
git add app/api/chat/ components/layout/HelpBot.tsx
git commit -m "feat: add AI help bot with Anthropic streaming and DB-injected context"
```

---

## Task 19: WhatsApp Button + Admin Settings

**Files:**
- Create: `components/layout/WhatsAppButton.tsx`
- Create: `app/[locale]/admin/settings/page.tsx`
- Create: `app/[locale]/admin/settings/actions.ts`
- Modify: `app/[locale]/layout.tsx` → fetch WhatsApp settings server-side

**Step 1: Create `components/layout/WhatsAppButton.tsx`**

```typescript
// components/layout/WhatsAppButton.tsx
interface WhatsAppButtonProps {
  phoneNumber: string
  enabled: boolean
}

export function WhatsAppButton({ phoneNumber, enabled }: WhatsAppButtonProps) {
  if (!enabled || !phoneNumber) return null
  const href = `https://wa.me/${phoneNumber}?text=Hola%2C%20me%20interesa%20el%20Nell%20Pickleball%20Club`
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#1ebe57] transition flex items-center justify-center"
      aria-label="Contactar por WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  )
}
```

**Step 2: Create `app/[locale]/admin/settings/actions.ts`**

```typescript
// app/[locale]/admin/settings/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSetting(key: string, value: string) {
  const supabase = createClient()
  const { error } = await supabase.from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}
```

**Step 3: Create `app/[locale]/admin/settings/page.tsx`**

Implement settings form with:
- WhatsApp phone number input (with formatting hint: country code + number, e.g. `18091234567`)
- WhatsApp enabled toggle (checkbox)
- Zapier/Make.com webhook URL input
- Stripe enabled toggle
- Save button that calls `updateSetting` for each field

**Step 4: Fetch WhatsApp settings in locale layout**

In `app/[locale]/layout.tsx`, fetch site_settings server-side and pass to `<WhatsAppButton>`:

```typescript
// In LocaleLayout (server component):
import { createClient } from '@/lib/supabase/server'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'

// Inside the component:
const supabase = createClient()
const { data: settings } = await supabase.from('site_settings').select('key, value')
const whatsappNumber = settings?.find(s => s.key === 'whatsapp_number')?.value ?? ''
const whatsappEnabled = settings?.find(s => s.key === 'whatsapp_enabled')?.value === 'true'

// In JSX, add after children:
<WhatsAppButton phoneNumber={whatsappNumber} enabled={whatsappEnabled} />
```

**Step 5: Verify WhatsApp button**

```bash
npm run dev
```

WhatsApp button should appear at bottom-right. Change number in admin settings, verify link updates.

**Step 6: Commit**

```bash
git add components/layout/WhatsAppButton.tsx "app/[locale]/admin/settings/"
git commit -m "feat: add WhatsApp floating button with DB-driven phone number"
```

---

## Task 20: Mobile Polish Pass

**Files:**
- Modify: `tailwind.config.ts` → add scrollbar-hide plugin
- Modify: `app/globals.css` → mobile polish styles
- Verify: all pages at 375px, 390px, 428px

**Step 1: Install scrollbar-hide**

```bash
npm install tailwind-scrollbar-hide
```

**Step 2: Update `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar-hide'),
  ],
}
export default config
```

Also install: `npm install @tailwindcss/typography`

**Step 3: Mobile tap target audit**

Check every interactive element has `min-h-[48px]`. Key items to verify:
- Header hamburger button ✓ (done in Task 5)
- BottomNav items ✓ (done in Task 5)
- All `<Button>` components ✓ (base has `min-h-[48px]`)
- Auth form inputs ✓ (done in Task 8)
- FAQ accordion buttons ✓ (done in Task 7)
- WhatsApp button: 56×56px ✓
- HelpBot toggle: 56×56px ✓

**Step 4: Membership card horizontal scroll on mobile**

Verify `MembershipGrid` uses:
```css
/* Mobile: horizontal scroll */
flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide
/* Tablet+: grid */
md:grid md:grid-cols-2 md:overflow-visible
```

Each card should have `snap-center flex-none w-[280px] md:w-auto`.

**Step 5: Test at 375px in browser DevTools**

```bash
npm run dev
```

Open Chrome DevTools → Toggle device toolbar → Set to 375×667. Verify:
- Header: logo + hamburger (no overflow)
- Home page: membership cards scroll horizontally with snap
- Guide: FAQ accordion tappable
- Auth forms: inputs full-width, large
- Bottom nav: visible and full-width

**Step 6: Fix any overflow issues**

Common fixes:
- Add `overflow-x-hidden` to `<body>` if horizontal scroll appears on pages
- Ensure admin sidebar on mobile uses fixed overlay, not pushing content

**Step 7: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: mobile polish - tap targets, snap scroll, overflow fixes"
```

---

## Task 21: SEO — Metadata, Sitemap, robots.txt

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Modify: all page files → add `generateMetadata()`

**Step 1: Create `app/sitemap.ts`**

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nellpickleball.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['es', 'en']
  const routes = ['', '/about', '/guide', '/signup', '/login']

  return locales.flatMap(locale =>
    routes.map(route => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'weekly' : 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  )
}
```

**Step 2: Create `app/robots.ts`**

```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://nellpickleball.com'}/sitemap.xml`,
  }
}
```

**Step 3: Add `generateMetadata` to each page**

Each page already has basic metadata from Tasks 6–8. Enhance with full OG tags:

```typescript
// Standard metadata template for each page:
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const title = 'Nell Pickleball Club — República Dominicana'
  const description = 'El primer club de pickleball de República Dominicana.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: locale === 'es' ? 'es_DO' : 'en_US',
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}`,
      siteName: 'Nell Pickleball Club',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}`,
      languages: { es: `/es`, en: `/en` },
    },
  }
}
```

**Step 4: Verify sitemap and robots**

```bash
npm run dev
```

Visit http://localhost:3000/sitemap.xml — should list all localized URLs.
Visit http://localhost:3000/robots.txt — should show allow/disallow rules.

**Step 5: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat: add sitemap.xml, robots.txt, and full OG metadata"
```

---

## Task 22: README + Env Example + Final Cleanup

**Files:**
- Create: `README.md`
- Verify: `.env.local.example`

**Step 1: Create `README.md`**

```markdown
# Nell Pickleball Club — Web App

Full-stack bilingual (ES/EN) web app for Nell Pickleball Club, Dominican Republic.

## Tech Stack
Next.js 14 · TypeScript · Tailwind CSS · Supabase · Stripe · Anthropic

## Local Development Setup

### 1. Clone and install
git clone <repo>
cd dominican_pickleball
npm install

### 2. Create Supabase project
1. Go to supabase.com → New Project
2. Note your Project URL and anon key (Settings → API)
3. Copy service role key (keep secret)

### 3. Run database migrations
In Supabase Dashboard → SQL Editor:
1. Paste and run `supabase/migrations/001_initial.sql`
2. Paste and run `supabase/migrations/002_rls.sql`

### 4. Configure environment
cp .env.local.example .env.local
# Fill in all values

### 5. Seed database
npx tsx supabase/seed.ts

### 6. Run development server
npm run dev
# Visit http://localhost:3000 (redirects to /es)

---

## Setting the First Admin User
1. Sign up at /es/signup
2. In Supabase SQL Editor:
   UPDATE profiles SET role = 'admin' WHERE user_id = 'YOUR_USER_UUID';
3. Visit /es/admin

---

## Stripe Setup
1. Create a Stripe account at stripe.com
2. For each membership plan, create a Product and recurring Price in the Stripe dashboard
3. Copy the Price ID (price_xxx) into each plan's "Stripe Price ID" field in /es/admin/plans
4. Add Stripe keys to .env.local
5. For webhooks:
   - Production: add /api/stripe/webhook as a webhook endpoint in Stripe dashboard
   - Events to listen: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
   - Local testing: stripe listen --forward-to localhost:3000/api/stripe/webhook

---

## Supabase Webhook → Make.com → Google Sheets

### Purpose
Automatically sync new member signups and membership status changes to a Google Sheet.

### Setup Steps

**Step 1: Create Make.com scenario**
1. Sign up at make.com (free tier available)
2. Create new scenario
3. Add trigger: Webhooks → Custom Webhook → Create webhook
4. Copy the webhook URL

**Step 2: Store webhook URL in Supabase**
In admin panel → Settings → Zapier/Make.com Webhook URL → paste URL → Save

Or directly in SQL:
UPDATE site_settings SET value = 'YOUR_MAKE_URL' WHERE key = 'zapier_webhook_url';

**Step 3: Create Supabase webhook**
1. Supabase Dashboard → Database → Webhooks → Create new webhook
2. Name: member_sync
3. Table: profiles
4. Events: INSERT ✓, UPDATE ✓
5. HTTP method: POST
6. URL: paste your Make.com webhook URL
7. HTTP Headers: Content-Type: application/json

**Step 4: Configure Make.com scenario**
Add a Router module with two routes:
- Route 1 (INSERT): Google Sheets → Add Row
  - Columns: user_id, full_name, membership_type, subscription_status, created_at
- Route 2 (UPDATE): Google Sheets → Search Rows → Update Row
  - Search by: user_id column
  - Update: membership_type, subscription_status columns

**Step 5: Test**
1. Sign up a new user → check Google Sheet for new row
2. Subscribe to a plan → check row is updated

---

## Deployment (Vercel)
1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables from .env.local.example
4. Set NEXT_PUBLIC_APP_URL to your production URL
5. Deploy
```

**Step 2: Verify TypeScript and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: build succeeds with no TypeScript errors.

**Step 3: Final commit**

```bash
git add README.md .env.local.example
git commit -m "docs: add README with full setup, Stripe, and Make.com/Google Sheets guide"
```

---

## Task 23: About Page — Staff + Gallery (Admin-Connected)

**Files:**
- Create: `app/[locale]/admin/content/staff-actions.ts`
- Modify: `app/[locale]/(public)/about/page.tsx` → fetch staff and gallery from DB

**Step 1: Create staff server actions**

```typescript
// app/[locale]/admin/content/staff-actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertStaff(data: { id?: string; name: string; role?: string; bio?: string; photo_url?: string; display_order: number; is_visible: boolean }) {
  const supabase = createClient()
  const { id, ...rest } = data
  if (id) {
    await supabase.from('staff_members').update(rest).eq('id', id)
  } else {
    await supabase.from('staff_members').insert(rest)
  }
  revalidatePath('/[locale]/about', 'page')
  return { success: true }
}

export async function deleteStaff(id: string) {
  const supabase = createClient()
  await supabase.from('staff_members').delete().eq('id', id)
  revalidatePath('/[locale]/about', 'page')
  return { success: true }
}
```

**Step 2: Add staff section to admin content page**

In `app/[locale]/admin/content/page.tsx`, add a fourth tab "staff" to the existing tab system. Show a sortable list of staff members with add/edit/delete inline forms (same pattern as FAQ manager).

**Step 3: Update about page to fetch from DB**

```typescript
// In about/page.tsx, add server-side fetch:
const supabase = createClient()
const [{ data: staff }, { data: content }] = await Promise.all([
  supabase.from('staff_members').select('*').eq('is_visible', true).order('display_order'),
  supabase.from('site_content').select('*').eq('page', 'about'),
])

const storyBody = content?.find(c => c.section === 'story' && c.key === 'body')?.value ?? ''
const videoUrl = content?.find(c => c.section === 'video' && c.key === 'url')?.value ?? ''
const embedUrl = videoUrl.replace('watch?v=', 'embed/')
```

**Step 4: Commit**

```bash
git add "app/[locale]/admin/content/staff-actions.ts"
git commit -m "feat: connect about page staff bios and gallery to database"
```

---

## Summary of All Tasks

| # | Task | Key Output |
|---|------|-----------|
| 1 | Project scaffold | Next.js 14 app, all deps installed |
| 2 | DB migration | All tables, RLS, trigger, seed data |
| 3 | Supabase clients + types | `lib/supabase/server.ts`, `client.ts`, `types.ts` |
| 4 | next-intl + middleware | `/es` /`/en` routing, auth protection |
| 5 | App layout | Header, Footer, BottomNav, Button, Skeleton |
| 6 | Home + MembershipCard | Static home page, responsive card grid |
| 7 | About + Guide | About page, guide with FAQ accordion |
| 8 | Auth pages | Signup, login, account with Supabase Auth |
| 9 | DB-connected pages | Plans + FAQs from Supabase |
| 10 | Admin layout | Sidebar, dashboard, role-protected |
| 11 | Admin content manager | Tiptap editor, site_content CRUD |
| 12 | Admin FAQ manager | Drag-to-reorder, CRUD |
| 13 | Admin plan manager | Live preview, drag-sort, Stripe price ID |
| 14 | Admin court manager | Courts + time slot CRUD |
| 15 | Reservations page | Date picker, book/cancel courts |
| 16 | Tournament manager | Admin CRUD + user registration |
| 17 | Stripe integration | Checkout session + webhook |
| 18 | Help Bot | `/api/chat` + streaming HelpBot component |
| 19 | WhatsApp button | Floating button, admin settings |
| 20 | Mobile polish | tap targets, snap scroll, 375px |
| 21 | SEO | sitemap, robots.txt, OG metadata |
| 22 | README + docs | Setup, Stripe, Make.com/Sheets guide |
| 23 | About page DB | Staff, gallery from DB |
