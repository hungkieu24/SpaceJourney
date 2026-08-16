import { useEffect, useRef, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent, useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { photosApi, scenesApi } from '../../api/client'
import type { Astronaut, Scene } from '../../store/journeyStore'

function SceneTab({ scene, active, onClick, count }: { scene: Scene | null, active: boolean, onClick: () => void, count: number }) {
  const id = scene ? `scene-${scene.id}` : 'scene-all'
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { sceneId: scene ? scene.id : '' }
  })

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className="btn-primary"
      style={{
        background: active ? undefined : 'rgba(255,255,255,0.05)',
        border: active ? undefined : isOver ? '1px dashed #fff' : '1px solid var(--color-border)',
        fontSize: '0.8rem',
        padding: '8px 16px',
        transition: 'all 0.2s',
        opacity: isOver ? 0.8 : 1,
        transform: isOver ? 'scale(1.05)' : 'scale(1)'
      }}
    >
      {scene ? scene.displayName : 'Tất cả'} ({count})
    </button>
  )
}

function SortablePhoto({ photo, scenes, onToggle, onEdit, onDelete }: {
  photo: Astronaut
  scenes: Scene[]
  onToggle: (id: string, v: boolean) => void
  onEdit: (photo: Astronaut) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id, data: { type: 'photo', photo } })

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
        cursor: 'pointer',
      }} onClick={() => onEdit(photo)}>
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
            onClick={e => e.stopPropagation()}
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
          <label className="toggle-switch" style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <input type="checkbox" checked={photo.isVisible} onChange={e => onToggle(photo.id, e.target.checked)} />
            <span className="toggle-slider" />
          </label>
          <div style={{ flex: 1 }}></div>
          <button className="btn-danger" onClick={(e) => {
            e.stopPropagation()
            if (confirm(`Xóa ảnh "${photo.name}"?`)) onDelete(photo.id)
          }} style={{ padding: '5px 8px', fontSize: '0.75rem' }}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

function ThumbnailPreview({ file }: { file: File }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return <img src={url} alt="preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
}

export function PhotoManager() {
  const [photos, setPhotos] = useState<Astronaut[]>([])
  const [scenes, setScenes] = useState<Scene[]>([])
  const [filterSceneId, setFilterSceneId] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({ files: [] as File[] })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingPhoto, setEditingPhoto] = useState<Astronaut | null>(null)

  // Edit Modal State
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editSceneId, setEditSceneId] = useState('')

  useEffect(() => {
    scenesApi.getAll(true).then(res => setScenes(res.data))
    photosApi.getAll(undefined, true).then(res => setPhotos(res.data))
  }, [])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const displayed = filterSceneId ? photos.filter(p => p.sceneId === filterSceneId) : photos

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    // Dropped on a tab
    if (String(over.id).startsWith('scene-')) {
      const targetSceneId = over.data.current?.sceneId || ''
      const photoId = String(active.id)
      const photo = photos.find(p => p.id === photoId)
      
      if (photo && photo.sceneId !== targetSceneId) {
        setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, sceneId: targetSceneId } : p))
        await photosApi.update(photoId, { sceneId: targetSceneId })
      }
      return
    }

    // Dropped on another photo (reorder)
    if (active.id !== over.id) {
      const oldIdx = displayed.findIndex(p => p.id === active.id)
      const newIdx = displayed.findIndex(p => p.id === over.id)
      const reordered = arrayMove(displayed, oldIdx, newIdx).map((p, i) => ({ ...p, order: i }))
      setPhotos(prev => {
        const others = prev.filter(p => !reordered.find(r => r.id === p.id))
        return [...others, ...reordered]
      })
      await Promise.all(reordered.map(p => photosApi.update(p.id, { order: p.order })))
    }
  }

  const handleUpload = async () => {
    if (uploadForm.files.length === 0) return
    setUploading(true)
    
    try {
      await Promise.all(uploadForm.files.map(async (file) => {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('name', '')
        fd.append('description', '')
        fd.append('sceneId', '')
        await photosApi.upload(fd)
      }))
      
      const refreshRes = await photosApi.getAll(undefined, true)
      setPhotos(refreshRes.data)
      setUploadForm({ files: [] })
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFilterSceneId('') // Switch to "All" tab after upload
    } catch (e: any) {
      console.error(e)
      alert(e.response?.data?.message || 'Có lỗi xảy ra khi upload ảnh. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
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

  const openEditModal = (photo: Astronaut) => {
    setEditingPhoto(photo)
    setEditName(photo.name)
    setEditDesc(photo.description)
    setEditSceneId(photo.sceneId || '')
  }

  const closeEditModal = () => {
    setEditingPhoto(null)
  }

  const saveEditModal = () => {
    if (editingPhoto) {
      handleUpdate(editingPhoto.id, editName, editDesc, editSceneId)
      closeEditModal()
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>📸 Quản lý ảnh</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Upload, sắp xếp và quản lý ảnh phi hành gia.</p>

      {/* Upload form */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <h2>Upload ảnh mới</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={e => setUploadForm({ files: Array.from(e.target.files || []) })}
            style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', flex: 1 }}
          />
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={uploading || uploadForm.files.length === 0}
          >
            {uploading ? '⬆️ Đang upload...' : '⬆️ Upload'}
          </button>
        </div>
        {uploadForm.files.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {uploadForm.files.slice(0, 5).map((f, i) => (
              <ThumbnailPreview key={i} file={f} />
            ))}
            {uploadForm.files.length > 5 && (
              <div style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem', border: '1px dashed var(--color-border)' }}>
                +{uploadForm.files.length - 5}
              </div>
            )}
          </div>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {/* Filter by scene (Droppable Tabs) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <SceneTab 
            scene={null} 
            active={filterSceneId === ''} 
            onClick={() => setFilterSceneId('')} 
            count={photos.length} 
          />
          {scenes.map(s => (
            <SceneTab 
              key={s.id} 
              scene={s} 
              active={filterSceneId === s.id} 
              onClick={() => setFilterSceneId(s.id)} 
              count={photos.filter(p => p.sceneId === s.id).length} 
            />
          ))}
        </div>

        {/* Photo Grid with DnD (Sortable inside the list) */}
        <SortableContext items={displayed.map(p => p.id)} strategy={rectSortingStrategy}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {displayed.map(photo => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                scenes={scenes}
                onToggle={handleToggle}
                onEdit={openEditModal}
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

      {/* Edit Modal */}
      {editingPhoto && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={closeEditModal}>
          <div className="admin-card" style={{ maxWidth: '400px', width: '100%', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '16px' }}>Chỉnh sửa thông tin</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                className="form-input" 
                placeholder="Tên phi hành gia" 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
              />
              <textarea 
                className="form-input" 
                placeholder="Mô tả ngắn (1-2 dòng)" 
                value={editDesc} 
                onChange={e => setEditDesc(e.target.value)} 
                rows={3} 
                style={{ resize: 'vertical', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }} 
              />
              <select
                className="form-input"
                value={editSceneId}
                onChange={e => setEditSceneId(e.target.value)}
                style={{ backgroundColor: '#1e293b', color: 'white' }}
              >
                <option value="">— Chưa gán cảnh —</option>
                {scenes.map(s => <option key={s.id} value={s.id}>{s.displayName}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={saveEditModal}>
                  Lưu thay đổi
                </button>
                <button 
                  onClick={closeEditModal} 
                  style={{ 
                    background: 'none', border: '1px solid var(--color-border)', 
                    borderRadius: '8px', color: 'var(--color-text-muted)', 
                    padding: '8px 16px', cursor: 'pointer' 
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
