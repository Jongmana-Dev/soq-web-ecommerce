# Defect: RAM spike 1.2 GB + login/logout ช้าเป็นช่วง (AVIF encoding)

| | |
|---|---|
| **Defect ID** | DEF-2026-06-11-02 (ต่อจาก RC-1..RC-10 ใน `review_code_phase2/04-performanc_tuning/` → นับเป็น RC-11) |
| **วันที่พบ** | 2026-06-11 |
| **Severity** | Medium-High — ไม่ down แต่ degrade ทั้งระบบเป็นช่วง + ค่า Railway สูงขึ้น (คิดตาม GB-hr) |
| **Service** | soq-web-ecommerce (soqthailand.com) |
| **Component** | Next.js Image Optimization (sharp), Node.js runtime, auth adapter |
| **สถานะ** | Fixed in code — **รอ deploy + เฝ้า metrics** |
| **Owner** | nattawut.dev |

---

## Summary

อาการ 2 อย่างที่รายงานแยกกัน — (1) login/logout ช้าเป็นบางครั้ง (2) RAM บน Railway
พุ่งถึง 1.2 GB เป็นบางช่วง — มี root cause ร่วมกันคือ **AVIF image encoding**:
ทุกรูปที่ cache miss ต้อง encode AVIF ซึ่งวัดจริงแล้วช้ากว่า WebP ~19 เท่า กิน CPU + RAM
หนัก และยึด libuv threadpool จน fetch อื่น (รวม adapter call ตอน login) ต้องต่อคิว

แก้โดยตัด AVIF เหลือ WebP, ยืด image cache TTL เป็น 1 ปี, ตั้งเพดาน V8 heap 512 MB,
และเพิ่ม timeout 15s ใน auth adapter

---

## Symptom

1. User รายงาน: login/logout แล้วเว็บทำงานช้า เกิด "บางที" ไม่สม่ำเสมอ
2. Railway metrics: RAM ขึ้นไปแตะ ~1.2 GB เป็นบางช่วง (baseline หลัง RC-1 fix เมื่อ
   2026-04-25 อยู่ที่ ~400 MB swing 200-500)
3. Railway logs มี upstream 504 จาก image optimizer:

```
upstream image response timed out for https://bucket-production-733b.up.railway.app/
  soq-storage/usage-steps/...webp  (2026-06-07T02:06:51Z)
Error: "url" parameter is valid but upstream response timed out { statusCode: 504 }
```

---

## Root cause

### ตัวหลัก: AVIF encoding (RC-11)

1. `next.config.ts` ตั้ง `formats: ['image/avif', 'image/webp']` — browser หลักทุกตัว
   ส่ง `Accept: image/avif` → ทุก cache miss ของ `/_next/image` ต้อง encode AVIF
2. **วัดจริงบน production (2026-06-11):**

   | Request | เวลา |
   |---|---|
   | AVIF encode w=1920 (cache miss) | **17.98s** |
   | WebP encode w=1920 (cache miss) | 0.96s |
   | AVIF (cache hit) | 0.92s |
   | ขนาดที่ AVIF ประหยัดได้ | 47 KB → 33 KB (ไม่คุ้ม) |

3. Image cache (`.next/cache/images`) **หายทุกครั้งที่ deploy** + `minimumCacheTTL: 86400`
   (1 วัน) → หลัง deploy และทุกวัน variant หมดอายุ → re-encode burst:
   ทุกรูป × ทุกขนาด (640/1080/1920/...) × AVIF
4. ระหว่าง encode burst:
   - sharp ถือ raw bitmap + aom encoder state หลายตัวพร้อมกัน → **RAM spike**
   - ไม่มี `--max-old-space-size` → V8 ตั้ง heap limit ตาม memory ของ host (สูงมาก)
     → GC ขี้เกียจ → RSS ค้างสูงนาน → กราฟ 1.2 GB + ค่า Railway บวม

### กลไกที่ทำให้ login/logout ช้า (เชื่อมอาการ 1 ↔ 2)

sharp ทำงานบน **libuv threadpool** ของ Node (default 4 threads) — AVIF encode 4 ตัว
ยึด threadpool เต็ม → งานอื่นที่ใช้ threadpool ต้องต่อคิว โดยเฉพาะ **DNS lookup
(getaddrinfo) ของ `fetch()`** → adapter calls ตอน login (`src/lib/auth-adapter.ts`
ยิง API หลายครั้งต่อเนื่องต่อ 1 login: getUserByAccount → getUserByEmail →
createUser/linkAccount) ช้าตามทั้งสาย → user รู้สึก "login แล้วเว็บช้า"
ในช่วงเดียวกับที่ RAM สูง

### ปัจจัยเสริม

- Bucket (MinIO บน Railway) ตอบ **504 บนไฟล์แค่ 64-94 KB** ตอน 02:06 (traffic ต่ำ)
  → มี cold start / sleep — ทำ image fetch ค้างและ login ช้าในช่วง idle
- `adapterFetch` เดิมไม่มี timeout → ถ้า API ค้าง login ค้างไม่มีกำหนด

### สิ่งที่ตรวจแล้ว "ไม่ใช่" สาเหตุ

