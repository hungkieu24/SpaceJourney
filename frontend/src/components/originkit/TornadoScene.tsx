import { useEffect, useState } from 'react'
import { photosApi } from '../../api/client'
import { AstronautFloat } from '../astronaut/AstronautFloat'
import type { Astronaut } from '../../store/journeyStore'

function TornadoVisual() {
  return (
    <div style={{ position: 'relative', width: '300px', height: '500px', display: 'flex', justifyContent: 'center' }}>
      <style>{`
        @keyframes tornado-spin { from{transform:rotateY(0)} to{transform:rotateY(360deg)} }
        @keyframes tornado-drift { 0%,100%{transform:translateX(0)} 50%{transform:translateX(8px)} }
      `}</style>
      {/* Tornado funnel — nhiều ellipse xếp chồng */}
      {Array.from({ length: 12 }).map((_, i) => {
        const yPos = i * 38
        const width = 20 + i * 22
        const opacity = 0.15 + i * 0.05
        return (
          <div key={i} style={{
            position: 'absolute',
            top: `${yPos}px`,
            width: `${width}px`,
            height: '16px',
            borderRadius: '50%',
            border: `2px solid rgba(124,58,237,${opacity})`,
            background: `rgba(79,70,229,${opacity * 0.3})`,
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'blur(1px)',
            animation: `tornado-drift ${1.5 + i * 0.1}s ease-in-out infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            boxShadow: `0 0 ${8 + i * 2}px rgba(124,58,237,0.3)`,
          }} />
        )
      })}
      {/* Center energy column */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '3px',
        background: 'linear-gradient(to bottom, rgba(167,139,250,0.9), rgba(79,70,229,0.3), transparent)',
        filter: 'blur(2px)',
      }} />
    </div>
  )
}

interface TornadoSceneProps { sceneId: string; title: string; description: string }

export function TornadoScene({ sceneId, title, description }: TornadoSceneProps) {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])

  useEffect(() => {
    photosApi.getAll(sceneId).then(res => setAstronauts(res.data))
  }, [sceneId])

  // Vị trí xoắn theo đường xoắn ốc của tornado
  const getSwirlPos = (i: number) => {
    const t = (i / Math.max(astronauts.length, 1)) * 2 * Math.PI
    const r = 180 + Math.cos(i) * 40
    return {
      x: window.innerWidth / 2 + Math.cos(t + i) * r - 40,
      y: window.innerHeight / 2 + (i / astronauts.length - 0.5) * 300 - 50,
    }
  }

  return (
    <div className="scene-wrapper" style={{ background: 'radial-gradient(ellipse at 50% 30%, #0f0824 0%, #030712 70%)' }}>
      <TornadoVisual />

      {astronauts.map((a, i) => {
        const pos = getSwirlPos(i)
        return (
          <AstronautFloat
            key={a.id} astronaut={a} motionStyle="tornado-swirl"
            initialX={pos.x} initialY={pos.y}
            delay={i * 0.4}
          />
        )
      })}

      <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          Cơn Lốc Thiên Hà
        </p>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>{title}</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', marginTop: '8px', fontSize: '0.9rem' }}>{description}</p>
      </div>
    </div>
  )
}
