import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { sendOrderCreatedEmail } from '@/lib/notifications/email'
import { notifyOrderCreated } from '@/lib/notifications/telegram'

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

async function handler(req: NextRequest) {
  const cookieStore = await cookies()
  const sessionToken = getSessionToken(cookieStore)

  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${sessionToken}`,
  }

  if (req.headers.get('content-type')) {
    headers['Content-Type'] = req.headers.get('content-type')!
  }

  const isPost = req.method === 'POST'
  let bodyText: string | undefined

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    bodyText = await req.text()
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    body: bodyText,
  }

  try {
    const url = new URL(`${BACKEND_URL}/api/orders`)
    // Forward query params (status, limit, etc.)
    req.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value))
    const res = await fetch(url.toString(), fetchOptions)
    const data = await res.json()

    // Fire order created notifications (non-blocking, isolated try-catch)
    if (isPost && res.ok && data.data) {
      try {
        const order = data.data
        const session = await auth()
        const email = session?.user?.email

        console.log('[Notification] Order created — email:', email, 'order:', order.order_number)

        if (email) {
          sendOrderCreatedEmail(
            email,
            order.order_number,
            order.total,
            order.items ?? [],
            order.expired_at,
          ).catch((e) => console.error('[Notification] Order created email failed:', e))
        }

        notifyOrderCreated(
          order.order_number,
          order.customer_name ?? session?.user?.name ?? '-',
          order.total,
          order.items?.length ?? 0,
        ).catch((e) => console.error('[Notification] Order created telegram failed:', e))
      } catch (notifErr) {
        console.error('[Notification] Failed to fire order created notifications:', notifErr)
      }
    }

    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 })
  }
}

export const GET = handler
export const POST = handler
