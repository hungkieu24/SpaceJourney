import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface StarBorderProps {
  children: ReactNode
  className?: string
  color?: string
}

export function StarBorder({ children, className = '', color = 'rgba(124, 58, 237, 0.8)' }: StarBorderProps) {
  return (
    <div className={`relative group ${className}`}>
      {/* Animated glowing border */}
      <motion.div
        className="absolute -inset-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[6px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent, transparent)`,
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['100% 0%', '-100% 0%'],
        }}
        transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
      />
      
      {/* Sharp border line */}
      <motion.div
        className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['100% 0%', '-100% 0%'],
        }}
        transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
      />

      {/* Content wrapper */}
      <div className="relative h-full w-full rounded-xl overflow-hidden bg-black z-10">
        {children}
      </div>
    </div>
  )
}
