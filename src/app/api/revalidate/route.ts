import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
