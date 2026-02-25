import { NextResponse } from 'next/server'
import { apiFetch } from '@/lib/api'

export async function GET() {
  try {
    const data = await apiFetch('/api/cms/faqs')
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
