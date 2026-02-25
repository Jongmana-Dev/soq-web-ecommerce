import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      API_URL: process.env.API_URL ? 'set' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'set' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    },
  })
}
