import React, { useEffect, useState } from 'react'
import { photosApi } from '../../api/client'
import { AstronautFloat } from '../astronaut/AstronautFloat'
import type { Astronaut } from '../../store/journeyStore'
import GlitterWrap from './GlitterWrap'

interface GlitterSceneProps { sceneId: string; title: string; description: string }

export function GlitterScene({ sceneId, title, description }: GlitterSceneProps) {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])

  useEffect(() => {
    photosApi.getAll(sceneId).then(res => setAstronauts(res.data))
  }, [sceneId])

  const positions = React.useMemo(() => astronauts.map(() => ({
    x: 80 + Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 200 : 1000),
    y: 60 + Math.random() * (typeof window !== 'undefined' ? window.innerHeight - 180 : 800)
  })), [astronauts])

  return (
    <div className="scene-wrapper" style={{ background: '#0a0520' }}>
      <div className="absolute inset-0 z-0">
        <GlitterWrap
            particleCount={400}
            color1="#ffffff"
            color2="#a78bfa"
            color3="#06b6d4"
            speed={4}
            density={80}
            starSize={15}
            focalDepth={15}
            turbulence={2}
            brightness={90}
            glitterIntensity={5}
            trailAmount={95}
        />
      </div>

      {astronauts.map((a, i) => (
        <AstronautFloat
          key={a.id} astronaut={a} motionStyle="float-up"
          initialX={positions[i]?.x || 0}
          initialY={positions[i]?.y || 0}
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
