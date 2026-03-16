import { NextResponse } from 'next/server'
import { apiFetch } from '@/lib/api'

export async function GET() {
  try {
    const data = await apiFetch('/api/cms/certifications')
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
