import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Contact info from env (server-side)
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://soqthailand.com'
const CONTACT_PHONE = process.env.NEXT_PUBLIC_PHONE ?? '061-234-4899'
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_EMAIL ?? 'admin@soqthailand.com'
const CONTACT_LINE = process.env.NEXT_PUBLIC_LINE_ID ?? '@186oltim'
const CONTACT_LINE_URL = CONTACT_LINE ? `https://line.me/R/ti/p/${CONTACT_LINE}` : ''
const CONTACT_FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL ?? 'https://www.facebook.com/profile.php?id=61587773182648'

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      replyTo: CONTACT_EMAIL,
      headers: {
        'X-Mailer': 'SOQ Thailand',
        'List-Unsubscribe': `<mailto:${CONTACT_EMAIL}?subject=unsubscribe>`,
      },
    })
    console.log(`[Email] Sent to ${to}: ${info.messageId}`)
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err)
    throw err
  }
}

// ─── Shared footer with contact info ────────────────────────────

function contactSection() {
  return `
    <div style="margin:28px 0 0;padding:20px 0 0;border-top:1px solid #eee;">
      <p style="margin:0 0 12px;color:#1a1a1a;font-weight:600;font-size:14px;">ติดต่อเรา</p>
      <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#555;line-height:2;">
        <tr>
          <td style="padding-right:12px;white-space:nowrap;">โทรศัพท์</td>
          <td><a href="tel:0612344899" style="color:#d4a853;text-decoration:none;">${CONTACT_PHONE}</a></td>
        </tr>
        <tr>
          <td style="padding-right:12px;white-space:nowrap;">อีเมล</td>
          <td><a href="mailto:${CONTACT_EMAIL}" style="color:#d4a853;text-decoration:none;">${CONTACT_EMAIL}</a></td>
        </tr>
        <tr>
          <td style="padding-right:12px;white-space:nowrap;">LINE</td>
          <td><a href="${CONTACT_LINE_URL}" style="color:#d4a853;text-decoration:none;">${CONTACT_LINE}</a></td>
        </tr>
        <tr>
          <td style="padding-right:12px;white-space:nowrap;">Facebook</td>
          <td><a href="${CONTACT_FACEBOOK_URL}" style="color:#d4a853;text-decoration:none;">SOQ Thailand</a></td>
        </tr>
      </table>
    </div>`
}

// ─── Base layout ────────────────────────────────────────────────

function baseLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="th" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>SOQ Thailand</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
<tr><td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
    <a href="${SITE_URL}" style="text-decoration:none;">
      <h1 style="margin:0;color:#d4a853;font-size:24px;font-weight:700;letter-spacing:1px;">SOQ Thailand</h1>
    </a>
    <p style="margin:6px 0 0;color:#888;font-size:12px;letter-spacing:0.5px;">Safe for Sip</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:32px;">
    ${content}
    ${contactSection()}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
      <tr>
        <td style="padding:0 8px;"><a href="tel:0612344899" style="color:#888;text-decoration:none;font-size:12px;">${CONTACT_PHONE}</a></td>
        <td style="color:#555;font-size:12px;">|</td>
        <td style="padding:0 8px;"><a href="${CONTACT_LINE_URL}" style="color:#888;text-decoration:none;font-size:12px;">LINE ${CONTACT_LINE}</a></td>
        <td style="color:#555;font-size:12px;">|</td>
        <td style="padding:0 8px;"><a href="${CONTACT_FACEBOOK_URL}" style="color:#888;text-decoration:none;font-size:12px;">Facebook</a></td>
      </tr>
    </table>
    <p style="margin:0;color:#666;font-size:11px;">SOQ Thailand — Safe for Sip</p>
    <p style="margin:4px 0 0;color:#555;font-size:11px;">
      อีเมลนี้ถูกส่งจาก <a href="${SITE_URL}" style="color:#d4a853;text-decoration:none;">soqthailand.com</a>
    </p>
    <p style="margin:8px 0 0;color:#444;font-size:10px;">
      หากไม่ต้องการรับอีเมล กรุณาตอบกลับอีเมลนี้พร้อมแจ้ง "ยกเลิกการรับอีเมล"
    </p>
  </td></tr>

</table>

</td></tr>
</table>
</body>
</html>`
}

// ─── Welcome Email ──────────────────────────────────────────────

export async function sendWelcomeEmail(name: string | null, email: string) {
  const displayName = name || email
  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:20px;">ยินดีต้อนรับสู่ SOQ Thailand</h2>
    <p style="color:#333;line-height:1.6;">สวัสดีคุณ <strong>${displayName}</strong>,</p>
    <p style="color:#333;line-height:1.6;">ขอบคุณที่สมัครสมาชิกกับ SOQ Thailand เราพร้อมให้บริการผลิตภัณฑ์ทำความสะอาดและฆ่าเชื้อคุณภาพสูงเพื่อคุณ</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/products" style="display:inline-block;padding:12px 32px;background:#d4a853;color:#1a1a1a;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">ดูสินค้าของเรา</a>
    </div>
    <p style="color:#333;line-height:1.6;">หากมีข้อสงสัย สามารถติดต่อเราได้ตลอดเวลาผ่านช่องทางด้านล่าง</p>
  `)
  await sendEmail(email, 'ยินดีต้อนรับสู่ SOQ Thailand', html)
}

