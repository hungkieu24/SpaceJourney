import { useEffect, useState } from 'react'
import { photosApi } from '../../api/client'
import { AstronautFloat } from '../astronaut/AstronautFloat'
import type { Astronaut } from '../../store/journeyStore'

function GlitterBackground() {
  // Generate 80 star particles via CSS
  const stars = Array.from({ length: 80 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.5 + Math.random() * 2,
    duration: 2 + Math.random() * 4,
    delay: Math.random() * 5,
    color: Math.random() > 0.7 ? 'rgba(167,139,250,0.9)' : 'rgba(255,255,255,0.8)',
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          borderRadius: '50%',
          background: s.color,
          animation: `twinkle ${s.duration}s ease-in-out infinite ${s.delay}s`,
        }} />
      ))}
      {/* Galaxy nebula overlays */}
      <div style={{
        position: 'absolute', top: '20%', left: '10%',
        width: '300px', height: '200px',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)',
        filter: 'blur(20px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '10%',
        width: '250px', height: '180px',
        background: 'radial-gradient(ellipse, rgba(6,182,212,0.05) 0%, transparent 70%)',
        filter: 'blur(20px)',
      }} />
    </div>
  )
}

interface GlitterSceneProps { sceneId: string; title: string; description: string }

export function GlitterScene({ sceneId, title, description }: GlitterSceneProps) {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])

  useEffect(() => {
    photosApi.getAll(sceneId).then(res => setAstronauts(res.data))
  }, [sceneId])

  return (
    <div className="scene-wrapper" style={{ background: 'radial-gradient(ellipse at 50% 40%, #0a0520 0%, #030712 65%)' }}>
      <GlitterBackground />

      {astronauts.map((a, i) => (
        <AstronautFloat
          key={a.id} astronaut={a} motionStyle="float"
          initialX={80 + Math.random() * (window.innerWidth - 200)}
          initialY={60 + Math.random() * (window.innerHeight - 180)}
          delay={i * 0.6}
        />
      ))}

      {/* Center finale text */}
      <div style={{ textAlign: 'center', zIndex: 10, position: 'relative' }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          letterSpacing: '0.25em', color: 'rgba(167,139,250,0.8)', textTransform: 'uppercase',
        }}>
          ✦ Hành Trình Kết Thúc ✦
        </p>
        <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginTop: '8px' }}>{title}</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', marginTop: '12px', lineHeight: 1.7 }}>{description}</p>
      </div>
    </div>
  )
}
