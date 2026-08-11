import { AnimatePresence, motion } from 'framer-motion'
import { useJourneyStore, type Astronaut } from '../../store/journeyStore'

export function AstronautModal() {
  const { selectedAstronaut, closeAstronaut } = useJourneyStore()

  return (
    <AnimatePresence>
      {selectedAstronaut && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeAstronaut}
        >
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeAstronaut} aria-label="Đóng">
              ✕
            </button>
            <img
              src={selectedAstronaut.cloudinaryUrl}
              alt={selectedAstronaut.name}
              loading="lazy"
            />
            <h3>{selectedAstronaut.name}</h3>
            {selectedAstronaut.description && (
              <p>{selectedAstronaut.description}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
