# Defect: Google OAuth login พังสำหรับ user ที่เข้าเว็บผ่าน www (PKCE cookie host mismatch)

| | |
|---|---|
| **Defect ID** | DEF-2026-06-11-01 |
| **วันที่พบ** | 2026-06-11 |
| **Severity** | High — user กลุ่มหนึ่ง login ไม่ได้เลย (blocked) |
| **Service** | soq-web-ecommerce (soqthailand.com) |
| **Component** | NextAuth v5 (Auth.js) — Google OAuth flow |
| **สถานะ** | Fixed in code — **รอ deploy + verify production** |
| **Fix** | `next.config.ts` — host-based redirect www → apex (ยังไม่ commit, รอคำสั่ง) |
| **Owner** | nattawut.dev |

---

## Summary

User ที่เข้าเว็บผ่าน `www.soqthailand.com` กด login ด้วย Google แล้วเจอหน้า
"Server error — There is a problem with the server configuration"
(`/api/auth/error?error=Configuration`, HTTP 500) ทุกครั้ง ขณะที่ user ที่เข้าผ่าน
`soqthailand.com` (apex) login ได้ปกติ — ทำให้อาการดูเหมือน "เกิดกับบาง user แบบสุ่ม"

สาเหตุคือเว็บถูกเสิร์ฟบนทั้งสอง host โดยไม่มีตัว redirect www → apex
(NGINX ที่มี redirect นี้ยังไม่ถูกใช้งานใน production) ทำให้ OAuth flow เริ่มบน host หนึ่ง
แต่ callback กลับมาอีก host หนึ่ง → PKCE cookie หาย

แก้โดยเพิ่ม host-based 301 redirect `www.soqthailand.com/:path*` → `https://soqthailand.com/:path*`
ใน `next.config.ts`

---

## Symptom

จาก Railway deploy logs ของ soq-web-ecommerce (พบหลายครั้ง เช่น 2026-06-11T09:17:55Z, 09:42:51Z):

```
[auth][error] InvalidCheck: pkceCodeVerifier value could not be parsed.
Read more at https://errors.authjs.dev#invalidcheck
    at i0 (/app/.next/standalone/.next/server/chunks/_42eba406._.js:404:24542)
```

ฝั่ง browser: redirect ไป `https://soqthailand.com/api/auth/error?error=Configuration`
→ HTTP 500 → หน้า "Server error" default ของ Auth.js

---

## Root cause

กลไกตามลำดับ:

1. **เว็บเสิร์ฟบน www ได้เต็มรูปแบบ** — production ยังไม่ใช้ NGINX
   (`soq-nginx-services/conf.d/20-member.conf:21-29` ที่มี www → apex 301 redirect ยังไม่ deploy)
   traffic วิ่ง Cloudflare → Railway → Next.js ตรง ๆ และ DNS `www` ชี้มาที่ app เดียวกัน
2. User เข้าผ่าน `https://www.soqthailand.com` แล้วกด "เข้าสู่ระบบด้วย Google"
   (`src/components/modals/LoginModal.tsx:34` → `signIn('google', ...)`)
3. `POST /api/auth/signin/google` ถูกตอบจาก host `www.soqthailand.com` → Auth.js เซ็ต
   `__Secure-authjs.pkce.code_verifier` cookie ซึ่งเป็น **host-only cookie** → ผูกกับ
   `www.soqthailand.com` เท่านั้น (TTL 15 นาที — ดู `@auth/core/lib/actions/callback/oauth/checks.js`)
4. แต่ `redirect_uri` ที่ส่งให้ Google สร้างจาก env `NEXTAUTH_URL=https://soqthailand.com`
   → Google redirect กลับมาที่ **apex**: `https://soqthailand.com/api/auth/callback/google`
5. Browser ไม่ส่ง cookie ของ www ไปยัง apex (คนละ host) → `pkceCodeVerifier` cookie หายที่ callback
6. `@auth/core` `parseCookie()` (checks.js:27-47) — cookie missing ถูก throw ใน try แล้ว catch
   rethrow เป็น `InvalidCheck: pkceCodeVerifier value could not be parsed`
   (ข้อความนี้ครอบคลุมทั้ง "cookie หาย" และ "decode ไม่ได้" — ทำให้ตอนแรกหลงทางไปสืบเรื่อง AUTH_SECRET)
7. Auth.js map InvalidCheck → `error=Configuration` → หน้า Server error

หมายเหตุ: `@auth/core@0.41.0`, `next-auth@5.0.0-beta.30`

## Why it produced the symptom

- Error ฝั่ง server ทุกประเภทของ Auth.js ถูก map เป็น `error=Configuration` หน้าตาเดียวกันหมด
  ทำให้อาการดูเหมือน "server config พัง" ทั้งที่จริงคือ cookie ข้าม host
- เกิดเฉพาะ user ที่ **เข้าเว็บทาง www** (ลิงก์เก่า, ผลค้นหา, พิมพ์ www เอง) → ดูเหมือน random
- เกิดบน PC browser ปกติได้ — ไม่เกี่ยวกับ in-app browser หรือ cookie blocking

---

## Fix

`soq-web-ecommerce/next.config.ts` — เพิ่ม redirect เป็นกฎแรกใน `redirects()`:

```ts
{
  source: '/:path*',
  has: [{ type: 'host', value: 'www.soqthailand.com' }],
  destination: 'https://soqthailand.com/:path*',
  permanent: true,
},
```

