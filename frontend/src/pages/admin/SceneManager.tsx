import { useEffect, useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { scenesApi } from '../../api/client'
import type { Scene } from '../../store/journeyStore'

const COMPONENT_LABELS: Record<string, string> = {
  'globe': '🌍 Globe — Trái Đất',
  'particle-sphere': '✨ Rising Lines',
  'black-hole': '🕳️ Black Hole',
  'tornado': '🌪️ Tornado',
  'glitter-wrap': '💫 Glitter Wrap',
}

function SortableSceneRow({ scene, onToggle, onContentSave }: {
  scene: Scene
  onToggle: (id: string, v: boolean) => void
  onContentSave: (id: string, title: string, desc: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: scene.id })
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(scene.title)
  const [description, setDescription] = useState(scene.description)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        marginBottom: '8px',
      }}>
        {/* Drag handle */}
        <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--color-text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>
          ⠿
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
            {COMPONENT_LABELS[scene.componentType] || scene.componentType}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {scene.title || '(Chưa có tiêu đề)'}
          </p>
        </div>

        {/* Edit button */}
        <button
          onClick={() => setEditing(!editing)}
          style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          ✏️
        </button>

        {/* Toggle */}
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={scene.isVisible}
            onChange={e => onToggle(scene.id, e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
      </div>

      {/* Inline content editor */}
      {editing && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          style={{
            background: 'rgba(124,58,237,0.05)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '8px',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}
        >
          <input
            className="form-input"
            placeholder="Tiêu đề cảnh"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            className="form-input"
            placeholder="Mô tả ngắn"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-primary" onClick={() => { onContentSave(scene.id, title, description); setEditing(false) }}>
              Lưu
            </button>
            <button onClick={() => setEditing(false)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', padding: '8px 16px', cursor: 'pointer' }}>
              Hủy
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export function SceneManager() {
  const [scenes, setScenes] = useState<Scene[]>([])

  useEffect(() => {
    scenesApi.getAll(true).then(res => setScenes(res.data))
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = scenes.findIndex(s => s.id === active.id)
    const newIndex = scenes.findIndex(s => s.id === over.id)
    const reordered = arrayMove(scenes, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }))
    setScenes(reordered)
    await scenesApi.reorder(reordered.map(s => ({ id: s.id, order: s.order })))
  }

  const handleToggle = async (id: string, isVisible: boolean) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, isVisible } : s))
    await scenesApi.toggle(id, isVisible)
  }

  const handleContentSave = async (id: string, title: string, description: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, title, description } : s))
    await scenesApi.updateContent(id, title, description)
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>🎬 Quản lý cảnh</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
        Kéo thả để sắp xếp thứ tự. Toggle để bật/tắt cảnh trong hành trình.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={scenes.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {scenes.map(scene => (
            <SortableSceneRow
              key={scene.id}
              scene={scene}
              onToggle={handleToggle}
              onContentSave={handleContentSave}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
