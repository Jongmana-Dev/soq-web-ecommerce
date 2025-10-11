# SOQ Website (Next.js 15 + Tailwind + shadcn/ui + next-intl + Framer Motion)

เว็บไซต์ขายสินค้ากลุ่มน้ำยาทำความสะอาด/ฆ่าเชื้ออุปกรณ์ทำคราฟท์เบียร์ **SOQ**  
รองรับ i18n (ไทย/อังกฤษ), full responsive, motion, และพร้อม deploy (Docker/CI)

## Quick start

```bash
npm i
npm run dev              # http://localhost:3000  (auto redirect -> /th)
```

### Production
```bash
npm run build
npm start                # port 3000
```

### Docker
```bash
docker build -t soq .
docker run -p 3000:3000 soq
```

### Test/Typecheck/Lint
```bash
npm test
npm run typecheck
npm run lint
```

## Tech
- Next.js 15 (App Router) + Image optimization
- TailwindCSS 3.4 + shadcn/ui (button/input/accordion/sheet/etc.)
- next-intl (i18n `app/[locale]/*` with middleware)
- Zustand (Cart) + Framer Motion (animations)
- Edge API `/api/contact` (rate-limit + Zod)

## Notes
- รูปทั้งหมดดึงจาก CDN (`placehold.co`, `images.unsplash.com`) — เปลี่ยนเป็นรูปจริงได้ทันที
- ปรับดีไซน์ตาม Figma ได้จาก component‑based structure ใน `components/*`
- ตั้งค่า Remote Images อยู่ใน `next.config.mjs`
