'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

export default function TransitionOverlay() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // พิมพ์ชนิดชัดเจน ไม่ใช้ any
    const onStart: EventListener = () => setShow(true)
    const onEnd: EventListener = () => setShow(false)

    window.addEventListener('navjumpstart', onStart)
    window.addEventListener('navjumpend', onEnd)

    return () => {
      window.removeEventListener('navjumpstart', onStart)
      window.removeEventListener('navjumpend', onEnd)
    }
  }, [])

  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      key: i,
      x: Math.round(Math.random() * 100),
      y: Math.round(Math.random() * 100),
      s: 0.8 + Math.random() * 0.8,
      d: 0.35 + Math.random() * 0.35
    }))
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="overlay"
          className="pointer-events-none fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="absolute -inset-[12%] origin-left"
            style={{
              background:
                'conic-gradient(from 210deg at 50% 50%, rgba(255,255,255,.04), rgba(220,220,220,.12) 45deg, rgba(220,220,220,.22) 95deg, rgba(255,255,255,.06) 160deg, transparent 360deg)'
            }}
            initial={{ scaleX: 0.08, skewX: -14, opacity: 0.9 }}
            animate={{ scaleX: 1.04, skewX: -8, opacity: 1 }}
            exit={{ scaleX: 0.22, skewX: -12, opacity: 0 }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(900px 360px at 50% 30%, rgba(255,255,255,.12), transparent 60%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
          />
          {particles.map(p => (
            <motion.span
              key={p.key}
              className="absolute block rounded-full bg-white/12 blur-sm"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${16 * p.s}px`, height: `${16 * p.s}px` }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.d, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
