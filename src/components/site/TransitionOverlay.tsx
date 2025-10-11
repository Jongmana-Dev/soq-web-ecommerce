'use client'
import {AnimatePresence, motion} from 'framer-motion'
import {useEffect, useState} from 'react'

export default function TransitionOverlay(){
  const [show, setShow] = useState(false)

  useEffect(() => {
    const start = () => setShow(true)
    const end = () => setShow(false)
    window.addEventListener('navjumpstart', start as any)
    window.addEventListener('navjumpend', end as any)
    return () => {
      window.removeEventListener('navjumpstart', start as any)
      window.removeEventListener('navjumpend', end as any)
    }
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .28, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-0 z-[70]"
        >
          {/* ทองบาง ๆ + blur */}
          <div className="absolute inset-0 bg-[radial-gradient(800px_320px_at_50%_30%,color-mix(in_oklab,var(--color-gold)_18%,transparent),transparent)] backdrop-blur-[1.5px]" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
