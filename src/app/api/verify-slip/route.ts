import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { sendPaymentConfirmedEmail } from '@/lib/notifications/email'
import { notifyPaymentConfirmed } from '@/lib/notifications/telegram'

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3001'
const SLIPOK_BRANCH_ID = process.env.SLIPOK_BRANCH_ID
const SLIPOK_API_KEY = process.env.SLIPOK_API_KEY

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

export async function POST(req: NextRequest) {
  // Validate SlipOk config
  if (!SLIPOK_BRANCH_ID || !SLIPOK_API_KEY) {
    return NextResponse.json(
      { error: 'SlipOk configuration missing' },
      { status: 500 },
    )
  }

  // Auth check
  const cookieStore = await cookies()
  const sessionToken = getSessionToken(cookieStore)
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  const body = await req.json()
  const { slip_image, order_id, amount, locale = 'th' } = body as {
    slip_image: string
    order_id: string
    amount: number
    locale?: string
  }

  if (!slip_image || !order_id || !amount) {
    return NextResponse.json(
      { error: 'Missing required fields: slip_image, order_id, amount' },
      { status: 400 },
    )
  }

  // Limit slip image size (~7.5MB original = ~10MB base64)
  if (slip_image.length > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: locale === 'th' ? 'รูป slip ใหญ่เกินไป (สูงสุด 7.5MB)' : 'Slip image too large (max 7.5MB)' },
      { status: 413 },
    )
  }

  // --- Step 1: Verify slip with SlipOk ---
  try {
    // Convert base64 data URL to a Blob for FormData
    const base64Match = slip_image.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!base64Match) {
      return NextResponse.json(
        { error: locale === 'th' ? 'รูปแบบรูปภาพไม่ถูกต้อง' : 'Invalid image format' },
        { status: 400 },
      )
    }

    const [, imageType, base64Data] = base64Match
    const buffer = Buffer.from(base64Data, 'base64')
    const blob = new Blob([buffer], { type: `image/${imageType}` })

    const formData = new FormData()
    formData.append('files', blob, `slip.${imageType}`)
    formData.append('amount', String(amount))
    formData.append('log', 'true')

    const slipOkRes = await fetch(
      `https://api.slipok.com/api/line/apikey/${SLIPOK_BRANCH_ID}`,
      {
        method: 'POST',
        headers: {
          'x-authorization': SLIPOK_API_KEY,
        },
        body: formData,
      },
    )

    const slipOkData = await slipOkRes.json()

    // SlipOk error (returns HTTP 400 for all errors)
    if (!slipOkRes.ok || !slipOkData?.data?.success) {
      const errorCode = slipOkData?.code ?? 0
      // Use SlipOk's message for TH locale (e.g. 1010 includes bank name + delay)
      // Fall back to our mapped messages for EN or when SlipOk message is missing
      const slipOkMessage = slipOkData?.message as string | undefined
      const message = (locale === 'th' && slipOkMessage)
        ? slipOkMessage
        : getSlipOkErrorMessage(errorCode, locale)
      return NextResponse.json(
        { error: message, code: errorCode },
        { status: 422 },
      )
    }

    const verification = slipOkData.data

    // --- Step 2: Forward payment to backend (same payload as before) ---
    const paymentBody = {
      method: 'promptpay',
      slip_image,
    }

    const backendRes = await fetch(
      `${BACKEND_URL}/api/orders/${order_id}/payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(paymentBody),
      },
    )

    const backendData = await backendRes.json()

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: backendData.message || 'Failed to submit payment' },
        { status: backendRes.status },
      )
    }

    // Fire payment confirmed notifications (non-blocking, isolated try-catch)
    try {
      const session = await auth()
      const customerEmail = session?.user?.email
      const customerName = session?.user?.name ?? '-'
      const orderNumber = backendData.data?.order_number ?? order_id

      console.log('[Notification] Payment confirmed — email:', customerEmail, 'order:', orderNumber)

      if (customerEmail) {
        sendPaymentConfirmedEmail(customerEmail, orderNumber, amount).catch((e) => console.error('[Notification] Payment email failed:', e))
      }
      notifyPaymentConfirmed(orderNumber, customerName, amount).catch((e) => console.error('[Notification] Payment telegram failed:', e))
    } catch (notifErr) {
      console.error('[Notification] Failed to fire payment notifications:', notifErr)
    }

    // Success - return combined result
    return NextResponse.json({
      success: true,
      data: {
        ...backendData.data,
        slipok: {
          transRef: verification.transRef,
          amount: verification.amount,
          sendingBank: verification.sendingBank,
          receivingBank: verification.receivingBank,
        },
      },
    })
  } catch {
    return NextResponse.json(
      { error: locale === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'Something went wrong, please try again' },
      { status: 500 },
    )
  }
}
