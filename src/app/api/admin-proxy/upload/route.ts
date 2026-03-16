import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/auth'

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3001'

function getSessionToken(cookieStore: Awaited<ReturnType<typeof cookies>>): string | undefined {
  const names = [
    'authjs.session-token',
    '__Secure-authjs.session-token',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
  ]
  for (const name of names) {
    const val = cookieStore.get(name)?.value
    if (val) return val
  }
  return cookieStore.getAll().find((c) => c.name.endsWith('session-token'))?.value
}

export async function POST(req: NextRequest) {
  // Role check
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const cookieStore = await cookies()
  const sessionToken = getSessionToken(cookieStore)

  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()

    const res = await fetch(`${BACKEND_URL}/api/admin/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      body: formData,
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 502 })
  }
}
