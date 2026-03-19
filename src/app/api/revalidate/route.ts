import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  // Allow access via secret (external webhook) OR admin session (admin UI)
  const secret = req.headers.get('x-revalidate-secret')
  const hasSecret = secret && secret === process.env.REVALIDATE_SECRET

  if (!hasSecret) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const body = await req.json().catch(() => ({}))

  // Support single tag (string) or multiple tags (string[])
  const tags: string[] = Array.isArray(body.tags)
    ? body.tags
    : [body.tag ?? 'landing']

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 })
  }

  return NextResponse.json({ revalidated: true, tags })
}
