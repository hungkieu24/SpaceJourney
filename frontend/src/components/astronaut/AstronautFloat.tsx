import { useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useJourneyStore, type Astronaut } from '../../store/journeyStore'

interface AstronautFloatProps {
  astronaut: Astronaut
  /** Animation style phụ thuộc vào component cảnh */
  motionStyle: 'orbit' | 'float' | 'spiral-in' | 'tornado-swirl' | 'float-up'
  /** Vị trí ban đầu — random trong cảnh */
  initialX: number
  initialY: number
  /** Độ trễ animation (seconds) */
  delay?: number
}

export function AstronautFloat({
  astronaut,
  motionStyle,
  initialX,
  initialY,
  delay = 0,
}: AstronautFloatProps) {
  const { openAstronaut } = useJourneyStore()

  const getAnimation = (): any => {
    switch (motionStyle) {
      case 'orbit':
        return {
          x: [initialX, initialX + 40, initialX, initialX - 40, initialX],
          y: [initialY, initialY - 20, initialY + 20, initialY - 10, initialY],
          rotate: [0, 5, -5, 5, 0],
          transition: { duration: 8, repeat: Infinity, ease: 'easeInOut', delay },
        }
      case 'float':
        return {
          x: [initialX, initialX + 20, initialX - 15, initialX],
          y: [initialY, initialY - 30, initialY + 15, initialY],
          rotate: [0, 8, -5, 0],
          transition: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay },
        }
      case 'spiral-in':
        // Xoáy tròn quanh tâm (Black Hole)
        return {
          x: [initialX, initialX * 0.9, initialX * 0.8, initialX * 0.9, initialX],
          y: [initialY, initialY + 10, initialY - 10, initialY + 5, initialY],
          rotate: [0, 180, 360, 540, 720],
          transition: { duration: 12, repeat: Infinity, ease: 'linear', delay },
        }
      case 'tornado-swirl':
        // Xoắn lên theo path tornado
        return {
          x: [initialX, initialX + 30, initialX - 30, initialX + 15, initialX],
          y: [initialY, initialY - 20, initialY - 40, initialY - 60, initialY],
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 0.95, 0.9, 0.85, 1],
          transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay },
        }
      case 'float-up':
        const startY = typeof window !== 'undefined' ? window.innerHeight + 100 : 1000
        return {
          x: [initialX, initialX + 30, initialX - 30, initialX],
          y: [startY, -200],
          rotate: [0, 10, -10, 0],
          transition: { duration: 25, repeat: Infinity, ease: 'linear', delay },
        }
    }
  }

  return (
    <motion.div
      className="astronaut-card"
      style={{ left: initialX, top: initialY }}
      animate={getAnimation()}
      whileHover={{ scale: 1.15, zIndex: 10 }}
      onClick={() => openAstronaut(astronaut)}
    >
      <img src={astronaut.cloudinaryUrl} alt={astronaut.name} loading="lazy" />
      <div className="name-tag">{astronaut.name}</div>
    </motion.div>
  )
}
