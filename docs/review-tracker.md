# ตัวติดตาม Issue จาก Code Review — SOQ Web E-commerce

**ไฟล์ Review ต้นทาง:** `review_code/soq_web_20260207_035827.md`
**อัปเดตล่าสุด:** 2026-02-07

## สัญลักษณ์สถานะ
- [ ] ยังไม่ได้แก้
- [x] แก้แล้ว
- [-] ไม่แก้ / เลื่อนไปก่อน

---

## CRITICAL — ต้องแก้ก่อน (12 issues)

- [x] **CRIT-01** `<html>` ซ้อนกัน 2 ชั้นใน layout → แก้แล้ว: root layout return แค่ `children`
- [x] **CRIT-02** Cart มี 4 ตัวขัดแย้งกัน → แก้แล้ว: consolidate เหลือ `src/lib/store.ts` ตัวเดียว, ลบ `src/lib/cart.ts`, `src/store/cart.ts`, `src/providers/CartProvider.tsx`, `src/app/providers.tsx`
- [x] **CRIT-03** Tailwind v3/v4 syntax ปนกัน → แก้แล้ว: ลบ `@tailwind` directives ออกจาก globals.css, ลบ `tailwind.config.js`
- [x] **CRIT-04** Vitest `setupFiles` ชี้ path ผิด → แก้แล้ว: เปลี่ยนเป็น `./vitest.setup.ts`
- [x] **CRIT-05** GitLab CI deploy ตรงไป production ไม่มี build/test/lint → แก้แล้ว: เพิ่ม validate stage (lint+build) ก่อน deploy, ใช้ pnpm
- [x] **CRIT-06** `AddToCart` สร้าง random ID ทุกครั้ง → แก้แล้ว: ใช้ stable `slug` เป็น ID, รับ props `slug`, `name`, `price`
- [ ] **CRIT-07** หน้า Product detail ไม่มี data fetching เลย → เลื่อนไป (รอทำ API)
- [ ] **CRIT-08** Contact form ไม่มี `onSubmit` handler → เลื่อนไป (รอทำ API)
- [x] **CRIT-09** Showcase ใช้ path รูป `/assets/` ที่ไม่มีอยู่จริง → แก้แล้ว: ใช้รูปจาก `/images/`
- [x] **CRIT-10** มี package ที่ไม่ควรอยู่ → แก้แล้ว: `pnpm remove add dialog dlx next-font`
- [x] **CRIT-11** next-intl config ขัดแย้ง → แก้แล้ว: ลบ `next-intl.config.ts`, ใช้ `src/i18n/routing.ts` เป็นหลัก
- [ ] **CRIT-12** Memory leak ใน contact API → เลื่อนไป (รอทำ API)

---

## HIGH — ควรแก้เร็ว (28 issues)

### Bugs
- [x] **HIGH-01** Navbar/Footer ซ้ำในหน้า product → แก้แล้ว: ลบ Navbar/Footer ออกจาก product page
- [x] **HIGH-05** LuxuryCursor ใช้ non-null assertion → แก้แล้ว: เพิ่ม null check ทุกจุด
- [x] **HIGH-06** ปุ่ม add-to-cart ใน ProductModal ไม่มี onClick → แก้แล้ว: ผ่าน cart consolidation
- [x] **HIGH-07** CartSheet ถูก comment out ใน Header → แก้แล้ว: uncomment + ส่ง props จาก Zustand store
- [ ] **HIGH-08** ปุ่ม play video ใน Testimonials กดแล้วไม่เกิดอะไร
- [ ] **HIGH-09** ปุ่ม checkout แสดง `alert()` แทนที่จะไปหน้าชำระเงิน
- [x] **HIGH-10** Smoke test อาจ import ผิด path → แก้แล้ว: เปลี่ยนเป็น importability test
- [x] **HIGH-11** `force-static` ขัดกับ `redirect()` → แก้แล้ว: ลบ `force-static`
- [x] **HIGH-22** ไฟล์ `providers.tsx` ไม่ได้ถูกใช้งาน → แก้แล้ว: ลบไฟล์
- [x] **HIGH-23** ThemeProvider ตั้ง default ต่างกัน → แก้แล้ว: ลบ providers.tsx, เหลือ layout.tsx ที่ใช้ `dark`
- [x] **HIGH-24** Marquee animation ไม่ได้ define ใน CSS → ตรวจแล้ว: มี define อยู่แล้วใน globals.css