ทำไมแก้ที่ root cause: OAuth (PKCE/state/nonce cookie เป็น host-only) ต้องเริ่มและจบ flow
บน host เดียวกัน การบังคับ canonical host ตั้งแต่ request แรกทำให้ทุก flow อยู่บน apex เสมอ
— ไม่ใช่การซ่อนอาการ (เช่น ไปปิด PKCE check หรือเปลี่ยน error page)

แนวป้องกันเสริม (infra — ทำโดย owner):

- **Cloudflare Redirect Rule**: `www.soqthailand.com/*` → `https://soqthailand.com/$1` (301)
  — มีผลทันทีโดยไม่ต้อง deploy และตัด traffic ที่ edge
- เมื่อ NGINX go-live: `20-member.conf` มี redirect เดียวกันอยู่แล้ว (ซ้ำซ้อนได้ ไม่ขัดกัน)

---

## How it was found

1. **Hypothesis แรก (ผิด)**: in-app browser block cookie / AUTH_SECRET เปลี่ยนระหว่าง deploy /
   user ค้างหน้า Google เกิน 15 นาที — ตกไปเมื่อ user ยืนยันว่าเกิดบน PC browser ปกติ
2. **Hypothesis สอง (ผิด)**: NGINX rate limit `zone=auth 10r/m` ตัด request กลาง flow —
   ตกไปเมื่อยิง `/api/auth/session` รัว 8 ครั้งแล้วไม่เจอ 429 + response header ไม่มี
   HSTS/X-Cache-Status ที่ NGINX ควรใส่ → พบว่า **traffic ไม่ผ่าน NGINX เลย** (user ยืนยัน)
3. **การทดลองที่ชี้ขาด**: `curl -D - https://www.soqthailand.com/` ตอบ `307 location: /th`
   (เสิร์ฟ app บน www โดยไม่ redirect ไป apex) และ `curl https://www.soqthailand.com/api/auth/csrf`
   ตอบ 200 พร้อม `Set-Cookie` host-only บน www แต่ `__Secure-authjs.callback-url=https://soqthailand.com`
   → พิสูจน์ host split ใน flow เดียวกัน
4. ตรวจ env ผ่าน `/api/health`: `NEXTAUTH_URL=set`, `NEXTAUTH_SECRET=set` → ตัดสมมติฐาน env หาย

## Why it slipped through

- Workload gap: ทดสอบ login กันบน apex เสมอ ไม่มี test case "เข้าเว็บผ่าน www"
- Latent assumption: สถาปัตยกรรมออกแบบให้ NGINX เป็นคน redirect www → apex
  (`20-member.conf`) แต่ production จริงยัง bypass NGINX อยู่ — app จึงไม่มีใครทำหน้าที่นี้แทน
- Error message ของ Auth.js (`error=Configuration`) ชี้ทางผิดไปเรื่อง server config

---

## Validation

**สถานะ: รอ deploy — ยังไม่ verified ใน production**

ทำแล้ว:
- `pnpm build` ผ่าน (redirect config ถูก parse และ compile ปกติ)
- กลไก root cause ยืนยันด้วย curl probe บน production จริง (ดู How it was found ข้อ 3)

ต้องทำหลัง deploy (หรือหลังตั้ง Cloudflare rule):
1. [x] `curl -sI https://www.soqthailand.com/th` → ได้ `301` + `location: https://soqthailand.com/th`
   (verified 2026-06-11 หลังตั้ง Cloudflare Redirect Rule — query string preserve ครบ,
   `/api/auth/*` redirect ด้วย, apex ตอบ 200 ไม่โดน redirect)
2. [x] Cloudflare Redirect Rule www → apex 301 ตั้งและทำงานแล้ว (2026-06-11)
3. [ ] Login Google โดยเริ่มจาก URL www ใน browser จริง → ต้องสำเร็จ ไม่เจอ `error=Configuration`
4. [ ] เฝ้า Railway logs 2-3 วัน — `InvalidCheck: pkceCodeVerifier` ต้องหายไป

---

## Action items

- [ ] Deploy fix `next.config.ts` (owner: nattawut.dev — commit/push เอง)
- [x] ตั้ง Cloudflare Redirect Rule www → apex 301 (owner: nattawut.dev — done 2026-06-11, verified)
- [ ] Verify ข้อ 3-4 ใน Validation (login จริงผ่าน browser + เฝ้า logs) (owner: nattawut.dev)
- [ ] เพิ่ม "เข้าเว็บ + login ผ่าน www" ใน QA test plan (`qa-testing/`) (owner: nattawut.dev)
- [ ] เมื่อ NGINX go-live: ทดสอบซ้ำว่า redirect ที่ edge ไม่ชนกับ redirect ใน app

## Related (พบระหว่างสืบ ไม่ใช่ defect นี้)

- `CallbackRouteError: unexpected "iss"` พร้อม `parameters: {}` — callback ที่ไม่มี query string
  (refresh/bookmark/bot) เป็น noise ไม่ใช่ config ผิด
- `src/auth.ts:46-48` ตั้งแค่ `pages.signIn: '/login'` (route ไม่มีจริง) และไม่มี `pages.error`
  — user ที่เจอ auth error จะเห็นหน้า default ภาษาอังกฤษ ควรพิจารณาทำ error page ภาษาไทย
- `src/app/api/health/route.ts` expose สถานะ env vars เป็น public — ควรพิจารณาปิดหรือจำกัดก่อน go-live
