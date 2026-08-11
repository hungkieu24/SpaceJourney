import { useEffect, useState } from 'react'
import { scenesApi, photosApi } from '../../api/client'

export function AdminDashboard() {
  const [stats, setStats] = useState({ scenes: 0, photos: 0, activeScenes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      scenesApi.getAll(true),
      photosApi.getAll(undefined, true),
    ]).then(([scenesRes, photosRes]) => {
      const scenes = scenesRes.data
      setStats({
        scenes: scenes.length,
        activeScenes: scenes.filter((s: any) => s.isVisible).length,
        photos: photosRes.data.length,
      })
      setLoading(false)
    })
  }, [])

  const statCards = [
    { label: 'Tổng số cảnh', value: stats.scenes, icon: '🎬', color: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)' },
    { label: 'Cảnh đang bật', value: stats.activeScenes, icon: '✅', color: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
    { label: 'Ảnh phi hành gia', value: stats.photos, icon: '📸', color: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
        Mission Control 🚀
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
        Quản lý hành trình vũ trụ của bạn
      </p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: card.color,
            border: `1px solid ${card.border}`,
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{card.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              {loading ? '—' : card.value}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h2>Truy cập nhanh</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/admin/scenes" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">🎬 Quản lý cảnh</button>
          </a>
          <a href="/admin/photos" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">📸 Upload ảnh mới</button>
          </a>
          <a href="/" target="_blank" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)' }}>
              🚀 Xem trang web
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}