### Security
- [ ] **HIGH-02** ใช้ `<img>` ธรรมดาใน cart page โดยไม่ validate src → เสี่ยง XSS
- [ ] **HIGH-03** คำนวณราคาฝั่ง client เท่านั้น ไม่มี server validation
- [ ] **HIGH-04** Rate limiter เก็บใน memory → ไม่ work บน serverless
- [ ] **HIGH-13** ไม่มี CSRF protection บน contact API
- [ ] **HIGH-14** สามารถ spoof IP ผ่าน `x-forwarded-for` เพื่อ bypass rate limit
- [ ] **HIGH-15** next.config.ts whitelist domain รูปจาก placeholder/upload service
- [x] **HIGH-16** Railway ใช้ pnpm แต่ GitLab CI ใช้ npm → แก้แล้ว: CI ใช้ pnpm ผ่าน corepack

### Performance
- [ ] **HIGH-17** ไม่มี `generateStaticParams` บน dynamic routes
- [x] **HIGH-18** globals.css ผสม directive ของ Tailwind v3 + v4 → แก้แล้ว: ลบ v3 directives

### Accessibility
- [ ] **HIGH-19** Custom cursor กระทบผู้ใช้ assistive technology
- [x] **HIGH-20** FAQ accordion ไม่มี `aria-expanded` → แก้แล้ว: เพิ่ม `aria-expanded`

### i18n
- [ ] **HIGH-21** Pricing section เป็นภาษาไทยอย่างเดียว ไม่มี i18n
- [x] **HIGH-25** เปลี่ยนภาษาผ่าน `window.location.href` → แก้แล้ว: ใช้ next-intl `useRouter` + `router.replace`
- [ ] **HIGH-26** CartSheet ข้อความเป็นไทยทั้งหมด ไม่ได้ใช้ i18n

### Data / Code Quality
- [ ] **HIGH-27** ข้อมูลสินค้า hard-code อยู่ใน Product.tsx
- [x] **HIGH-28** ใช้ `as any` หลายจุดใน Navbar → แก้แล้ว: ใช้ next-intl Link/useRouter + `<a>` สำหรับ hash links

---

## MEDIUM (42 issues) — ดูรายละเอียดใน review ฉบับเต็ม
หมวดหลัก:
- ไม่มี SEO metadata ในหลายหน้า
- พึ่งพา CDN ภายนอก (Font Awesome)
- ข้อมูล hard-code ในหลาย section
- ใช้รูป placeholder จาก service ภายนอก
- ไม่มี error handling / error boundary
- Dead links ใน footer
- สัญลักษณ์เงินไม่ตรง ($ กับ ฿)

---

## LOW (35 issues) — ดูรายละเอียดใน review ฉบับเต็ม
หมวดหลัก:
- comment ภาษาไทยใน production code
- Unused imports
- Code ที่ถูก comment ออก
- Accessibility ที่ยังขาด
- ไม่มี `prefers-reduced-motion` check

---

## แผนแก้ไขตามลำดับ

### Phase 1 — แก้ Critical (ต้องทำก่อน) ✅ เสร็จแล้ว (ยกเว้น API-related)
1. ~~รวม cart ให้เหลือ Zustand store ตัวเดียว~~
2. ~~แก้ Tailwind v3/v4 ให้ตรงกัน~~
3. ~~แก้ vitest config path~~
4. ~~ลบ package ที่ไม่จำเป็น~~
5. ~~แก้ next-intl config conflict~~
6. ใส่ submit handler ให้ contact form → รอทำ API
7. ~~แก้ AddToCart ให้ใช้ stable product ID~~

### Phase 2 — แก้ High (ทำให้ใช้งานได้จริง) ✅ ส่วนใหญ่เสร็จแล้ว
1. Implement product data fetching → รอทำ API
2. ~~ลบ Navbar/Footer ที่ซ้ำออก~~
3. ~~เพิ่ม test/lint/build stage ใน CI/CD~~
4. ~~แก้ LuxuryCursor null check~~
5. ~~ต่อปุ่ม add-to-cart ใน ProductModal~~
6. ~~ลบไฟล์ dead code (providers.tsx)~~

### Phase 3 — Security Hardening
1. เปลี่ยนรูปจาก external มาเป็น self-hosted
2. เพิ่ม server-side price validation
3. เพิ่ม CSRF protection
4. ใช้ external rate limiter (Redis)
5. ลบ image domain ที่ไม่จำเป็นออกจาก next.config.ts

### Phase 4 — ขัดเกลา
1. ทำ i18n ให้ครบทุก component
2. เพิ่ม SEO metadata
3. ปรับปรุง accessibility
4. เขียน test ให้ครอบคลุม
5. เพิ่ม error boundary
