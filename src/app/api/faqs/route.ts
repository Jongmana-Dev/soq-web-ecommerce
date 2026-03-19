import { NextResponse } from 'next/server'
import { apiFetch } from '@/lib/api'

export async function GET() {
  try {
    const data = await apiFetch('/api/cms/faqs')
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
