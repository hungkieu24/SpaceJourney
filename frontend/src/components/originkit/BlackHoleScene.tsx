import { useEffect, useState } from 'react'
import { photosApi } from '../../api/client'
import { AstronautFloat } from '../astronaut/AstronautFloat'
import type { Astronaut } from '../../store/journeyStore'

function BlackHoleVisual() {
  return (
    <div style={{ position: 'relative', width: '450px', height: '450px' }}>
      <style>{`
        @keyframes bh-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes bh-pulse { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
      `}</style>
      {/* Accretion disk rings */}
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          position: 'absolute',
          inset: `${(i - 1) * 30}px`,
          borderRadius: '50%',
          border: `${5 - i}px solid rgba(${i < 3 ? '251,146,60' : '124,58,237'},${0.7 - i * 0.1})`,
          filter: `blur(${i}px)`,
          animation: `bh-spin ${3 + i * 2}s linear infinite ${i % 2 === 0 ? 'reverse' : ''}`,
          boxShadow: `0 0 ${20 + i * 10}px rgba(251,146,60,${0.3 - i * 0.05})`,
        }} />
      ))}
      {/* Event horizon — black center */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '120px', height: '120px',
        borderRadius: '50%',
        background: '#000',
        boxShadow: '0 0 80px rgba(0,0,0,1), 0 0 40px rgba(124,58,237,0.4)',
        animation: 'bh-pulse 4s ease-in-out infinite',
      }} />
    </div>
  )
}

interface BlackHoleSceneProps { sceneId: string; title: string; description: string }

export function BlackHoleScene({ sceneId, title, description }: BlackHoleSceneProps) {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])

  useEffect(() => {
    photosApi.getAll(sceneId).then(res => setAstronauts(res.data))
  }, [sceneId])

  // Vị trí theo quỹ đạo hút vào hố đen
  const getOrbitPos = (i: number, total: number) => {
    const angle = (i / Math.max(total, 1)) * 2 * Math.PI
    const r = 230 + Math.sin(i) * 30
    return {
      x: window.innerWidth / 2 + Math.cos(angle) * r - 40,
      y: window.innerHeight / 2 + Math.sin(angle) * r * 0.5 - 50,
    }
  }

  return (
    <div className="scene-wrapper" style={{ background: 'radial-gradient(ellipse at center, #0a0010 0%, #030712 60%)' }}>
      {/* Deep space glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <BlackHoleVisual />

      {astronauts.map((a, i) => {
        const pos = getOrbitPos(i, astronauts.length)
        return (
          <AstronautFloat
            key={a.id} astronaut={a} motionStyle="spiral-in"
            initialX={pos.x} initialY={pos.y}
            delay={i * 0.6}
          />
        )
      })}

      <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.2em', color: '#f97316', textTransform: 'uppercase' }}>
          ⚠ Khu Vực Nguy Hiểm
        </p>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>{title}</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', marginTop: '8px', fontSize: '0.9rem' }}>{description}</p>
      </div>
    </div>
  )
}
