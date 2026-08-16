import { useEffect, useState } from 'react'
import { photosApi } from '../../api/client'
import { AstronautFloat } from '../astronaut/AstronautFloat'
import type { Astronaut } from '../../store/journeyStore'
import BlackHole from './BlackHole'
import { GlitchText } from './GlitchText'
import Tornado from './Tornado'
import GlitterWrap from './GlitterWrap'
import GalleryTunnel from './GalleryTunnel'

interface BlackHoleSceneProps { sceneId: string; title: string; description: string }

type Phase = 'viewing' | 'shaking' | 'sucking' | 'spiral'

export function BlackHoleScene({ sceneId, title, description }: BlackHoleSceneProps) {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])
  const [phase, setPhase] = useState<Phase>('viewing')

  useEffect(() => {
    photosApi.getAll(sceneId).then(res => setAstronauts(res.data))
  }, [sceneId])

  // Sequence of animations
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('shaking'), 3000)
    const t2 = setTimeout(() => setPhase('sucking'), 5000)
    const t3 = setTimeout(() => setPhase('spiral'), 6000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  const getOrbitPos = (i: number, total: number) => {
    const angle = (i / Math.max(total, 1)) * 2 * Math.PI
    const r = 230 + Math.sin(i) * 30
    return {
      x: window.innerWidth / 2 + Math.cos(angle) * r - 40,
      y: window.innerHeight / 2 + Math.sin(angle) * r * 0.5 - 50,
    }
  }

  // Animation styles based on phase
  const wrapperStyle = {
    background: '#000000',
    animation: phase === 'shaking' ? 'screen-shake 0.5s infinite' : 'none',
  }

  const innerStyle = {
    width: '100%',
    height: '100%',
    animation: phase === 'sucking' ? 'suck-into-center 1s forwards' : 'none',
  }

  const spiralImagesProps = astronauts.map(a => ({ src: a.cloudinaryUrl }))

  return (
    <div className="scene-wrapper relative w-full h-[100dvh] overflow-hidden" style={wrapperStyle}>
      
      {phase === 'spiral' ? (
        <div className="absolute inset-0 z-0 animate-in fade-in duration-1000">
          <GalleryTunnel
            images={spiralImagesProps.length > 0 ? spiralImagesProps : undefined}
            speed={40}
            boost={150}
            fade={100}
            label={true}
            labelText="Nhấn đè chuột để đi nhanh hơn"
            labelFill="#FFFFFF"
            labelColor="#000000"
          />
          {/* Optional: Add some text over the spiral */}
          <div className="absolute top-[40px] left-1/2 -translate-x-1/2 text-center z-30 pointer-events-none drop-shadow-md">
            <h2 className="text-[2rem] font-bold text-white opacity-80">{title}</h2>
          </div>
        </div>
      ) : (
        <div style={innerStyle} className="relative w-full h-full">
          {/* Originkit BlackHole Background */}
          <div className="absolute inset-0 z-0">
            <BlackHole
                speed={1.5}
                strokeColor="#ff4d4d"
                lineWidth={1.5}
                lines={20}
                perspective={8}
                curve={6}
                rotationSpeed={1.5}
                rotationAngle={15}
                glowOpacity={8}
                background="#000000"
                showMask={true}
                maskSize={10}
            />
          </div>
          
          {/* Astronauts floating above the hole */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {astronauts.map((a, i) => {
              const pos = getOrbitPos(i, astronauts.length)
              return (
                <div key={a.id} className="pointer-events-auto">
                  <AstronautFloat
                    astronaut={a} motionStyle="spiral-in"
                    initialX={pos.x} initialY={pos.y}
                    delay={i * 0.6}
                  />
                </div>
              )
            })}
          </div>

          <div className="absolute top-[40px] left-1/2 -translate-x-1/2 text-center z-30 pointer-events-none">
            <p className="font-mono text-[0.7rem] tracking-[0.2em] text-orange-500 uppercase">
              ⚠ Khu Vực Nguy Hiểm
            </p>
            <h2 className="text-[3rem] mt-[4px] drop-shadow-lg">
              <GlitchText text={title} className="text-white" />
            </h2>
            <p className="text-slate-300 max-w-[400px] mt-[8px] text-[1rem] mx-auto leading-relaxed drop-shadow-md">
              {description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
