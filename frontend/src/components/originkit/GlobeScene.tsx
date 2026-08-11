import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { photosApi } from '../../api/client'
import { AstronautFloat } from '../astronaut/AstronautFloat'
import type { Astronaut } from '../../store/journeyStore'

// Placeholder iframe-based Originkit component
// TODO: Replace with actual Originkit Globe component code
function OriginKitGlobe() {
  return (
    <div style={{
      width: '500px', height: '500px',
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #1a4fd6 0%, #0a2d8a 40%, #030e2e 80%, #000 100%)',
      boxShadow: '0 0 80px rgba(26, 79, 214, 0.5), inset 0 0 80px rgba(0,0,20,0.5)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'globeSpin 20s linear infinite',
    }}>
      <style>{`
        @keyframes globeSpin {
          from { box-shadow: 0 0 80px rgba(26, 79, 214, 0.5), inset 0 0 80px rgba(0,0,20,0.5); }
          50% { box-shadow: 0 0 120px rgba(26, 79, 214, 0.7), inset 0 0 60px rgba(0,0,20,0.5); }
          to { box-shadow: 0 0 80px rgba(26, 79, 214, 0.5), inset 0 0 80px rgba(0,0,20,0.5); }
        }
      `}</style>
      {/* Continent shapes */}
      <div style={{
        position: 'absolute', width: '60%', height: '40%', top: '20%', left: '10%',
        background: 'rgba(22, 163, 74, 0.4)', borderRadius: '60% 40% 50% 30%',
      }} />
      <div style={{
        position: 'absolute', width: '25%', height: '35%', top: '30%', right: '15%',
        background: 'rgba(22, 163, 74, 0.35)', borderRadius: '40% 60% 30% 50%',
      }} />
    </div>
  )
}

interface GlobeSceneProps {
  sceneId: string
}

export function GlobeScene({ sceneId }: GlobeSceneProps) {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])

  useEffect(() => {
    photosApi.getAll(sceneId).then(res => setAstronauts(res.data))
  }, [sceneId])

  // Vị trí orbit quanh địa cầu
  const getOrbitalPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI
    const rx = 320  // bán trục X của ellipse
    const ry = 160  // bán trục Y
    return {
      x: window.innerWidth / 2 + Math.cos(angle) * rx - 40,
      y: window.innerHeight / 2 + Math.sin(angle) * ry - 50,
    }
  }

  return (
    <div className="scene-wrapper" style={{ background: 'radial-gradient(ellipse at center, #050d2e 0%, #030712 70%)' }}>
      {/* Hào quang xanh */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,79,214,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <OriginKitGlobe />

      {/* Astronaut photos orbit the globe */}
      {astronauts.map((astronaut, i) => {
        const pos = getOrbitalPosition(i, Math.max(astronauts.length, 1))
        return (
          <AstronautFloat
            key={astronaut.id}
            astronaut={astronaut}
            motionStyle="orbit"
            initialX={pos.x}
            initialY={pos.y}
            delay={i * 0.5}
          />
        )
      })}

      {/* Scene title overlay */}
      <div style={{
        position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)',
        textAlign: 'center', zIndex: 10,
      }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          Điểm Xuất Phát
        </p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>
          Trái Đất
        </h1>
      </div>
    </div>
  )
}
