const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
const CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? ''

async function sendTelegramMessage(text: string) {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: 'Markdown',
        }),
      },
    )
    if (!res.ok) {
      const body = await res.text()
      console.error(`[Telegram] API error ${res.status}: ${body}`)
    } else {
      console.log('[Telegram] Message sent successfully')
    }
  } catch (err) {
    console.error('[Telegram] Failed to send message:', err)
    throw err
  }
}

export async function notifyNewMember(name: string | null, email: string) {
  const displayName = name || 'ไม่ระบุชื่อ'
  await sendTelegramMessage(
    `👤 *สมาชิกใหม่*\n\nชื่อ: ${displayName}\nอีเมล: ${email}`,
  )
}

export async function notifyOrderCreated(
  orderNumber: string,
  customerName: string,
  total: number,
  itemCount: number,
) {
  await sendTelegramMessage(
    `🛒 *คำสั่งซื้อใหม่*\n\nหมายเลข: ${orderNumber}\nลูกค้า: ${customerName}\nจำนวนรายการ: ${itemCount}\nยอดรวม: ฿${total.toLocaleString()}`,
  )
}

export async function notifyPaymentConfirmed(
  orderNumber: string,
  customerName: string,
  total: number,
) {
  await sendTelegramMessage(
    `✅ *ชำระเงินสำเร็จ*\n\nหมายเลข: ${orderNumber}\nลูกค้า: ${customerName}\nยอดเงิน: ฿${total.toLocaleString()}`,
  )
}

export async function notifyOrderExpired(
  orderNumber: string,
  customerName: string,
) {
  await sendTelegramMessage(
    `⏰ *คำสั่งซื้อหมดอายุ*\n\nหมายเลข: ${orderNumber}\nลูกค้า: ${customerName}`,
  )
}

export async function notifyOrderCancelled(
  orderNumber: string,
  customerName: string,
) {
  await sendTelegramMessage(
    `❌ *ยกเลิกคำสั่งซื้อ*\n\nหมายเลข: ${orderNumber}\nลูกค้า: ${customerName}`,
  )
}
