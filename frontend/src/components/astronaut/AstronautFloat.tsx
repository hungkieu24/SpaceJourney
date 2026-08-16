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
        const frames = 100;
        const xPath = [];
        const yPath = [];
        const scalePath = [];
        const rotatePath = [];
        const opacityPath = [];
        const zIndexPath = [];
        
        // Loop from bottom to top
        for(let j = 0; j <= frames; j++) {
            let progress = j / frames; // 0 (bottom) to 1 (top)
            
            // Y from 110vh (below screen) to -20vh (above screen)
            let yPos = typeof window !== 'undefined' ? window.innerHeight * (1.1 - 1.3 * progress) : 1000 - 1200 * progress;
            yPath.push(yPos);
            
            // Radius estimation based on Tornado.tsx: bottom=1200, waist=100 (at 60% down), top=500
            // Since we go from bottom (progress=0) to top (progress=1):
            // Waist is at progress = 0.4
            let r;
            if (progress < 0.4) {
               // bottom to waist: 1200 -> 100
               let t = 1 - progress / 0.4;
               r = 100 + 1100 * (t * t); // ease out curve
            } else {
               // waist to top: 100 -> 500
               let t = (progress - 0.4) / 0.6;
               r = 100 + 400 * (t * t); // ease in curve
            }
            // Scale radius down so it fits the viewport
            let maxR = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
            r = (r / 1200) * maxR; 
            
            // 4 full rotations as it goes up
            let angle = progress * 8 * Math.PI; 
            
            let cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
            xPath.push(cx + Math.cos(angle) * r - 50); // -50 to center the 100px wide card
            
            // Z-depth simulated by sine wave
            let z = Math.sin(angle);
            scalePath.push(0.8 + z * 0.3); // scale from 0.5 to 1.1 based on depth
            
            // Z-index: front = high, back = low
            zIndexPath.push(z > 0 ? 10 : 1);
            
            // Rotation twist
            rotatePath.push(progress * 360 + z * 20);
            
            // Opacity: fade in at bottom, fade out at top, dim when behind
            let op = 1;
            if (progress < 0.05) op = progress / 0.05;
            if (progress > 0.95) op = (1 - progress) / 0.05;
            if (z < -0.3) op *= 0.5; // Darker when in the back of the tornado
            opacityPath.push(op);
        }

        return {
          x: xPath,
          y: yPath,
          scale: scalePath,
          rotate: rotatePath,
          opacity: opacityPath,
          zIndex: zIndexPath,
          transition: { duration: 20, repeat: Infinity, ease: 'linear', delay },
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
      style={{ top: 0, left: 0 }}
      animate={getAnimation()}
      whileHover={{ scale: 1.15, zIndex: 10 }}
      onClick={() => openAstronaut(astronaut)}
    >
      <img src={astronaut.cloudinaryUrl} alt={astronaut.name} loading="lazy" />
      <div className="name-tag">{astronaut.name}</div>
    </motion.div>
  )
}
