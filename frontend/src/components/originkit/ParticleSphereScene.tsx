import { useEffect, useState } from 'react'
import { photosApi } from '../../api/client'
import { AstronautFloat } from '../astronaut/AstronautFloat'
import type { Astronaut } from '../../store/journeyStore'
import RisingLines from './RisingLines'
function ParticleSphereVisual() {
  return (
    <div style={{ position: 'relative', width: '400px', height: '400px' }}>
      {/* Center glow */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(79,70,229,0.1) 40%, transparent 70%)',
        animation: 'pulse 3s ease-in-out infinite',
      }} />
      {/* Particle rings */}
      {[1, 2, 3].map(ring => (
        <div key={ring} style={{
          position: 'absolute',
          inset: `${ring * 20}px`,
          borderRadius: '50%',
          border: `1px solid rgba(124,58,237,${0.4 - ring * 0.1})`,
          animation: `spin${ring} ${6 + ring * 2}s linear infinite`,
        }} />
      ))}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes spin1 { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes spin2 { from{transform:rotate(0)} to{transform:rotate(-360deg)} }
        @keyframes spin3 { from{transform:rotate(45deg)} to{transform:rotate(405deg)} }
      `}</style>
      {/* Center orb */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '80px', height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #a78bfa, #7c3aed)',
        boxShadow: '0 0 60px rgba(124,58,237,0.8)',
      }} />
    </div>
  )
}

interface ParticleSphereSceneProps { sceneId: string; title: string; description: string }

export function ParticleSphereScene({ sceneId, title, description }: ParticleSphereSceneProps) {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])

  useEffect(() => {
    photosApi.getAll(sceneId).then(res => setAstronauts(res.data))
  }, [sceneId])

  return (
    <div className="scene-wrapper" style={{ background: '#000000', width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <RisingLines 
            color="#a78bfa" 
            horizonColor="#7c3aed" 
            particles={1000} 
            riseSpeed={30} 
            scale={8} 
        />
      </div>

      {astronauts.map((a, i) => (
        <AstronautFloat
          key={a.id} astronaut={a} motionStyle="float"
          initialX={100 + Math.random() * (window.innerWidth - 200)}
          initialY={80 + Math.random() * (window.innerHeight - 200)}
          delay={i * 0.8}
        />
      ))}

      <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          Vũ Trụ Lấp Lánh
        </p>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>{title}</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', marginTop: '8px', fontSize: '0.9rem' }}>{description}</p>
      </div>
    </div>
  )
}
