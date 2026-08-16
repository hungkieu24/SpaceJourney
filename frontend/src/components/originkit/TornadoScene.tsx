import { useEffect, useState } from 'react'
import { photosApi } from '../../api/client'
import { AstronautFloat } from '../astronaut/AstronautFloat'
import type { Astronaut } from '../../store/journeyStore'
import Tornado from './Tornado'

interface TornadoSceneProps { sceneId: string; title: string; description: string }

export function TornadoScene({ sceneId, title, description }: TornadoSceneProps) {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])

  useEffect(() => {
    photosApi.getAll(sceneId).then(res => setAstronauts(res.data))
  }, [sceneId])

  // Vị trí đã được chuyển vào AstronautFloat


  return (
    <div className="scene-wrapper" style={{ background: '#000000', width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      
      {/* Originkit Tornado Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Tornado
            background="#000000"
            topRadius={500}
            waistRadius={100}
            waistPosition={60}
            bottomRadius={1200}
            twist={4}
            zoom={70}
            speed={15}
            direction="right"
            dots={true}
            comets={true}
            repel={true}
        />
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
        {astronauts.map((a, i) => {
          // Negative delay distributes them evenly along the 20s animation loop
          const delay = (i / Math.max(astronauts.length, 1)) * -20;
          return (
            <div key={a.id} style={{ pointerEvents: 'auto' }}>
                <AstronautFloat
                  astronaut={a} motionStyle="tornado-swirl"
                  initialX={0} initialY={0}
                  delay={delay}
                />
            </div>
          )
        })}
      </div>

      <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, pointerEvents: 'none' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          Cơn Lốc Thiên Hà
        </p>
        <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginTop: '4px', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>{title}</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', marginTop: '8px', fontSize: '1rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{description}</p>
      </div>
    </div>
  )
}
