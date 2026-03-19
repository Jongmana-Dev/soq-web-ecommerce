'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { ClientLogo } from '@/lib/cms'

interface Props {
  logos: ClientLogo[]
}

export default function ClientLogos({ logos }: Props) {
  if (logos.length === 0) return null

  const sectionRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [shouldMarquee, setShouldMarquee] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.8])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1, 0.99])

  const measure = useCallback(() => {
    if (!sectionRef.current || !innerRef.current) return
    const containerW = sectionRef.current.clientWidth
    const contentW = innerRef.current.scrollWidth
    setShouldMarquee(contentW > containerW)
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure, logos])

  const displayLogos = shouldMarquee ? [...logos, ...logos, ...logos] : logos

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity, scale }}
      className="relative h-[100px] overflow-hidden flex items-center"
    >
      {shouldMarquee ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24" style={{ background: 'linear-gradient(to right, #ECEDEA, transparent)' }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24" style={{ background: 'linear-gradient(to left, #ECEDEA, transparent)' }} />
          <div
            className="flex items-center gap-20 animate-marquee-smooth"
            style={{ width: 'max-content' }}
          >
            {displayLogos.map((logo, i) => (
              <LogoItem key={`${logo.id}-${i}`} logo={logo} index={i} />
            ))}
          </div>
        </>
      ) : (
        <div ref={innerRef} className="flex items-center justify-center gap-16 sm:gap-20 w-full px-6">
          {logos.map((logo, i) => (
            <LogoItem key={`${logo.id}-${i}`} logo={logo} index={i} />
          ))}
        </div>
      )}
    </motion.section>
  )
}

function LogoItem({ logo, index }: { logo: ClientLogo; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.12 }}
      className="flex-shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-[filter,opacity] duration-500 cursor-default"
    >
      <Image
        src={logo.logo_url}
        alt={logo.name}
        width={180}
        height={80}
        className="h-14 sm:h-16 w-auto object-contain"
        unoptimized
      />
    </motion.div>
  )
}
