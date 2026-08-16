import { useEffect, useState } from 'react'
import { photosApi } from '../../api/client'
import { AstronautFloat } from '../astronaut/AstronautFloat'
import type { Astronaut } from '../../store/journeyStore'
import Globe from './Globe'

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
    <div className="scene-wrapper" style={{ background: '#000000', width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      
      {/* Originkit Globe Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
         <Globe 
            speed={2} 
            scale={7} 
            oceanColor="#050d2e" 
            fillColor="#1a4fd6" 
            dots={{ color: "#ffffff", size: 5, density: 8, allDots: false }} 
            showOutline={true} 
            outlineColor="#4f8aff" 
            showGrid={true} 
            graticuleColor="#10255c"
         />
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
        {/* Astronaut photos orbit the globe */}
        {astronauts.map((astronaut, i) => {
          const pos = getOrbitalPosition(i, Math.max(astronauts.length, 1))
          return (
            <div key={astronaut.id} style={{ pointerEvents: 'auto' }}>
              <AstronautFloat
                astronaut={astronaut}
                motionStyle="orbit"
                initialX={pos.x}
                initialY={pos.y}
                delay={i * 0.5}
              />
            </div>
          )
        })}
      </div>

      {/* Scene title overlay */}
      <div style={{
        position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)',
        textAlign: 'center', zIndex: 10, pointerEvents: 'none'
      }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          Điểm Xuất Phát
        </p>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginTop: '4px', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          Trái Đất
        </h1>
      </div>
    </div>
  )
}
