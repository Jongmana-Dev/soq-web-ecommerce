import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { sendPaymentConfirmedEmail } from '@/lib/notifications/email'
import { notifyPaymentConfirmed } from '@/lib/notifications/telegram'

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3001'
const SLIPOK_BRANCH_ID = process.env.SLIPOK_BRANCH_ID
const SLIPOK_API_KEY = process.env.SLIPOK_API_KEY

// ─── Memory protection limits ─────────────────────────────────
const MAX_BODY_BYTES = 11 * 1024 * 1024       // 11 MB raw JSON envelope
const MAX_SLIP_BASE64_BYTES = 10 * 1024 * 1024 // 10 MB base64 ≈ 7.5 MB binary
const MAX_HEAP_BYTES = 400 * 1024 * 1024       // reject new uploads if heap > 400 MB

// ─── Rate limit (per IP) ──────────────────────────────────────
const ipBucket = new Map<string, { count: number; ts: number }>()
const IP_WINDOW_MS = 60_000
const IP_MAX_REQUESTS = 3            // slip verification เป็น heavy op
const CLEANUP_THRESHOLD = 200

const ERROR_MESSAGES: Record<number, { th: string; en: string }> = {
  1000: { th: 'กรุณาใส่ข้อมูล QR Code ให้ครบ', en: 'Please provide QR code data' },
  1001: { th: 'ไม่พบข้อมูลสาขา กรุณาตรวจสอบการตั้งค่า', en: 'Branch not found, please check configuration' },
  1002: { th: 'การยืนยันตัวตนไม่ถูกต้อง', en: 'Authorization invalid' },
  1003: { th: 'แพ็กเกจหมดอายุ กรุณาติดต่อร้านค้า', en: 'Package expired, please contact shop' },
  1004: { th: 'ใช้งานเกินโควต้า กรุณาติดต่อร้านค้า', en: 'Quota exceeded, please contact shop' },
  1005: { th: 'ไฟล์ไม่ใช่ไฟล์ภาพ กรุณาอัพโหลดเฉพาะ JPG, PNG', en: 'File is not an image. Please upload JPG or PNG only' },
  1006: { th: 'รูปภาพไม่ถูกต้อง', en: 'Invalid image file' },
  1007: { th: 'ไม่พบ QR Code ในรูปภาพ', en: 'No QR code found in image' },
  1008: { th: 'QR Code ไม่ใช่ QR สำหรับตรวจสอบการชำระเงิน', en: 'QR code is not a payment verification QR' },
  1009: { th: 'ข้อมูลธนาคารขัดข้องชั่วคราว กรุณาลองใหม่ใน 15 นาที', en: 'Bank data temporarily unavailable, please retry in 15 minutes' },
  1010: { th: 'กรุณารอการตรวจสอบสลิปหลังการโอนประมาณ 5-8 นาที', en: 'Please wait 5-8 minutes after transfer for verification' },
  1011: { th: 'QR Code หมดอายุ หรือไม่มีรายการอยู่จริง', en: 'QR code expired or transaction not found' },
  1012: { th: 'สลิปนี้เคยถูกใช้แล้ว', en: 'This slip has already been used' },
  1013: { th: 'ยอดเงินไม่ตรงกับคำสั่งซื้อ', en: 'Amount does not match order' },
  1014: { th: 'บัญชีผู้รับไม่ตรงกับบัญชีหลักของร้าน', en: 'Receiver account does not match shop account' },
}

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

function getSlipOkErrorMessage(code: number, locale: string): string {
  const msg = ERROR_MESSAGES[code]
  if (msg) return locale === 'th' ? msg.th : msg.en
  return locale === 'th' ? 'เกิดข้อผิดพลาดในการตรวจสอบสลิป' : 'Slip verification failed'
}

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0].trim()
  const withIp = req as unknown as { ip?: string }
  if (withIp.ip) return withIp.ip
  return 'unknown'
}

function cleanupRateLimit(now: number) {
  if (ipBucket.size > CLEANUP_THRESHOLD) {
    for (const [key, val] of ipBucket) {
      if (now - val.ts > IP_WINDOW_MS * 2) ipBucket.delete(key)
    }
  }
}

