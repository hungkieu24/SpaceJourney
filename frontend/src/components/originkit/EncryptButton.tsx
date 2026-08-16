import { useState } from 'react'
import { motion } from 'framer-motion'

interface EncryptButtonProps {
  text: string
  onClick?: () => void
  className?: string
}

const CHARS = '!@#$%^&*()_+{}:"<>?|~1234567890abcdefghijklmnopqrstuvwxyz'

export function EncryptButton({ text, onClick, className = '' }: EncryptButtonProps) {
  const [displayText, setDisplayText] = useState(text)

  const handleHover = () => {
    let iter = 0
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split('')
          .map((_, index) => {
            if (index < iter) return text[index]
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')
      )
      if (iter >= text.length) {
        clearInterval(interval)
        setDisplayText(text)
      }
      iter += 1 / 2
    }, 30)
  }

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={handleHover}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden border border-purple-500/50 bg-black/50 px-6 py-2 rounded-md font-mono text-sm text-purple-300 hover:text-white transition-colors group ${className}`}
    >
      <span className="relative z-10">{displayText}</span>
      <div className="absolute inset-0 bg-purple-500/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />
    </motion.button>
  )
}
