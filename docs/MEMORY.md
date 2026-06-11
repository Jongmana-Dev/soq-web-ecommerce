# SOQ Project Memory

## โปรเจคที่ดูแล
- **soq-web-ecommerce** — เว็บ e-commerce สำหรับ SOQ (สินค้า Star San Sanitizer)
  - Path: `/Users/nattawut.dev/_WORK_/_PROJECT/SOQ/soq-web-ecommerce`
  - Stack: Next.js 16 + React 19 + TypeScript + Tailwind v4 + next-intl
  - Deploy: Railway ผ่าน GitLab CI (branch main)
  - Package Manager: pnpm
  - รายละเอียดเพิ่มเติม → [project-soq-web.md](./project-soq-web.md)

## กฎ & แนวทางสำคัญ
- ใช้ `@/` path alias เสมอ (map ไปที่ `./src/*`)
- ภาษา: `th` (default), `en` — ใช้ `useTranslations()` จาก next-intl สำหรับ text ทั้งหมด
- State management: ใช้ Zustand ตัวเดียว (`src/lib/store.ts`) เป็น canonical store
- UI components: shadcn/ui (new-york style) + Radix + lucide-react icons
- Animation: Framer Motion + Lenis smooth scroll
- Font: Prompt (ไทย+Latin), Poppins (หัวข้อ) ผ่าน `next/font/google`
- Theme: next-themes, `defaultTheme="dark"`, strategy แบบ class

## ปัญหาสำคัญที่ต้องแก้ (จาก review 2026-02-07)
ดูรายละเอียดทั้งหมด → [review-tracker.md](./review-tracker.md)
ลำดับความสำคัญ:
1. Cart มี 4 ตัวที่ขัดแย้งกัน — ต้อง consolidate เหลือ Zustand ตัวเดียว
2. Tailwind v3/v4 syntax ปนกันใน globals.css
3. CI/CD pipeline ไม่มี test/lint/build stage
4. Contact form ไม่มี submit handler
5. Product detail page ไม่มี data fetching

## Production Incidents
- **2026-06-11 — RAM spike 1.2GB + login/logout ช้าเป็นช่วง (RC-11: AVIF encoding)**
  - Root cause: `formats: ['image/avif', ...]` — AVIF encode แพงกว่า WebP ~19x (วัดจริง 18s
    ที่ w=1920) + image cache หายทุก deploy + TTL แค่ 1 วัน → re-encode burst →
    RAM spike + libuv threadpool (4 threads) อิ่มตัว → DNS ของ fetch อื่นต่อคิว → login ช้า
  - Fix: WebP only + `minimumCacheTTL` 1 ปี (`next.config.ts`), `--max-old-space-size=512`
    (`railway.json`), timeout 15s ใน `adapterFetch` (`src/lib/auth-adapter.ts`)
  - เฝ้าหลัง deploy: RAM ควร peak < 600MB, ดูว่าไม่มี OOM restart ถี่ผิดปกติใน week แรก
  - ค้างไว้ (ฝั่ง infra): เช็ค App Sleeping ของ API + bucket service (เจอ 504 บนไฟล์ 64KB ตอนตี 2)
- **2026-06-11 — Google login พัง (error=Configuration) สำหรับ user ที่เข้าผ่าน www**
  - Root cause: ยังไม่ deploy NGINX → ไม่มีตัว redirect `www.soqthailand.com` → apex
    user เริ่ม OAuth บน www → PKCE cookie (host-only) อยู่บน www แต่ Google callback
    กลับมาที่ apex (ตาม NEXTAUTH_URL) → cookie หาย → `InvalidCheck: pkceCodeVerifier`
  - Fix: เพิ่ม host-based redirect www → apex ใน `next.config.ts` (redirects + has host)
  - แนะนำเพิ่ม: ตั้ง Cloudflare Redirect Rule www → apex (301) ที่ edge ด้วย
  - เมื่อ NGINX go-live: `20-member.conf` มี www → apex redirect อยู่แล้ว (ซ้ำกันได้ ไม่เป็นไร)
  - เอกสารเต็ม → [defects/2026-06-11-google-oauth-www-pkce.md](./defects/2026-06-11-google-oauth-www-pkce.md)

## ประวัติ Code Review
- `review_code/soq_web_20260207_035827.md` — Review ครั้งแรก (พบ 117 issues)
- `review_code/011-performance_tunning/` — Railway RAM audit (2026-04-25)
  - Top findings: ไม่มี `output: 'standalone'`, `.ignored` 323MB, 4 Hero bundled, verify-slip buffer copies
  - Priority: P0-1 (standalone), P0-2 (clean .ignored), P1-1 (split hero), P1-2 (stream slip)
