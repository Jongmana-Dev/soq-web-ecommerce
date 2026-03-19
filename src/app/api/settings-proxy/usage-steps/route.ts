import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3001'

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/cms/usage-steps`, {
      next: { revalidate: 3600 }, // cache 1 hour
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 })
  }
}
