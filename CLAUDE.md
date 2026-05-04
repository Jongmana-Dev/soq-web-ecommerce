# soq-web-ecommerce — Claude Code Context

> Customer-facing e-commerce frontend สำหรับ SOQ (Star San Sanitizer)
> Public domain: `soqthailand.com` | Local: `http://localhost:3010`

ดู context ทั้งโปรเจคที่ `../CLAUDE.md` — ไฟล์นี้เน้นเฉพาะ ecommerce

---

## Stack สำคัญ

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 (PostCSS-based, ไม่ใช่ v3 syntax!)
- **i18n:** next-intl (locales: `th` default, `en`)
- **Auth:** NextAuth v5 beta
- **State:** Zustand (`src/lib/store.ts` — canonical)
- **UI:** shadcn/ui (new-york) + Radix + lucide-react
- **Animation:** Framer Motion + Lenis
- **Validation:** Zod
- **Email:** Nodemailer
- **Payment:** PromptPay QR + slip verification (SlipOk API)
- **Package Manager:** **pnpm** (อย่าใช้ npm/yarn ในนี้)

---

## โครงสร้าง src/

```
src/
├── app/[locale]/          # App Router (i18n-routed)
│   ├── (store)/           # Public ecommerce pages
│   ├── (admin)/           # Member panel (NOT main admin — main admin = soq-web-management-frontend-system)
│   └── api/               # Route handlers (auth, verify-slip, etc.)
├── auth.ts                # NextAuth config
├── components/            # Shared components
├── hooks/                 # Custom React hooks
├── i18n/                  # next-intl config
├── lib/                   # Utilities + Zustand store
├── messages/              # Translation files (th.json, en.json)
├── providers/             # Context providers
└── types/                 # TS type definitions
```

---

## คำสั่งที่ใช้บ่อย

```bash
pnpm dev          # dev server :3010
pnpm build        # production build
pnpm start        # serve production build
pnpm lint         # next lint
```

**ห้ามรัน `pnpm install` โดยไม่ถาม** — ใช้เวลานาน

---

## กฎเฉพาะ ecommerce

### i18n
- **ทุก user-facing text** ต้องผ่าน `useTranslations()` จาก next-intl
- เพิ่ม key ใหม่ → ต้องเพิ่มใน `src/messages/th.json` และ `src/messages/en.json` ทั้งคู่
- URL: `/th/...`, `/en/...` (locale ใน path)

### State Management
- ใช้ Zustand ตัวเดียวที่ `src/lib/store.ts`
- **ห้ามสร้าง store ใหม่** หรือใช้ Context API ขนาน — ปัญหาเดิมที่กำลังแก้คือมี cart 4 ตัวขัดแย้งกัน

### Tailwind v4
- ใช้ v4 syntax (`@theme`, `@utility`) — **ห้ามใช้ v3 syntax** (`@layer base { :root { --color-... } }`)
- Config อยู่ใน `globals.css` ไม่ใช่ `tailwind.config.ts`

### Server vs Client Components
- Default = Server Component
- ใช้ `'use client'` เฉพาะที่ต้องการ state, effect, browser API, event handlers
- Data fetching ที่ดีที่สุด = Server Component + `await fetch()` หรือ direct DB call

### Payment Slip Verification
- Endpoint: `/api/verify-slip` (POST)
- Body limit: **12 MB** (RC-4: รับรูป base64 10 MB + JSON overhead)
- Backend timeout 60s (SlipOk บางครั้งช้า)

### SEO / ISR
- `generateMetadata()` ทุกหน้าที่ public
- ISR: ใช้ `revalidate = N` ใน page.tsx สำหรับหน้าที่ data ไม่เปลี่ยนบ่อย
- ดู `docs/review-seo-isr.md` สำหรับ detail แต่ละหน้า

---

## Issues สำคัญที่ต้องระวัง (จาก review-tracker.md)

1. **Cart consolidation** — มี cart implementation 4 ตัวขัดแย้งกัน → ต้องเหลือ Zustand ตัวเดียว
2. **Tailwind syntax mix** — `globals.css` มี v3 + v4 ปนกัน
3. **CI/CD missing stages** — `.gitlab-ci.yml` ไม่มี test/lint/build (เฉพาะ deploy)
4. **Contact form** — ไม่มี submit handler
5. **Product detail** — ขาด data fetching layer

ดูทั้งหมดที่ `docs/review-tracker.md`

---

## Connect กับ services อื่น

| ปลายทาง | ผ่าน | ใช้ทำอะไร |
|---|---|---|
| API (`soq-web-management-api-system`) | `soq-web-management-api.railway.internal:3001` | Product, order, member data |
| NGINX | external (Cloudflare → NGINX → ตัวเอง) | Public traffic entry |
| SlipOk | https external | Payment slip verification |

Local dev: API ต้องรันที่ port 3001 ก่อน (ใน `soq-web-management-api-system`)

---

## เอกสารใน docs/

- `MEMORY.md` — สรุปสำคัญ + กฎ
- `project-soq-web.md` — architecture detail
- `review-tracker.md` — issue tracker
- `review-seo-isr.md`, `review-seo-isr-summary.md` — SEO findings
