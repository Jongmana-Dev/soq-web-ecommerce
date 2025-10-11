'use client'
import React from 'react' // ให้ไฟล์เป็นโมดูลแน่ ๆ สำหรับ TS/isolatedModules

const data = [
  { name: 'คุณพิม', role: 'แบรนด์เครื่องประดับ', quote: 'หน้าเดียว แต่ขายได้จริง สวยแบบมีรสนิยม!' },
  { name: 'คุณปาล์ม', role: 'D2C skincare', quote: 'เร็วมาก SEO ดี และเพิ่มยอดโดยไม่ต้องยิง ads หนัก' },
  { name: 'คุณเจ', role: 'แฟชั่นไลฟ์สไตล์', quote: 'ทีม dev บอกดูแลง่าย ขยาย section ได้เอง' }
]

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-6 md:grid-cols-3">
        {data.map((t) => (
          <figure
            key={t.name}
            className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow"
          >
            <blockquote className="text-lg italic">“{t.quote}”</blockquote>
            <figcaption className="mt-3 text-sm text-muted-foreground">
              — {t.name}, {t.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}