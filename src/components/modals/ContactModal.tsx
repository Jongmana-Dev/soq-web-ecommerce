'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { useContactInfo } from '@/providers/ContactInfoProvider'
import type { ContactInfo } from '@/lib/cms'

type ContactModalProps = {
  onClose: () => void
  contactInfo?: ContactInfo
}

const contactSchema = z.object({
  name: z.string().min(2, 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร').max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').max(254, 'อีเมลยาวเกินไป'),
  phone: z.string().max(20, 'เบอร์โทรยาวเกินไป').regex(/^[0-9\-+() ]*$/, 'รูปแบบเบอร์โทรไม่ถูกต้อง').optional().or(z.literal('')),
  subject: z.string().min(2, 'กรุณากรอกหัวข้ออย่างน้อย 2 ตัวอักษร').max(200, 'หัวข้อต้องไม่เกิน 200 ตัวอักษร'),
  message: z.string().min(10, 'กรุณากรอกข้อความอย่างน้อย 10 ตัวอักษร').max(2000, 'ข้อความต้องไม่เกิน 2,000 ตัวอักษร'),
})

type ContactForm = z.infer<typeof contactSchema>

type View = 'channels' | 'form'

export default function ContactModal({ onClose, contactInfo: contactInfoProp }: ContactModalProps) {
  const locale = useLocale()
  const contextInfo = useContactInfo()
  const ci = contactInfoProp ?? contextInfo
  const FACEBOOK_CHAT_URL = ci.facebook_chat_url
  const LINE_URL = ci.line_url
  const PHONE = ci.phone
  const [view, setView] = useState<View>('channels')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const isDirty = useMemo(
    () => view === 'form' && !submitted && (form.name !== '' || form.email !== '' || form.subject !== '' || form.message !== ''),
    [view, submitted, form.name, form.email, form.subject, form.message],
  )
  useUnsavedChanges(isDirty)

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Close on Escape
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [handleEsc])

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = contactSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ContactForm
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    setServerError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitted(true)
      } else {
        setServerError(data.error || (locale === 'th' ? 'ส่งข้อความไม่สำเร็จ' : 'Failed to send message'))
      }
    } catch {
      setServerError(locale === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const channels = [
    ...(FACEBOOK_CHAT_URL
      ? [{
          key: 'facebook',
          icon: 'fa-brands fa-facebook-f',
          label: 'Facebook Messenger',
          color: 'hover:border-[#1877F2] hover:text-[#1877F2]',
          href: FACEBOOK_CHAT_URL,
        }]
      : []),
    ...(LINE_URL
      ? [{
          key: 'line',
          icon: 'fa-brands fa-line',
          label: 'LINE Official',
          color: 'hover:border-[#06C755] hover:text-[#06C755]',
          href: LINE_URL,
        }]
      : []),
    ...(PHONE
      ? [{
          key: 'phone',
          icon: 'fa-solid fa-phone',
          label: PHONE,
          color: 'hover:border-emerald-500 hover:text-emerald-500',
          href: `tel:${PHONE.replace(/-/g, '')}`,
        }]
      : []),
    {
      key: 'email',
      icon: 'fa-solid fa-envelope',
      label: locale === 'th' ? 'ส่งอีเมล' : 'Send Email',
      color: 'hover:border-[var(--accent)] hover:text-[var(--accent)]',
      onClick: () => setView('form'),
    },
  ]

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              {view === 'form' && (
                <button
                  onClick={() => setView('channels')}
                  className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900"
                >
                  <i className="fa-solid fa-arrow-left" />
                </button>
              )}
              <h2 className="text-lg font-semibold text-neutral-900">
                {locale === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6">
            <AnimatePresence mode="wait">
              {view === 'channels' && (
                <motion.div
                  key="channels"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-neutral-500 mb-6">
                    {locale === 'th'
                      ? 'เลือกช่องทางที่สะดวกสำหรับคุณ'
                      : 'Choose your preferred channel'}
                  </p>

                  <div className="space-y-3">
                    {channels.map((ch) => {
                      if (ch.onClick) {
                        return (
                          <button
                            key={ch.key}
                            onClick={ch.onClick}
                            className={`w-full flex items-center gap-4 px-5 py-4 border border-neutral-200 text-neutral-600 transition-all ${ch.color}`}
                          >
                            <i className={`${ch.icon} text-xl w-6 text-center`} />
                            <span className="font-medium">{ch.label}</span>
                            <i className="fa-solid fa-arrow-right ml-auto text-sm opacity-40" />
                          </button>
                        )
                      }
                      if (!ch.href) return null
                      return (
                        <a
                          key={ch.key}
                          href={ch.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-4 px-5 py-4 border border-neutral-200 text-neutral-600 transition-all ${ch.color}`}
                        >
                          <i className={`${ch.icon} text-xl w-6 text-center`} />
                          <span className="font-medium">{ch.label}</span>
                          <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-sm opacity-40" />
                        </a>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {view === 'form' && !submitted && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {locale === 'th' ? 'ชื่อ' : 'Name'} *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      maxLength={100}
                      className={`w-full px-4 py-2.5 border text-base text-neutral-900 outline-none focus:border-neutral-900 transition-colors ${errors.name ? 'border-red-400' : 'border-neutral-200'}`}
                      placeholder={locale === 'th' ? 'กรอกชื่อ' : 'Your name'}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {locale === 'th' ? 'อีเมล' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full px-4 py-2.5 border text-base text-neutral-900 outline-none focus:border-neutral-900 transition-colors ${errors.email ? 'border-red-400' : 'border-neutral-200'}`}
                      placeholder={locale === 'th' ? 'อีเมล' : 'Email'}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {locale === 'th' ? 'เบอร์โทร' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-4 py-2.5 border border-neutral-200 text-base text-neutral-900 outline-none focus:border-neutral-900 transition-colors"
                      placeholder={locale === 'th' ? 'เบอร์โทร (ไม่บังคับ)' : 'Phone (optional)'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {locale === 'th' ? 'หัวข้อ' : 'Subject'} *
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      maxLength={200}
                      className={`w-full px-4 py-2.5 border text-base text-neutral-900 outline-none focus:border-neutral-900 transition-colors ${errors.subject ? 'border-red-400' : 'border-neutral-200'}`}
                      placeholder={locale === 'th' ? 'หัวข้อ' : 'Subject'}
                    />
                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {locale === 'th' ? 'ข้อความ' : 'Message'} *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value.slice(0, 2000))}
                      rows={4}
                      maxLength={2000}
                      className={`w-full px-4 py-2.5 border text-base text-neutral-900 outline-none focus:border-neutral-900 transition-colors resize-none ${errors.message ? 'border-red-400' : 'border-neutral-200'}`}
                      placeholder={locale === 'th' ? 'รายละเอียด (อย่างน้อย 10 ตัวอักษร)' : 'Details (at least 10 characters)'}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.message ? <p className="text-xs text-red-500">{errors.message}</p> : <span />}
                      <span className={`text-xs ${form.message.length > 1800 ? 'text-amber-500' : 'text-neutral-400'}`}>
                        {form.message.length}/2,000
                      </span>
                    </div>
                  </div>

                  {serverError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                      {serverError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <i className="fa-solid fa-spinner fa-spin" />
                    ) : locale === 'th' ? (
                      'ส่งข้อความ'
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </motion.form>
              )}

              {view === 'form' && submitted && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-emerald-50 text-emerald-500 rounded-full">
                    <i className="fa-solid fa-check text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {locale === 'th' ? 'ส่งสำเร็จ!' : 'Sent Successfully!'}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-6">
                    {locale === 'th'
                      ? 'เราจะติดต่อกลับโดยเร็วที่สุด'
                      : 'We will get back to you as soon as possible.'}
                  </p>
                  <button
                    onClick={onClose}
                    className="px-8 py-2.5 bg-neutral-900 text-white text-sm font-medium hover:bg-black transition-colors"
                  >
                    {locale === 'th' ? 'ปิด' : 'Close'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