function checkRateLimit(ip: string, now: number): boolean {
  const entry = ipBucket.get(ip) ?? { count: 0, ts: now }
  if (now - entry.ts > IP_WINDOW_MS) {
    entry.count = 0
    entry.ts = now
  }
  entry.count += 1
  ipBucket.set(ip, entry)
  return entry.count <= IP_MAX_REQUESTS
}

type SlipOkResult =
  | { ok: true; verification: { transRef: string; amount: number; sendingBank: string; receivingBank: string } }
  | { ok: false; status: number; message: string; code?: number }

// Wrapped in own function so buffer/blob/formData fall out of scope
// before Step 2's JSON.stringify allocates another large string copy
async function verifyWithSlipOk(
  base64Body: string,
  imageType: string,
  amount: number,
  locale: string,
): Promise<SlipOkResult> {
  const buffer = Buffer.from(base64Body, 'base64')
  if (buffer.length === 0) {
    return {
      ok: false,
      status: 400,
      message: locale === 'th' ? 'รูปภาพไม่ถูกต้อง' : 'Invalid image data',
    }
  }

  const formData = new FormData()
  formData.append(
    'files',
    new Blob([buffer], { type: `image/${imageType}` }),
    `slip.${imageType}`,
  )
  formData.append('amount', String(amount))
  formData.append('log', 'true')

  const res = await fetch(
    `https://api.slipok.com/api/line/apikey/${SLIPOK_BRANCH_ID}`,
    {
      method: 'POST',
      headers: { 'x-authorization': SLIPOK_API_KEY as string },
      body: formData,
    },
  )

  const data = await res.json()

  if (!res.ok || !data?.data?.success) {
    const code = data?.code ?? 0
    const slipOkMessage = data?.message as string | undefined
    return {
      ok: false,
      status: 422,
      message: (locale === 'th' && slipOkMessage)
        ? slipOkMessage
        : getSlipOkErrorMessage(code, locale),
      code,
    }
  }

  return { ok: true, verification: data.data }
}

