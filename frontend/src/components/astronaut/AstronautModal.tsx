import { AnimatePresence, motion } from 'framer-motion'
import { useJourneyStore } from '../../store/journeyStore'
import { StarBorder } from '../originkit/StarBorder'

export function AstronautModal() {
  const { selectedAstronaut, closeAstronaut } = useJourneyStore()

  return (
    <AnimatePresence>
      {selectedAstronaut && (
        <motion.div
          className="modal-overlay z-50 fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeAstronaut}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-auto max-w-[95vw]"
          >
            <StarBorder color="rgba(6, 182, 212, 0.8)">
              <div className="bg-slate-900/95 p-6 rounded-xl relative flex flex-col items-center">
                <button className="absolute top-4 right-4 w-8 h-8 rounded-full border border-slate-700 bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 hover:border-cyan-500 transition-colors z-10" onClick={closeAstronaut} aria-label="Đóng">
                  ✕
                </button>
                <img
                  src={selectedAstronaut.cloudinaryUrl}
                  alt={selectedAstronaut.name}
                  loading="lazy"
                  className="w-auto h-auto max-w-full max-h-[75vh] rounded-lg mb-4 shadow-lg shadow-cyan-500/20"
                />
                <h3 className="text-xl font-bold text-white mb-2 text-center">{selectedAstronaut.name}</h3>
                {selectedAstronaut.description && (
                  <p className="text-sm text-slate-400 leading-relaxed text-center max-w-lg">{selectedAstronaut.description}</p>
                )}
              </div>
            </StarBorder>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