// ─── Order Created Email ────────────────────────────────────────

interface OrderItem {
  product_name?: string
  name?: string
  quantity: number
  price: number
}

export async function sendOrderCreatedEmail(
  email: string,
  orderNumber: string,
  total: number,
  items: OrderItem[],
  expiredAt: string,
) {
  const expiredDate = new Date(expiredAt)
  const expiredStr = expiredDate.toLocaleString('th-TH', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333;">${item.product_name || item.name || '-'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333;text-align:right;">${formatCurrency(item.price)}</td>
    </tr>`,
    )
    .join('')

  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:20px;">คำสั่งซื้อของคุณถูกสร้างแล้ว</h2>
    <p style="color:#333;line-height:1.6;">คำสั่งซื้อหมายเลข <strong style="color:#d4a853;">${orderNumber}</strong> ถูกสร้างเรียบร้อยแล้ว</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #eee;border-radius:6px;overflow:hidden;">
      <tr style="background:#f9f9f9;">
        <th style="padding:10px 12px;text-align:left;color:#666;font-size:13px;">สินค้า</th>
        <th style="padding:10px 12px;text-align:center;color:#666;font-size:13px;">จำนวน</th>
        <th style="padding:10px 12px;text-align:right;color:#666;font-size:13px;">ราคา</th>
      </tr>
      ${itemRows}
      <tr style="background:#fdf8ed;">
        <td colspan="2" style="padding:12px;font-weight:700;color:#1a1a1a;">ยอดรวมทั้งหมด</td>
        <td style="padding:12px;text-align:right;font-weight:700;color:#d4a853;font-size:16px;">${formatCurrency(total)}</td>
      </tr>
    </table>

    <div style="margin:20px 0;padding:16px;background:#fff3cd;border-radius:6px;border-left:4px solid #ffc107;">
      <p style="margin:0;color:#856404;font-weight:600;">กรุณาชำระเงินก่อนวันที่</p>
      <p style="margin:4px 0 0;color:#856404;font-size:15px;">${expiredStr}</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/orders" style="display:inline-block;padding:12px 32px;background:#d4a853;color:#1a1a1a;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">ดูคำสั่งซื้อของฉัน</a>
    </div>

    <p style="color:#888;font-size:13px;">หากไม่ชำระเงินภายในเวลาที่กำหนด คำสั่งซื้อจะถูกยกเลิกอัตโนมัติ</p>
    <p style="color:#888;font-size:13px;">หากมีปัญหาในการชำระเงิน สามารถติดต่อเราได้ผ่านช่องทางด้านล่าง</p>
  `)
  await sendEmail(email, `คำสั่งซื้อ ${orderNumber} — SOQ Thailand`, html)
}

// ─── Payment Confirmed Email ────────────────────────────────────

export async function sendPaymentConfirmedEmail(
  email: string,
  orderNumber: string,
  total: number,
) {
  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:20px;">ชำระเงินสำเร็จ</h2>
    <p style="color:#333;line-height:1.6;">การชำระเงินสำหรับคำสั่งซื้อ <strong style="color:#d4a853;">${orderNumber}</strong> ได้รับการยืนยันเรียบร้อยแล้ว</p>

    <div style="margin:24px 0;padding:24px;background:#d4edda;border-radius:6px;border-left:4px solid #28a745;text-align:center;">
      <p style="margin:0;color:#155724;font-weight:700;font-size:18px;">ชำระเงินเรียบร้อย</p>
      <p style="margin:8px 0 0;color:#155724;font-size:15px;">ยอดเงิน: <strong>${formatCurrency(total)}</strong></p>
    </div>

    <p style="color:#333;line-height:1.6;">ทีมงานจะดำเนินการจัดส่งสินค้าให้คุณโดยเร็วที่สุด</p>

    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/orders" style="display:inline-block;padding:12px 32px;background:#d4a853;color:#1a1a1a;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">ติดตามสถานะคำสั่งซื้อ</a>
    </div>

    <p style="color:#888;font-size:13px;">หากมีข้อสงสัยเกี่ยวกับการจัดส่ง สามารถติดต่อเราได้ผ่านช่องทางด้านล่าง</p>
  `)
  await sendEmail(email, `ชำระเงินสำเร็จ — คำสั่งซื้อ ${orderNumber}`, html)
}

// ─── Order Expired Email ────────────────────────────────────────

export async function sendOrderExpiredEmail(email: string, orderNumber: string) {
  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:20px;">คำสั่งซื้อหมดอายุ</h2>
    <p style="color:#333;line-height:1.6;">คำสั่งซื้อหมายเลข <strong style="color:#d4a853;">${orderNumber}</strong> ได้หมดอายุเนื่องจากไม่ได้รับการชำระเงินภายในเวลาที่กำหนด</p>

    <div style="margin:24px 0;padding:24px;background:#f8d7da;border-radius:6px;border-left:4px solid #dc3545;text-align:center;">
      <p style="margin:0;color:#721c24;font-weight:700;font-size:16px;">คำสั่งซื้อถูกยกเลิกอัตโนมัติ</p>
    </div>

    <p style="color:#333;line-height:1.6;">หากคุณยังต้องการสินค้า สามารถสั่งซื้อใหม่ได้ตลอดเวลา</p>

    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/products" style="display:inline-block;padding:12px 32px;background:#d4a853;color:#1a1a1a;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">สั่งซื้อใหม่</a>
    </div>

    <p style="color:#888;font-size:13px;">หากมีข้อสงสัย สามารถติดต่อเราได้ผ่านช่องทางด้านล่าง</p>
  `)
  await sendEmail(email, `คำสั่งซื้อ ${orderNumber} หมดอายุ — SOQ Thailand`, html)
}

