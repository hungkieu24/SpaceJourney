import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useJourneyStore } from '../store/journeyStore'
import { scenesApi } from '../api/client'
import { LandscapeGuard } from '../components/ui/LandscapeGuard'
import { AstronautModal } from '../components/astronaut/AstronautModal'
import { SpaceshipTransition } from '../components/transition/SpaceshipTransition'
import { GlobeScene } from '../components/originkit/GlobeScene'
import { ParticleSphereScene } from '../components/originkit/ParticleSphereScene'
import { BlackHoleScene } from '../components/originkit/BlackHoleScene'
import { TornadoScene } from '../components/originkit/TornadoScene'
import { GlitterScene } from '../components/originkit/GlitterScene'


const SCENE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'globe': GlobeScene,
  'particle-sphere': ParticleSphereScene,
  'black-hole': BlackHoleScene,
  'tornado': TornadoScene,
  'glitter-wrap': GlitterScene,
}

export function JourneyPage() {
  const { scenes, currentSceneIndex, isTransitioning, setScenes, goToScene, setTransitioning } = useJourneyStore()
  const [nextSceneIndex, setNextSceneIndex] = useState<number | null>(null)
  const [showScene, setShowScene] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    scenesApi.getAll(false).then(res => {
      setScenes(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [setScenes])

  const handleContinue = () => {
    if (isTransitioning || currentSceneIndex >= scenes.length - 1) return
    const next = currentSceneIndex + 1
    setNextSceneIndex(next)
    setShowScene(false)
    setTransitioning(true)
  }

  const handleTransitionComplete = useCallback(() => {
    if (nextSceneIndex !== null) {
      goToScene(nextSceneIndex)
      setNextSceneIndex(null)
      setTimeout(() => setShowScene(true), 50)
    }
  }, [nextSceneIndex, goToScene])

  const currentScene = scenes[currentSceneIndex]
  const SceneComponent = currentScene ? SCENE_COMPONENTS[currentScene.componentType] : null
  const isLastScene = currentSceneIndex === scenes.length - 1

  if (loading) {
    return (
      <div style={{
        width: '100dvw', height: '100dvh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)',
        flexDirection: 'column', gap: '20px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid rgba(124,58,237,0.3)',
          borderTopColor: 'var(--color-accent)',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          KHỞI ĐỘNG HỆ THỐNG...
        </p>
      </div>
    )
  }

  return (
    <div className="journey-container">
      <LandscapeGuard />

      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>

      </div>

      {/* Scene Dots Indicator */}
      {scenes.length > 0 && (
        <div className="scene-dots">
          {scenes.map((_, i) => (
            <div
              key={i}
              className={`scene-dot ${i === currentSceneIndex ? 'active' : ''}`}
              onClick={() => !isTransitioning && goToScene(i)}
              title={scenes[i]?.displayName}
            />
          ))}
        </div>
      )}

      {/* Current Scene */}
      <AnimatePresence mode="wait">
        {showScene && SceneComponent && (
          <motion.div
            key={currentSceneIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          >
            <SceneComponent
              sceneId={currentScene.id}
              title={currentScene.title}
              description={currentScene.description}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Three.js Spaceship Transition */}
      {isTransitioning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--color-bg)' }}>
          <SpaceshipTransition onComplete={handleTransitionComplete} />
        </div>
      )}

      {/* Bottom Navigation */}
      {!isTransitioning && SceneComponent && (
        <motion.div
          className="scene-nav"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="scene-title-badge">
            {currentSceneIndex + 1} / {scenes.length} — {currentScene?.displayName}
          </p>
          {!isLastScene ? (
            <button className="continue-btn" onClick={handleContinue}>
              Tiếp tục hành trình →
            </button>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: 'rgba(167,139,250,0.7)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              ✦ Hành trình hoàn tất ✦
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Astronaut Detail Modal */}
      <AstronautModal />
    </div>
  )
}
