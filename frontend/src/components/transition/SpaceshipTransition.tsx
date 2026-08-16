import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useJourneyStore } from '../../store/journeyStore'

interface SpaceshipTransitionProps {
  onComplete: () => void
}

export function SpaceshipTransition({ onComplete }: SpaceshipTransitionProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const { setTransitioning } = useJourneyStore()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ─── Scene Setup ───────────────────────────────────────────────────────────
    const width = window.innerWidth
    const height = window.innerHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 0, 100)

    // ─── Hyperspace Warp Lines ──────────────────────────────────────────────────
    const starCount = 3000
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(starCount * 6) // 2 points per line (head, tail)
    const starVel = new Float32Array(starCount)
    const starColors = new Float32Array(starCount * 6)
    
    const colorChoices = [
      new THREE.Color(0x4f46e5), // Indigo
      new THREE.Color(0x7c3aed), // Violet
      new THREE.Color(0x06b6d4), // Cyan
      new THREE.Color(0xffffff), // White
    ]

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 600
      const y = (Math.random() - 0.5) * 600
      const z = (Math.random() - 0.5) * 1000
      
      starPos[i * 6] = x
      starPos[i * 6 + 1] = y
      starPos[i * 6 + 2] = z
      
      starPos[i * 6 + 3] = x
      starPos[i * 6 + 4] = y
      starPos[i * 6 + 5] = z - 2
      
      starVel[i] = 1 + Math.random() * 3

      const col = colorChoices[Math.floor(Math.random() * colorChoices.length)]
      starColors[i * 6] = col.r
      starColors[i * 6 + 1] = col.g
      starColors[i * 6 + 2] = col.b
      starColors[i * 6 + 3] = col.r
      starColors[i * 6 + 4] = col.g
      starColors[i * 6 + 5] = col.b
    }
    
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
    
    const lineMat = new THREE.LineBasicMaterial({ 
      vertexColors: true, 
      transparent: true, 
      opacity: 0.9,
      blending: THREE.AdditiveBlending 
    })
    
    const lines = new THREE.LineSegments(starGeo, lineMat)
    scene.add(lines)

    // ─── Flash Effect ───────────────────────────────────────────────────────────
    const flashGeo = new THREE.PlaneGeometry(width * 2, height * 2)
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
    const flash = new THREE.Mesh(flashGeo, flashMat)
    flash.position.z = 80
    scene.add(flash)

    // ─── Animation ──────────────────────────────────────────────────────────────
    let elapsed = 0
    const DURATION = 2.2 // seconds
    let animId: number

    const animate = () => {
      animId = requestAnimationFrame(animate)
      elapsed += 0.016 

      const progress = Math.min(elapsed / DURATION, 1)
      
      // Exponential speed increase for warp effect
      const speedMult = Math.pow(progress, 4) * 800

      const positions = starGeo.attributes.position.array as Float32Array

      for (let i = 0; i < starCount; i++) {
        starVel[i] += 0.1 + speedMult * 0.05
        
        // Move head forward (towards camera +z)
        positions[i * 6 + 2] += starVel[i]
        
        // Stretch tail backwards based on velocity
        positions[i * 6 + 5] = positions[i * 6 + 2] - starVel[i] * 4

        // Reset if passed camera
        if (positions[i * 6 + 2] > 150) {
          positions[i * 6 + 2] = -1000
          positions[i * 6 + 5] = -1000
          starVel[i] = 1 + Math.random() * 3
        }
      }
      starGeo.attributes.position.needsUpdate = true
      
      // Screen shake at peak warp
      if (progress > 0.4 && progress < 0.8) {
         camera.position.x = (Math.random() - 0.5) * 2
         camera.position.y = (Math.random() - 0.5) * 2
      } else {
         camera.position.x = 0
         camera.position.y = 0
      }

      // Flash at the end
      if (progress > 0.75) {
        flashMat.opacity = (progress - 0.75) * 4
      }

      renderer.render(scene, camera)

      if (elapsed >= DURATION) {
        cancelAnimationFrame(animId)
        cleanup()
        setTransitioning(false)
        onComplete()
      }
    }

    animate()

    const cleanup = () => {
      cancelAnimationFrame(animId)
      renderer.dispose()
      if (renderer.forceContextLoss) renderer.forceContextLoss()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }

    return cleanup
  }, [onComplete, setTransitioning])

  return (
    <div
      ref={mountRef}
      className="transition-overlay"
      style={{ pointerEvents: 'none', background: '#000' }}
    />
  )
}