export async function POST(req: NextRequest) {
  const now = Date.now()
  cleanupRateLimit(now)

  // ─── 1. Pre-check Content-Length BEFORE parsing body ─────────
  // Stops oversized payloads from being read into V8 at all
  const contentLength = req.headers.get('content-length')
  if (contentLength) {
    const bytes = Number(contentLength)
    if (Number.isFinite(bytes) && bytes > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: 'รูป slip ใหญ่เกินไป (สูงสุด 7.5MB)' },
        { status: 413 },
      )
    }
  }

  // ─── 2. Memory pressure check ────────────────────────────────
  // Defensive: if process is already strained, fail fast rather than OOM
  const heap = process.memoryUsage().heapUsed
  if (heap > MAX_HEAP_BYTES) {
    console.warn(`[verify-slip] heap ${Math.round(heap / 1024 / 1024)}MB > limit, rejecting`)
    return NextResponse.json(
      { error: 'Service is busy, please try again in a moment' },
      { status: 503 },
    )
  }

  // ─── 3. Rate limit per IP ────────────────────────────────────
  const ip = getClientIp(req)
  if (!checkRateLimit(ip, now)) {
    return NextResponse.json(
      { error: 'ส่งคำขอตรวจสอบสลิปถี่เกินไป กรุณารอสักครู่' },
      { status: 429 },
    )
  }

  // ─── 4. Validate config + auth ──────────────────────────────
  if (!SLIPOK_BRANCH_ID || !SLIPOK_API_KEY) {
    return NextResponse.json(
      { error: 'SlipOk configuration missing' },
      { status: 500 },
    )
  }

  const cookieStore = await cookies()
  const sessionToken = getSessionToken(cookieStore)
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ─── 5. Parse body ──────────────────────────────────────────
  let parsed: unknown
  try {
    parsed = await req.json()
  } catch (err) {
    console.error('[verify-slip] JSON parse failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { slip_image, order_id, amount, locale = 'th' } = (parsed ?? {}) as {
    slip_image?: unknown
    order_id?: unknown
    amount?: unknown
    locale?: string
  }

  // ─── 6. Validate fields (type-safe) ─────────────────────────
  if (
    typeof slip_image !== 'string' ||
    typeof order_id !== 'string' ||
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return NextResponse.json(
      { error: 'Missing or invalid required fields: slip_image, order_id, amount' },
      { status: 400 },
    )
  }

  // ─── 7. Defense-in-depth size check ─────────────────────────
  if (slip_image.length > MAX_SLIP_BASE64_BYTES) {
    return NextResponse.json(
      { error: locale === 'th' ? 'รูป slip ใหญ่เกินไป (สูงสุด 7.5MB)' : 'Slip image too large (max 7.5MB)' },
      { status: 413 },
    )
  }

  // ─── 8. Validate format using indexOf (no regex allocation) ─
  if (!slip_image.startsWith('data:image/')) {
    return NextResponse.json(
      { error: locale === 'th' ? 'รูปแบบรูปภาพไม่ถูกต้อง' : 'Invalid image format' },
      { status: 400 },
    )
  }
  const headerEnd = slip_image.indexOf(';base64,')
  if (headerEnd === -1) {
    return NextResponse.json(
      { error: locale === 'th' ? 'รูปแบบรูปภาพไม่ถูกต้อง' : 'Invalid image format' },
      { status: 400 },
    )
  }
  const imageType = slip_image.substring(11, headerEnd)
  if (!/^[a-z]+$/i.test(imageType) || imageType.length > 10) {
    return NextResponse.json(
      { error: locale === 'th' ? 'ชนิดรูปภาพไม่ถูกต้อง' : 'Invalid image MIME type' },
      { status: 400 },
    )
  }
  const base64Body = slip_image.substring(headerEnd + 8)

  // ─── Step 1: Verify with SlipOk ─────────────────────────────
  let verifyResult: SlipOkResult
  try {
    verifyResult = await verifyWithSlipOk(base64Body, imageType, amount, locale)
  } catch (err) {
    console.error('[verify-slip] SlipOk request failed:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: locale === 'th' ? 'ติดต่อบริการตรวจสลิปไม่ได้ กรุณาลองใหม่' : 'Slip verification service unavailable' },
      { status: 502 },
    )
  }

  if (!verifyResult.ok) {
    return NextResponse.json(
      { error: verifyResult.message, code: verifyResult.code },
      { status: verifyResult.status },
    )
  }
  // After this point: buffer/blob/formData inside verifyWithSlipOk are eligible for GC

  // ─── Step 2: Forward payment to backend ─────────────────────
  // NOTE: still ships full slip_image base64 to backend (existing contract)
  // peak memory here ≈ 2x slip_image (original string + JSON.stringify copy)
  // until backend response arrives
  let backendData: { data?: { order_number?: string }; message?: string }
  let backendStatus: number
  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/orders/${order_id}/payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ method: 'promptpay', slip_image }),
      },
    )
    backendStatus = backendRes.status
    backendData = await backendRes.json()
  } catch (err) {
    console.error('[verify-slip] Backend request failed:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: locale === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'Something went wrong, please try again' },
      { status: 502 },
    )
  }

  if (backendStatus < 200 || backendStatus >= 300) {
    return NextResponse.json(
      { error: backendData?.message || 'Failed to submit payment' },
      { status: backendStatus },
    )
  }

  // ─── Step 3: Notifications (non-blocking) ───────────────────
  try {
    const session = await auth()
    const customerEmail = session?.user?.email
    const customerName = session?.user?.name ?? '-'
    const orderNumber = backendData?.data?.order_number ?? order_id

    console.log('[Notification] Payment confirmed — email:', customerEmail, 'order:', orderNumber)

    if (customerEmail) {
      sendPaymentConfirmedEmail(customerEmail, orderNumber, amount).catch((e) =>
        console.error('[Notification] Payment email failed:', e),
      )
    }
    notifyPaymentConfirmed(orderNumber, customerName, amount).catch((e) =>
      console.error('[Notification] Payment telegram failed:', e),
    )
  } catch (notifErr) {
    console.error('[Notification] Failed to fire payment notifications:', notifErr)
  }

  // ─── Response ───────────────────────────────────────────────
  const v = verifyResult.verification
  return NextResponse.json({
    success: true,
    data: {
      ...backendData?.data,
      slipok: {
        transRef: v.transRef,
        amount: v.amount,
        sendingBank: v.sendingBank,
        receivingBank: v.receivingBank,
      },
    },
  })
}
