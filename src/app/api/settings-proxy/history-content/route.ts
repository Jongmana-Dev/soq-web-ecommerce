import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3001'

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/settings/history-content`, {
      next: { revalidate: 300 },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 })
  }
}