- รูปต้นทางใน bucket ใหญ่เกิน — ไม่ใช่ (วัดแล้ว 64-94 KB, webp อยู่แล้ว)
- In-memory cache รั่ว (contact/verify-slip rate limit Map) — ไม่ใช่ (มี cleanup, bounded)
- ISR / fetch data cache — ไม่ใช่ (Next จำกัด ~50 MB ในตัว)
- RC-1..RC-4 เดิม regress — ไม่ใช่ (standalone + verify-slip guard ยังอยู่)

---

## Fix (applied 2026-06-11, build ผ่าน)

| # | ไฟล์ | การแก้ | เหตุผล |
|---|---|---|---|
| 1 | `next.config.ts` | `formats: ['image/webp']` (ตัด AVIF) | ตัดต้นตอ — รูปต้นทางเป็น webp เล็กอยู่แล้ว AVIF ได้คืนแค่ ~14 KB แลกกับ 19x CPU |
| 2 | `next.config.ts` | `minimumCacheTTL: 86400` → `31536000` (1 ปี) | ชื่อไฟล์ใน bucket เป็น UUID ต่อการอัปโหลด = immutable → encode ครั้งเดียวต่อ deploy |
| 3 | `railway.json` | startCommand เพิ่ม `NODE_OPTIONS=--max-old-space-size=512` | บังคับ GC ทำงานจริง — RSS ไม่ค้างสูง, ค่า Railway คุมได้ |
| 4 | `src/lib/auth-adapter.ts` | `signal: AbortSignal.timeout(15_000)` ใน `adapterFetch` | login fail เร็วแบบรู้เรื่องแทนค้างไม่มีกำหนด (15s เผื่อ API cold start) |

### ผลกระทบต่อพฤติกรรมเดิม

- ข้อ 1: browser ได้ WebP แทน AVIF — visual เหมือนเดิม, ไฟล์ใหญ่ขึ้นเล็กน้อย, รองรับทุก browser
- ข้อ 2: ปลอดภัยตราบใดที่ไม่มี flow overwrite ไฟล์ชื่อเดิมใน bucket (ปัจจุบันไม่มี)
- ข้อ 3: trade-off — ถ้า heap เกิน 512 MB จริง process restart (Railway restartPolicy
  จัดการ) — by design: fail เร็วดีกว่า degrade ทั้งระบบ
- ข้อ 4: เปลี่ยนพฤติกรรมเฉพาะตอน API ช้าผิดปกติ (>15s): เดิมรอไม่มีกำหนด ใหม่ fail ให้กดใหม่

---

## Validation

**สถานะ: รอ deploy**

ทำแล้ว:
- [x] `pnpm build` ผ่าน ไม่มี error/warning ใหม่
- [x] Root cause ยืนยันด้วยการวัดจริงบน production (ตาราง encode time ด้านบน)

ต้องทำหลัง deploy:
1. [ ] Railway metrics 1 สัปดาห์ — RAM peak ควร < 600 MB, ไม่มี pattern ค้างสูง
2. [ ] Logs — ต้องไม่มี OOM restart ถี่ผิดปกติ (ถ้ามี → ขยับเป็น 640)
3. [ ] `curl /_next/image?...&w=1920` พร้อม `Accept: image/avif` → content-type
   ต้องเป็น `image/webp` และเร็ว (< 2s ทั้ง cache miss)
4. [ ] อาการ login/logout ช้า ควรหายไปพร้อม RAM spike

---

## Action items

- [ ] Deploy + verify ตาม Validation (owner: nattawut.dev)
- [ ] เช็ค Railway dashboard: API service + bucket (MinIO) เปิด App Sleeping ไหม —
  ถ้าเปิด พิจารณาปิดเพื่อตัด cold start (owner: nattawut.dev)
- [ ] (Backlog, P3) LINE avatar ใน reviews ใช้ URL จาก `profile.line-scdn.net` ซึ่ง
  หมดอายุได้ → 404 ซ้ำ ๆ ใน log — พิจารณาเก็บรูป avatar ลง bucket ตอน signup แทน
- [ ] (Backlog) อัปเดต `review_code_phase2/04-performanc_tuning/` ด้วย RC-11 นี้
  เมื่อได้รับอนุญาตแก้ไฟล์ audit (กฎโปรเจค: ห้ามแก้ review_code_phase2 เว้นแต่สั่ง)

---

## Appendix: Cache ทุกชั้นฝั่ง ecommerce (สำรวจ 2026-06-11)

| ชั้น | อะไรถูก cache | อายุ | ที่อยู่ |
|---|---|---|---|
| ISR page cache | homepage 1h, history 1d, product detail 1h | ตาม `revalidate` | disk ของ container |
| Data cache (fetch) | CMS ทั้งหมด (`src/lib/cms.ts`, tag-based), products 1h, settings-proxy 5-60 นาที | ตาม `next.revalidate` | disk, Next จำกัด ~50 MB |
| On-demand revalidate | `/api/revalidate` ล้างตาม tag (`landing`, `products`, ...) — admin session หรือ `x-revalidate-secret` | ทันที | — |
| Image optimizer | รูป optimize แล้ว | **1 ปี (แก้ใหม่)** | `.next/cache/images` หายเมื่อ redeploy |
| Browser | `/_next/static/*` (hashed), `/images/*` | 1 ปี immutable | client |
| Cloudflare | HTML = DYNAMIC (ไม่ cache), static ตาม default | — | edge |
| ไม่ cache | auth ทุกอย่าง, proxy routes, verify-slip, contact, หน้า cart/checkout/profile/orders | — | — |
