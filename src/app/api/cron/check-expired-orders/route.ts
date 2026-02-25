import { NextRequest, NextResponse } from 'next/server'
import { sendOrderExpiredEmail } from '@/lib/notifications/email'
import { notifyOrderExpired } from '@/lib/notifications/telegram'

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3001'
const CRON_SECRET = process.env.CRON_SECRET ?? ''
const ADAPTER_SECRET = process.env.ADAPTER_API_SECRET ?? ''

interface ExpiredOrder {
  id: string
  order_number: string
  customer_name: string
  user?: { email?: string }
}

export async function POST(req: NextRequest) {
  // Authenticate cron request
  const secret = req.headers.get('x-cron-secret')
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch expired orders from backend
    const res = await fetch(
      `${BACKEND_URL}/api/orders/check-expired`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Adapter-Secret': ADAPTER_SECRET,
        },
      },
    )

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return NextResponse.json(
        { error: `Backend error: ${text}` },
        { status: res.status },
      )
    }

    const { data: expiredOrders } = (await res.json()) as {
      data: ExpiredOrder[]
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      return NextResponse.json({ success: true, processed: 0 })
    }

    // Send notifications for each expired order (non-blocking)
    const notifications = expiredOrders.map(async (order) => {
      try {
        const email = order.user?.email
        console.log('[Notification] Order expired — email:', email, 'order:', order.order_number)
        if (email) {
          sendOrderExpiredEmail(email, order.order_number).catch((e) => console.error('[Notification] Expired email failed:', e))
        }
        notifyOrderExpired(order.order_number, order.customer_name).catch((e) => console.error('[Notification] Expired telegram failed:', e))
      } catch (notifErr) {
        console.error('[Notification] Failed to fire expired notifications:', notifErr)
      }
    })

    await Promise.all(notifications)

    return NextResponse.json({
      success: true,
      processed: expiredOrders.length,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to check expired orders' },
      { status: 500 },
    )
  }
}
