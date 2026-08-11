import { useEffect, useRef, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { photosApi, scenesApi } from '../../api/client'
import type { Astronaut, Scene } from '../../store/journeyStore'

function SortablePhoto({ photo, scenes, onToggle, onUpdate, onDelete }: {
  photo: Astronaut
  scenes: Scene[]
  onToggle: (id: string, v: boolean) => void
  onUpdate: (id: string, name: string, desc: string, sceneId: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(photo.name)
  const [description, setDescription] = useState(photo.description)
  const [sceneId, setSceneId] = useState(photo.sceneId)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={{ ...style, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${photo.isVisible ? 'var(--color-border)' : 'rgba(239,68,68,0.2)'}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Photo */}
        <div style={{ position: 'relative' }}>
          <img
            src={photo.cloudinaryUrl}
            alt={photo.name}
            style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }}
          />
          {!photo.isVisible && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem',
            }}>🙈</div>
          )}
          {/* Drag handle */}
          <div
            {...attributes} {...listeners}
            style={{
              position: 'absolute', top: '8px', left: '8px',
              background: 'rgba(0,0,0,0.6)', borderRadius: '6px',
              padding: '4px 6px', cursor: 'grab', fontSize: '1rem', color: '#fff',
            }}
          >⠿</div>
        </div>

        {/* Info */}
        <div style={{ padding: '12px' }}>
          <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {photo.name || '(Chưa đặt tên)'}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
            {scenes.find(s => s.id === photo.sceneId)?.displayName || 'Chưa gán cảnh'}
          </p>
        </div>

        {/* Actions */}
        <div style={{ padding: '0 12px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <label className="toggle-switch" style={{ flexShrink: 0 }}>
            <input type="checkbox" checked={photo.isVisible} onChange={e => onToggle(photo.id, e.target.checked)} />
            <span className="toggle-slider" />
          </label>
          <button onClick={() => setEditing(!editing)} style={{ flex: 1, background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', color: 'var(--color-text-muted)', padding: '5px', cursor: 'pointer', fontSize: '0.75rem' }}>
            ✏️ Sửa
          </button>
          <button className="btn-danger" onClick={() => {
            if (confirm(`Xóa ảnh "${photo.name}"?`)) onDelete(photo.id)
          }} style={{ padding: '5px 8px', fontSize: '0.75rem' }}>
            🗑️
          </button>
        </div>
      </div>

      {/* Inline editor */}
      {editing && (
        <div style={{
          background: 'rgba(124,58,237,0.05)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '10px',
          padding: '12px',
          marginTop: '6px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <input className="form-input" placeholder="Tên phi hành gia" value={name} onChange={e => setName(e.target.value)} />
          <textarea className="form-input" placeholder="Mô tả ngắn (1-2 dòng)" value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ resize: 'vertical', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }} />
          <select
            className="form-input"
            value={sceneId}
            onChange={e => setSceneId(e.target.value)}
          >
            <option value="">— Chọn cảnh —</option>
            {scenes.map(s => <option key={s.id} value={s.id}>{s.displayName}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-primary" style={{ flex: 1, padding: '8px' }} onClick={() => { onUpdate(photo.id, name, description, sceneId); setEditing(false) }}>
              Lưu
            </button>
            <button onClick={() => setEditing(false)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function PhotoManager() {
  const [photos, setPhotos] = useState<Astronaut[]>([])
  const [scenes, setScenes] = useState<Scene[]>([])
  const [filterSceneId, setFilterSceneId] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({ name: '', description: '', sceneId: '', file: null as File | null })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scenesApi.getAll(true).then(res => setScenes(res.data))
    photosApi.getAll(undefined, true).then(res => setPhotos(res.data))
  }, [])

  const sensors = useSensors(useSensor(PointerSensor))

  const displayed = filterSceneId ? photos.filter(p => p.sceneId === filterSceneId) : photos

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = displayed.findIndex(p => p.id === active.id)
    const newIdx = displayed.findIndex(p => p.id === over.id)
    const reordered = arrayMove(displayed, oldIdx, newIdx).map((p, i) => ({ ...p, order: i }))
    setPhotos(prev => {
      const others = prev.filter(p => !reordered.find(r => r.id === p.id))
      return [...others, ...reordered]
    })
    await Promise.all(reordered.map(p => photosApi.update(p.id, { order: p.order })))
  }

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.sceneId) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', uploadForm.file)
    fd.append('name', uploadForm.name)
    fd.append('description', uploadForm.description)
    fd.append('sceneId', uploadForm.sceneId)
    const res = await photosApi.upload(fd)
    setPhotos(prev => [...prev, res.data])
    setUploadForm({ name: '', description: '', sceneId: '', file: null })
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploading(false)
  }

  const handleToggle = async (id: string, isVisible: boolean) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, isVisible } : p))
    await photosApi.update(id, { isVisible })
  }

  const handleUpdate = async (id: string, name: string, description: string, sceneId: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, name, description, sceneId } : p))
    await photosApi.update(id, { name, description, sceneId })
  }

  const handleDelete = async (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id))
    await photosApi.delete(id)
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>📸 Quản lý ảnh</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Upload, sắp xếp và quản lý ảnh phi hành gia.</p>

      {/* Upload form */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <h2>Upload ảnh mới</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input
            className="form-input"
            placeholder="Tên phi hành gia *"
            value={uploadForm.name}
            onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))}
          />
          <select
            className="form-input"
            value={uploadForm.sceneId}
            onChange={e => setUploadForm(f => ({ ...f, sceneId: e.target.value }))}
          >
            <option value="">— Chọn cảnh *</option>
            {scenes.map(s => <option key={s.id} value={s.id}>{s.displayName}</option>)}
          </select>
          <textarea
            className="form-input"
            placeholder="Mô tả ngắn (1-2 dòng)"
            value={uploadForm.description}
            onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            style={{ gridColumn: '1 / -1', resize: 'vertical', fontFamily: 'var(--font-body)' }}
          />
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={e => setUploadForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
              style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', flex: 1 }}
            />
            <button
              className="btn-primary"
              onClick={handleUpload}
              disabled={uploading || !uploadForm.file || !uploadForm.sceneId}
            >
              {uploading ? '⬆️ Đang upload...' : '⬆️ Upload'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter by scene */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterSceneId('')}
          className="btn-primary"
          style={{ background: !filterSceneId ? undefined : 'rgba(255,255,255,0.05)', border: !filterSceneId ? undefined : '1px solid var(--color-border)', fontSize: '0.8rem', padding: '8px 16px' }}
        >
          Tất cả ({photos.length})
        </button>
        {scenes.map(s => (
          <button
            key={s.id}
            onClick={() => setFilterSceneId(s.id)}
            className="btn-primary"
            style={{ background: filterSceneId === s.id ? undefined : 'rgba(255,255,255,0.05)', border: filterSceneId === s.id ? undefined : '1px solid var(--color-border)', fontSize: '0.8rem', padding: '8px 16px' }}
          >
            {s.displayName} ({photos.filter(p => p.sceneId === s.id).length})
          </button>
        ))}
      </div>

      {/* Photo Grid with DnD */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={displayed.map(p => p.id)} strategy={rectSortingStrategy}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {displayed.map(photo => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                scenes={scenes}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {displayed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📸</div>
          <p>Chưa có ảnh nào. Upload ảnh đầu tiên!</p>
        </div>
      )}
    </div>
  )
}
