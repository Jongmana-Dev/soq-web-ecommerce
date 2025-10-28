//# API ฟอร์มติดต่อ (Edge, zod validate + rate limit in-memory)
import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';

// export const runtime = 'edge';
export const preferredRegion = ['sin1']; // <- เอา `as const` ออก

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
});

// in-memory rate limit per IP (basic; replace with KV/Redis in prod)
const bucket = new Map<string, {count: number; ts: number}>();

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();

  // บาง environment (เช่น dev server) อาจมี `req.ip`
  const withIp = req as unknown as { ip?: string };
  if (withIp.ip) return withIp.ip;

  return 'unknown';
}

export async function POST(req: NextRequest) {
  // ---- rate limiting ----
  const ip = getClientIp(req);
  const now = Date.now();
  const windowMs = 60_000;
  const max = 5;

  const entry = bucket.get(ip) ?? {count: 0, ts: now};
  if (now - entry.ts > windowMs) {
    entry.count = 0;
    entry.ts = now;
  }
  entry.count += 1;
  bucket.set(ip, entry);

  if (entry.count > max) {
    return NextResponse.json({ok: false, error: 'Too many requests'}, {status: 429});
  }

  // ---- payload & validate ----
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ok: false, error: 'Invalid JSON'}, {status: 400});
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {ok: false, errors: parsed.error.flatten().fieldErrors},
      {status: 400}
    );
  }

  // TODO: ส่งอีเมล/ยิง webhook ที่นี่
  // await fetch(process.env.CONTACT_WEBHOOK_URL!, { method: 'POST', body: JSON.stringify(parsed.data) });

  return NextResponse.json(
    {ok: true},
    {headers: {'Cache-Control': 'no-store'}}
  );
}
