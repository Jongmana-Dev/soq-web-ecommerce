// src/app/og/route.tsx
import React from 'react'
import { ImageResponse } from 'next/og'

export const runtime = 'edge' // OK

export async function GET() {
  // สร้าง element แบบ non-JSX เพื่อลดปัญหา TS/JSX
  const el = React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(135deg, #0b0b10 0%, #101827 100%)',
        color: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 64,
        letterSpacing: -1.2,
        fontWeight: 700
      }
    },
    'SOQ — Luxury Brewing Care'
  )

  // ไม่ต้อง export contentType/size — ระบุตรงนี้แทน
  return new ImageResponse(el, { width: 1200, height: 630 })
}
