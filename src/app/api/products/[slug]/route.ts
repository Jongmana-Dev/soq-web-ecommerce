import { NextResponse } from 'next/server'
import { apiFetch } from '@/lib/api'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  try {
    const data = await apiFetch(`/api/products/${slug}`)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Not found'
    const status = message.includes('404') ? 404 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
