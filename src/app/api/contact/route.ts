//# API ฟอร์มติดต่อ (zod validate + sanitize + rate limit + cooldown + email)
import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import { sendContactFormEmail } from '@/lib/notifications/email';

export const preferredRegion = ['sin1'];

// ─── Sanitization helpers ───────────────────────────────────────

/** Strip HTML tags, script patterns, and suspicious content */
function sanitize(input: string): string {
  return input
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript: / data: protocols
    .replace(/(?:javascript|data|vbscript)\s*:/gi, '')
    // Remove on* event handlers
    .replace(/\bon\w+\s*=/gi, '')
    // Collapse excessive whitespace
    .replace(/\s{10,}/g, '          ')
    .trim();
}

/** Check for suspicious patterns (spam / injection) */
function isSuspicious(text: string): boolean {
  const patterns = [
    /<script/i,
    /javascript\s*:/i,
    /on(click|load|error|mouseover)\s*=/i,
    /\[url[=\]]/i,                    // BBCode spam
    /\[\/url\]/i,
    /https?:\/\/[^\s]{100,}/i,       // Very long URLs (likely spam)
    /(.)\1{20,}/,                     // Repeated chars 20+ times
    /\b(viagra|cialis|casino|lottery|crypto.*earn|click here now)\b/i,
  ];
  return patterns.some((p) => p.test(text));
}

/** Count URLs in text */
function countUrls(text: string): number {
  const matches = text.match(/https?:\/\/[^\s]+/gi);
  return matches ? matches.length : 0;
}

// ─── Validation schema ──────────────────────────────────────────

const schema = z.object({
  name: z.string()
    .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร')
    .transform(sanitize),
  email: z.string()
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .max(254, 'อีเมลยาวเกินไป'),
  phone: z.string()
    .max(20, 'เบอร์โทรยาวเกินไป')
    .regex(/^[0-9\-+() ]*$/, 'รูปแบบเบอร์โทรไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
  subject: z.string()
    .min(2, 'หัวข้อต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(200, 'หัวข้อต้องไม่เกิน 200 ตัวอักษร')
    .transform(sanitize),
  message: z.string()
    .min(10, 'ข้อความต้องมีอย่างน้อย 10 ตัวอักษร')
    .max(2000, 'ข้อความต้องไม่เกิน 2,000 ตัวอักษร')
    .transform(sanitize),
});

// ─── Rate limiting (per IP) + Cooldown (per email) ──────────────

const ipBucket = new Map<string, { count: number; ts: number }>();
const emailCooldown = new Map<string, number>(); // email -> last sent timestamp

const IP_WINDOW_MS = 60_000;      // 1 นาที
const IP_MAX_REQUESTS = 5;         // สูงสุด 5 requests ต่อ IP ต่อนาที
const EMAIL_COOLDOWN_MS = 300_000; // 5 นาที cooldown ต่ออีเมล
const CLEANUP_THRESHOLD = 500;     // ล้าง Map เมื่อเกิน 500 entries

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  const withIp = req as unknown as { ip?: string };
  if (withIp.ip) return withIp.ip;
  return 'unknown';
}

function cleanupMaps(now: number) {
  if (ipBucket.size > CLEANUP_THRESHOLD) {
    for (const [key, val] of ipBucket) {
      if (now - val.ts > IP_WINDOW_MS * 2) ipBucket.delete(key);
    }
  }
  if (emailCooldown.size > CLEANUP_THRESHOLD) {
    for (const [key, ts] of emailCooldown) {
      if (now - ts > EMAIL_COOLDOWN_MS * 2) emailCooldown.delete(key);
    }
  }
}

// ─── Handler ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const now = Date.now();

  // Cleanup old entries periodically
  cleanupMaps(now);

  // ---- IP rate limiting ----
  const ip = getClientIp(req);
  const entry = ipBucket.get(ip) ?? { count: 0, ts: now };
  if (now - entry.ts > IP_WINDOW_MS) {
    entry.count = 0;
    entry.ts = now;
  }
  entry.count += 1;
  ipBucket.set(ip, entry);

  if (entry.count > IP_MAX_REQUESTS) {
    return NextResponse.json(
      { ok: false, error: 'ส่งข้อความถี่เกินไป กรุณารอสักครู่' },
      { status: 429 },
    );
  }

  // ---- Body size check ----
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10_000) {
    return NextResponse.json(
      { ok: false, error: 'ข้อมูลมีขนาดใหญ่เกินไป' },
      { status: 413 },
    );
  }

  // ---- Parse & validate ----
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // ---- Email cooldown ----
  const emailLower = data.email.toLowerCase();
  const lastSent = emailCooldown.get(emailLower);
  if (lastSent && now - lastSent < EMAIL_COOLDOWN_MS) {
    const waitSec = Math.ceil((EMAIL_COOLDOWN_MS - (now - lastSent)) / 1000);
    return NextResponse.json(
      { ok: false, error: `กรุณารออีก ${waitSec} วินาที ก่อนส่งข้อความอีกครั้ง` },
      { status: 429 },
    );
  }

  // ---- Content safety checks ----
  const allText = `${data.name} ${data.subject} ${data.message}`;

  if (isSuspicious(allText)) {
    return NextResponse.json(
      { ok: false, error: 'ข้อความมีเนื้อหาที่ไม่อนุญาต' },
      { status: 400 },
    );
  }

  if (countUrls(data.message) > 3) {
    return NextResponse.json(
      { ok: false, error: 'ข้อความมีลิงก์มากเกินไป (สูงสุด 3 ลิงก์)' },
      { status: 400 },
    );
  }

  // ---- Send email ----
  try {
    await sendContactFormEmail(data);
    emailCooldown.set(emailLower, now);
  } catch (err) {
    console.error('[Contact] Failed to send email:', err);
    return NextResponse.json(
      { ok: false, error: 'ส่งข้อความไม่สำเร็จ กรุณาลองใหม่' },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
