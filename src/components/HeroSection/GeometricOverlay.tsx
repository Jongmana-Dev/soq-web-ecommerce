'use client'

import { memo } from 'react'

const ACCENT = '#F3C85B'
const DARK = '#1A1A1A'

interface GeometricOverlayProps {
  progress: number
  triangleScale: number
}

function GeometricOverlayInner({ progress, triangleScale }: GeometricOverlayProps) {
  const slowY = progress * -60
  const fastY = progress * -120

  return (
    <>
      {/* ── Yellow Triangle — large, extends beyond bottle ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible"
        style={{ willChange: 'transform' }}
      >
        <div
          style={{
            width: '140%',
            aspectRatio: '1',
            clipPath: 'polygon(8% 5%, 92% 0%, 100% 88%, 4% 95%)',
            backgroundColor: ACCENT,
            opacity: 0.35,
            transform: `translateY(${slowY}px) rotate(-12deg) scale(${triangleScale})`,
            willChange: 'transform',
          }}
        />
      </div>

      {/* ── Black Rectangular Frame — larger than bottle ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible"
        style={{ willChange: 'transform' }}
      >
        <div
          style={{
            width: '75%',
            height: '90%',
            transform: `translateY(${fastY}px)`,
            border: `3.5px solid ${DARK}`,
            willChange: 'transform',
          }}
        />
      </div>
    </>
  )
}

const GeometricOverlay = memo(GeometricOverlayInner)
export default GeometricOverlay
