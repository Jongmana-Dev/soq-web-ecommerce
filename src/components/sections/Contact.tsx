'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Reveal } from '@/components/motion/Reveal'

type ContactPayload = {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export default function ContactSection() {
  const [status, setStatus] = useState<string>('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    // แข็งแรง ชัดเจน ไม่ใช้ any
    const payload: ContactPayload = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      phone: fd.get('phone') ? String(fd.get('phone')) : undefined,
      subject: String(fd.get('subject') || ''),
      message: String(fd.get('message') || '')
    }

    setStatus('')
    const res = await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const j = await res.json()
    setStatus(j.ok ? 'ส่งสำเร็จ' : 'ผิดพลาด')
    if (j.ok) form.reset()
  }

  return (
    <section id="standards" data-section="true" className="container py-24">
      <div className="container">
        <Reveal>
          <h2 className="text-2xl font-semibold">ติดต่อเรา</h2>
        </Reveal>
        <Reveal y={20} delay={0.1}>
          <form
            onSubmit={onSubmit}
            className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/60 p-6 backdrop-blur md:grid-cols-2"
          >
            <div>
              <Label htmlFor="name">ชื่อ</Label>
              <Input name="name" id="name" required />
            </div>
            <div>
              <Label htmlFor="email">อีเมล</Label>
              <Input name="email" id="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="phone">โทร</Label>
              <Input name="phone" id="phone" />
            </div>
            <div>
              <Label htmlFor="subject">เรื่อง</Label>
              <Input name="subject" id="subject" required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="message">ข้อความ</Label>
              <textarea
                id="message"
                name="message"
                className="mt-2 h-28 w-full rounded-md border border-border bg-transparent p-3 text-sm outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button className="btn-glint rounded-full bg-[--color-gold] px-6 py-2 text-black">
                ส่งข้อความ
              </button>
              <span className="ml-3 text-sm text-muted-foreground">{status}</span>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
