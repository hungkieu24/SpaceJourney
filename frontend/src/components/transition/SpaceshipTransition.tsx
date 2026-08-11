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
    camera.position.set(0, 0, 10)

    // ─── Starfield Particles ────────────────────────────────────────────────────
    const starCount = 400
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 60
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 30
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.7 })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // ─── Low-Poly Spaceship ─────────────────────────────────────────────────────
    const shipGroup = new THREE.Group()

    // Thân tàu chính (ConeGeometry)
    const bodyGeo = new THREE.ConeGeometry(0.4, 1.6, 6)
    const bodyMat = new THREE.MeshPhongMaterial({
      color: 0x7c3aed,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.3,
      shininess: 80,
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.rotation.z = -Math.PI / 2 // Nằm ngang, mũi nhọn về phía phải
    shipGroup.add(body)

    // Cánh trái
    const wingGeo = new THREE.BoxGeometry(0.6, 0.08, 0.4)
    const wingMat = new THREE.MeshPhongMaterial({ color: 0x4f46e5, emissive: 0x7c3aed, emissiveIntensity: 0.2 })
    const wingLeft = new THREE.Mesh(wingGeo, wingMat)
    wingLeft.position.set(-0.2, 0.3, 0)
    wingLeft.rotation.z = 0.3
    shipGroup.add(wingLeft)

    // Cánh phải
    const wingRight = new THREE.Mesh(wingGeo, wingMat)
    wingRight.position.set(-0.2, -0.3, 0)
    wingRight.rotation.z = -0.3
    shipGroup.add(wingRight)

    // Engine glow
    const engineGeo = new THREE.SphereGeometry(0.15, 8, 8)
    const engineMat = new THREE.MeshPhongMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 1,
    })
    const engine = new THREE.Mesh(engineGeo, engineMat)
    engine.position.set(-0.8, 0, 0)
    shipGroup.add(engine)

    // Bắt đầu từ bên trái màn hình
    shipGroup.position.set(-14, 0, 0)
    scene.add(shipGroup)

    // ─── Lighting ───────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x111133, 2)
    scene.add(ambientLight)
    const pointLight = new THREE.PointLight(0x7c3aed, 3, 20)
    pointLight.position.set(0, 3, 5)
    scene.add(pointLight)

    // ─── Animation ──────────────────────────────────────────────────────────────
    let elapsed = 0
    const DURATION = 1.8 // giây
    let animId: number

    const animate = () => {
      animId = requestAnimationFrame(animate)
      elapsed += 0.016 // ~60fps

      // Tàu bay từ trái sang phải
      const progress = elapsed / DURATION
      shipGroup.position.x = THREE.MathUtils.lerp(-14, 18, Math.pow(progress, 0.7))

      // Nhấp nhô nhẹ theo chiều dọc
      shipGroup.position.y = Math.sin(elapsed * 4) * 0.15

      // Xoay nhẹ
      shipGroup.rotation.z = Math.sin(elapsed * 3) * 0.08

      // Engine glow pulsate
      engineMat.emissiveIntensity = 0.8 + Math.sin(elapsed * 10) * 0.2

      // Sao lướt ngược chiều (tạo cảm giác tốc độ)
      stars.position.x -= 0.15

      // Engine light theo tàu
      pointLight.position.x = shipGroup.position.x

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
      style={{ pointerEvents: 'none' }}
    />
  )
}
