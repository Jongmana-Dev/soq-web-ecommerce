import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { sendOrderCancelledEmail } from '@/lib/notifications/email'
import { notifyOrderCancelled } from '@/lib/notifications/telegram'

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

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const cookieStore = await cookies()
  const sessionToken = getSessionToken(cookieStore)

  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { path } = await params
  const targetPath = path.join('/')

  const headers: Record<string, string> = {
    Authorization: `Bearer ${sessionToken}`,
  }

  if (req.headers.get('content-type')) {
    headers['Content-Type'] = req.headers.get('content-type')!
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  }

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    fetchOptions.body = await req.text()
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/${targetPath}`, fetchOptions)
    const data = await res.json()

    // Fire cancel order notifications when PATCH /:id/cancel succeeds
    const isCancelRequest = req.method === 'PATCH' && path.length === 2 && path[1] === 'cancel'
    if (isCancelRequest && res.ok) {
      try {
        const session = await auth()
        const email = session?.user?.email
        const customerName = session?.user?.name ?? '-'
        const orderNumber = data.data?.order_number ?? path[0]

        console.log('[Notification] Order cancelled — email:', email, 'order:', orderNumber)

        if (email) {
          sendOrderCancelledEmail(email, orderNumber).catch((e) => console.error('[Notification] Cancel email failed:', e))
        }
        notifyOrderCancelled(orderNumber, customerName).catch((e) => console.error('[Notification] Cancel telegram failed:', e))
      } catch (notifErr) {
        console.error('[Notification] Failed to fire cancel notifications:', notifErr)
      }
    }

    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 })
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