// ─── Order Cancelled Email ───────────────────────────────────────

export async function sendOrderCancelledEmail(email: string, orderNumber: string) {
  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:20px;">คำสั่งซื้อถูกยกเลิก</h2>
    <p style="color:#333;line-height:1.6;">คำสั่งซื้อหมายเลข <strong style="color:#d4a853;">${orderNumber}</strong> ได้ถูกยกเลิกตามที่คุณร้องขอ</p>

    <div style="margin:24px 0;padding:24px;background:#f8d7da;border-radius:6px;border-left:4px solid #dc3545;text-align:center;">
      <p style="margin:0;color:#721c24;font-weight:700;font-size:16px;">คำสั่งซื้อถูกยกเลิกแล้ว</p>
    </div>

    <p style="color:#333;line-height:1.6;">หากคุณยังต้องการสินค้า สามารถสั่งซื้อใหม่ได้ตลอดเวลา</p>

    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/products" style="display:inline-block;padding:12px 32px;background:#d4a853;color:#1a1a1a;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">สั่งซื้อใหม่</a>
    </div>

    <p style="color:#888;font-size:13px;">หากมีข้อสงสัย สามารถติดต่อเราได้ผ่านช่องทางด้านล่าง</p>
  `)
  await sendEmail(email, `คำสั่งซื้อ ${orderNumber} ถูกยกเลิก — SOQ Thailand`, html)
}

// ─── Contact Form Email ─────────────────────────────────────────

const CONTACT_FORM_RECIPIENT = process.env.CONTACT_FORM_EMAIL ?? 'jmn.services.soq@gmail.com'

export async function sendContactFormEmail(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  // ส่งให้ทีมงาน
  const adminHtml = baseLayout(`
    <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:20px;">มีข้อความใหม่จากฟอร์มติดต่อ</h2>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #eee;border-radius:6px;overflow:hidden;">
      <tr style="background:#f9f9f9;">
        <td style="padding:10px 16px;color:#666;font-size:13px;width:100px;">ชื่อ</td>
        <td style="padding:10px 16px;color:#333;font-size:14px;">${escapeHtml(data.name)}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;color:#666;font-size:13px;border-top:1px solid #eee;">อีเมล</td>
        <td style="padding:10px 16px;color:#333;font-size:14px;border-top:1px solid #eee;">
          <a href="mailto:${escapeHtml(data.email)}" style="color:#d4a853;text-decoration:none;">${escapeHtml(data.email)}</a>
        </td>
      </tr>
      ${data.phone ? `<tr>
        <td style="padding:10px 16px;color:#666;font-size:13px;border-top:1px solid #eee;">โทรศัพท์</td>
        <td style="padding:10px 16px;color:#333;font-size:14px;border-top:1px solid #eee;">${escapeHtml(data.phone)}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:10px 16px;color:#666;font-size:13px;border-top:1px solid #eee;">หัวข้อ</td>
        <td style="padding:10px 16px;color:#333;font-size:14px;font-weight:600;border-top:1px solid #eee;">${escapeHtml(data.subject)}</td>
      </tr>
    </table>

    <div style="margin:16px 0;padding:16px;background:#f9f9f9;border-radius:6px;border-left:4px solid #d4a853;">
      <p style="margin:0 0 8px;color:#666;font-size:12px;font-weight:600;">ข้อความ:</p>
      <p style="margin:0;color:#333;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
    </div>

    <p style="color:#888;font-size:12px;">ตอบกลับลูกค้าโดยตรงที่ <a href="mailto:${escapeHtml(data.email)}" style="color:#d4a853;">${escapeHtml(data.email)}</a></p>
  `)

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: CONTACT_FORM_RECIPIENT,
    replyTo: data.email,
    subject: `[Contact Form] ${data.subject} — จาก ${data.name}`,
    html: adminHtml,
  })

  console.log(`[Email] Contact form sent to ${CONTACT_FORM_RECIPIENT} from ${data.email}`)
}

// ─── Helpers ────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatCurrency(amount: number): string {
  return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}
