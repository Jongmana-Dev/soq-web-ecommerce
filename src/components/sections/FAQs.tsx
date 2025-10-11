'use client'

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

export default function FAQs() {
  return (
    <section id="standards" data-section="true" className="container py-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="1">
            <AccordionTrigger>รองรับ SEO ดีไหม?</AccordionTrigger>
            <AccordionContent>ดีมาก ใช้ Next.js App Router + metadata ครบ</AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger>แก้สี/ฟอนต์เองได้แค่ไหน?</AccordionTrigger>
            <AccordionContent>แก้ได้ผ่าน OKLCH variables ใน globals.css และ @theme inline</AccordionContent>
          </AccordionItem>
          <AccordionItem value="3">
            <AccordionTrigger>ใช้ Tailwind อะไร?</AccordionTrigger>
            <AccordionContent>Tailwind v4 + shadcn/ui ที่คอนฟิกไว้แล้ว</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}