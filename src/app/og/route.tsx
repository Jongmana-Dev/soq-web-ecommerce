import React from 'react'
import { ImageResponse } from 'next/og'

export async function GET() {
  const el = React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(135deg, #0b0b10 0%, #101827 50%, #1a1a2e 100%)',
        color: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
      },
    },
    // Accent line top
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #c8a84e, #e8d48b, #c8a84e)',
      },
    }),
    // Brand name
    React.createElement(
      'div',
      {
        style: {
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: 8,
          color: '#c8a84e',
          marginBottom: 24,
          textTransform: 'uppercase',
        },
      },
      'SOQ',
    ),
    // Main title
    React.createElement(
      'div',
      {
        style: {
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: -1,
          textAlign: 'center',
          lineHeight: 1.2,
          marginBottom: 20,
        },
      },
      'Premium Brewing',
    ),
    React.createElement(
      'div',
      {
        style: {
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: -1,
          textAlign: 'center',
          lineHeight: 1.2,
          marginBottom: 32,
        },
      },
      'Sanitizer',
    ),
    // Tagline
    React.createElement(
      'div',
      {
        style: {
          fontSize: 22,
          color: '#a0a0b0',
          textAlign: 'center',
          maxWidth: '700px',
          lineHeight: 1.5,
        },
      },
      'Safe for Sip — No-rinse antibacterial product',
    ),
    // Accent line bottom
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: 40,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: 16,
        color: '#666',
      },
    }),
  )

  return new ImageResponse(el, { width: 1200, height: 630 })
}
