'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from '@/i18n/navigation'
import { useCart } from '@/lib/store'
import { useCartToast } from '@/lib/cart-toast'


interface ProductSize {
  id: string
  label_th: string
  label_en: string
  volume: string
  price: number
}

interface UsageStepData {
  title_th: string
  title_en: string
  description_th: string
  description_en: string
}

interface ProductImageData {
  url: string
  alt_th?: string | null
  alt_en?: string | null
}

interface ProductModalProps {
  product: {
    id: string
    name_th: string
    name_en: string
    long_desc_th: string
    long_desc_en: string
    image: string
    images?: ProductImageData[]
    sizes: ProductSize[]
  }
  onClose: () => void
  locale: string
  usageSteps?: UsageStepData[]
}

function AccordionItem({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-neutral-200 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center text-left font-light text-neutral-900 hover:text-[var(--accent)] transition-colors"
      >
        <span>{title}</span>
        <i className={`fa-solid fa-circle-plus transition-transform ${isOpen ? 'rotate-45' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EmailButton({ email, locale }: { email: string; locale: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSend = () => {
    setSending(true)
    const subject = encodeURIComponent(locale === 'th' ? 'สอบถามสินค้า SOQ' : 'SOQ Product Inquiry')
    const body = encodeURIComponent(
      `${locale === 'th' ? 'ชื่อ' : 'Name'}: ${form.name}\n${locale === 'th' ? 'อีเมล' : 'Email'}: ${form.email}\n\n${form.message}`
    )
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self')
    setSending(false)
    setOpen(false)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={email}
        className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 hover:bg-neutral-900/5 transition-all"
      >
        <i className="fa-solid fa-envelope text-base" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] grid place-items-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-light text-neutral-900">
                  {locale === 'th' ? 'ส่งอีเมลถึงเรา' : 'Send us an email'}
                </h3>
                <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-black">
                  <i className="fa-solid fa-xmark text-lg" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={locale === 'th' ? 'ชื่อของคุณ' : 'Your name'}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <input
                  type="email"
                  placeholder={locale === 'th' ? 'อีเมลของคุณ' : 'Your email'}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <textarea
                  placeholder={locale === 'th' ? 'ข้อความ' : 'Message'}
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-200 bg-neutral-50 focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!form.name || !form.message || sending}
                  className="w-full py-3 bg-[var(--accent)] text-neutral-900 font-normal text-sm hover:brightness-110 transition-all disabled:opacity-40"
                >
                  <i className="fa-solid fa-paper-plane mr-2" />
                  {locale === 'th' ? 'ส่งอีเมล' : 'Send Email'}
                </button>
              </div>

              <p className="mt-3 text-xs text-neutral-400 text-center font-light">
                {locale === 'th' ? 'หรือส่งตรงที่' : 'Or email directly at'} {email}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

interface ShippingRate {
  min_qty: number
  max_qty: number | null
  fee: number
  label: string | null
}

export default function ProductModal({ product, onClose, locale, usageSteps }: ProductModalProps) {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0])
  const [quantity, setQuantity] = useState(1)
  const [viewMode] = useState<'360' | 'gallery'>('gallery')
  const [imgIndex, setImgIndex] = useState(0)
  const [imgDirection, setImgDirection] = useState(0)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [fetchedSteps, setFetchedSteps] = useState<UsageStepData[]>([])
  const add = useCart((state) => state.add)
  const showToast = useCartToast((s) => s.show)

  // Fetch shipping rates + usage steps (if not provided via props)
  useEffect(() => {
    fetch('/api/settings-proxy/shipping')
      .then((res) => res.json())
      .then((data) => setShippingRates(data.rates ?? []))
      .catch(() => {})

    if (!usageSteps || usageSteps.length === 0) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      fetch(`${apiUrl}/api/cms/usage-steps`)
        .then((res) => res.json())
        .then((json) => setFetchedSteps(json.data ?? []))
        .catch(() => {})
    }
  }, [usageSteps])

  const resolvedSteps = (usageSteps && usageSteps.length > 0) ? usageSteps : fetchedSteps

  // Build all images list: main image + additional images
  const allImages: { url: string; alt: string }[] = [
    { url: product.image, alt: locale === 'th' ? product.name_th : product.name_en },
    ...(product.images ?? []).map((img) => ({
      url: img.url,
      alt: (locale === 'th' ? img.alt_th : img.alt_en) ?? (locale === 'th' ? product.name_th : product.name_en),
    })),
  ]

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    setQuantity((prev) => {
      if (type === 'increase') return prev + 1
      if (type === 'decrease' && prev > 1) return prev - 1
      return prev
    })
  }

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Stop Lenis smooth scroll + native scroll
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    // Scroll modal overlay to top
    overlayRef.current?.scrollTo(0, 0)
    // Scroll window to ensure modal is visible
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  // Build accordion items from API data
  const ACCORDION_ITEMS: { title_th: string; title_en: string; content_th: string; content_en: string; defaultOpen?: boolean }[] = []

  if (resolvedSteps && resolvedSteps.length > 0) {
    ACCORDION_ITEMS.push({
      title_th: 'วิธีใช้',
      title_en: 'How to use',
      content_th: resolvedSteps.map((s, i) => `${i + 1}. ${s.description_th}`).join('\n'),
      content_en: resolvedSteps.map((s, i) => `${i + 1}. ${s.description_en}`).join('\n'),
      defaultOpen: true,
    })
  }

  // Shipping info from master data
  if (shippingRates.length > 0) {
    const lines = shippingRates.map((r) => {
      const label = r.label || (r.max_qty ? `${r.min_qty}-${r.max_qty}` : `${r.min_qty}+`)
      const fee = r.fee === 0
        ? (locale === 'th' ? 'ส่งฟรี' : 'Free')
        : `${r.fee.toLocaleString()} ${locale === 'th' ? 'บาท' : 'THB'}`
      return `• ${label} — ${fee}`
    })
    ACCORDION_ITEMS.push({
      title_th: 'การจัดส่ง',
      title_en: 'Shipping',
      content_th: lines.join('\n'),
      content_en: lines.join('\n'),
      defaultOpen: false,
    })
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={overlayRef}
        className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl bg-[#F5F5F7] overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[100dvh] sm:h-auto sm:max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-black hover:bg-black/5 rounded-full transition-colors"
          >
            <i className="fa-solid fa-xmark text-2xl" />
          </button>

          {/* Left: Image / 360 */}
          <div className="lg:w-1/2 relative h-[35vh] sm:h-[40vh] lg:h-auto shrink-0" style={{ backgroundColor: '#ECEDEA' }}>
            {viewMode === '360' ? (
              <BottleInteractive />
            ) : (
              <div className="absolute inset-0">
                <AnimatePresence initial={false} custom={imgDirection} mode="wait">
                  <motion.div
                    key={imgIndex}
                    custom={imgDirection}
                    variants={{
                      enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (d: number) => ({ x: d < 0 ? 80 : -80, opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={allImages[imgIndex].url}
                      alt={allImages[imgIndex].alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Slide arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => { setImgDirection(-1); setImgIndex((p) => (p - 1 + allImages.length) % allImages.length) }}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white shadow-sm text-neutral-600 hover:text-black transition-all rounded-full"
                    >
                      <i className="fa-solid fa-chevron-left text-sm" />
                    </button>
                    <button
                      onClick={() => { setImgDirection(1); setImgIndex((p) => (p + 1) % allImages.length) }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white shadow-sm text-neutral-600 hover:text-black transition-all rounded-full"
                    >
                      <i className="fa-solid fa-chevron-right text-sm" />
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setImgDirection(i > imgIndex ? 1 : -1); setImgIndex(i) }}
                        className={`h-2 rounded-full transition-all ${i === imgIndex ? 'bg-neutral-800 w-5' : 'bg-neutral-400/50 w-2 hover:bg-neutral-400'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right: Details Container */}
          <div className="lg:w-1/2 flex-1 bg-[#F5F5F7] p-5 sm:p-8 lg:p-12 overflow-y-auto overscroll-contain custom-scrollbar">
            
            {/* Header — 2 lines: yellow + black */}
            <div className="mb-5 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light leading-tight mb-2">
                <span className="text-[var(--accent)] block">SOQ.</span>
                <span className="text-neutral-900">{locale === 'th' ? product.name_th : product.name_en}</span>
              </h2>
              
              {/* Size selector */}
              {product.sizes.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {product.sizes.map((size) => (
                    <button
                      key={size.volume}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 text-sm border transition-colors min-h-[44px] ${
                        selectedSize.volume === size.volume
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-neutral-900 font-medium'
                          : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                      }`}
                    >
                      {locale === 'th' ? size.label_th : size.label_en}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="mb-5 sm:mb-8">
               <span className="text-xl sm:text-2xl font-normal text-neutral-900">
                 {selectedSize.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} {locale === 'th' ? 'บาท' : 'THB'}
               </span>
            </div>

            {/* Description */}
            <p className="text-neutral-800 leading-relaxed mb-5 sm:mb-8 font-light">
              {locale === 'th' ? product.long_desc_th : product.long_desc_en}
            </p>

            {/* Actions */}
            <div className="mb-6 sm:mb-10 pb-6 sm:pb-10 border-b border-neutral-200 space-y-3">
               {/* Quantity + Add to Cart */}
               <div className="flex items-center gap-3">
                 <div className="flex items-center bg-white border border-neutral-300 h-12">
                    <button onClick={() => handleQuantityChange('decrease')} className="w-11 h-full text-neutral-700 hover:bg-neutral-100 transition-colors">
                      <i className="fa-solid fa-minus text-xs" />
                    </button>
                    <span className="w-10 text-center font-bold text-neutral-900">{quantity}</span>
                    <button onClick={() => handleQuantityChange('increase')} className="w-11 h-full text-neutral-700 hover:bg-neutral-100 transition-colors">
                      <i className="fa-solid fa-plus text-xs" />
                    </button>
                 </div>

                 {/* Add to Cart */}
                 <button
                    onClick={() => {
                      const item = {
                        id: `${product.id}::${selectedSize.id}`,
                        product_id: product.id,
                        size_id: selectedSize.id,
                        size_label: locale === 'th' ? selectedSize.label_th : selectedSize.label_en,
                        name: locale === 'th' ? product.name_th : product.name_en,
                        price: selectedSize.price,
                        qty: quantity,
                        image: product.image,
                      }
                      add(item)
                      showToast(item)
                    }}
                    className="h-12 px-4 sm:px-8 bg-neutral-900 font-normal text-white hover:bg-neutral-800 transition-all flex-1 min-w-0"
                 >
                    <i className="fa-solid fa-cart-plus mr-2" />
                    {locale === 'th' ? 'เพิ่มลงตะกร้า' : 'Add to Cart'}
                 </button>
               </div>

               {/* Buy Now */}
               <button
                  onClick={() => {
                    const item = {
                      id: `${product.id}::${selectedSize.id}`,
                      product_id: product.id,
                      size_id: selectedSize.id,
                      size_label: locale === 'th' ? selectedSize.label_th : selectedSize.label_en,
                      name: locale === 'th' ? product.name_th : product.name_en,
                      price: selectedSize.price,
                      qty: quantity,
                      image: product.image,
                    }
                    add(item)
                    onClose()
                    router.push('/cart')
                  }}
                  className="w-full h-12 bg-[var(--accent)] font-normal text-neutral-900 hover:brightness-110 transition-all"
               >
                  {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
               </button>
            </div>

            {/* Accordions */}
            <div className="space-y-4 mb-10">
              {ACCORDION_ITEMS.map((item, index) => (
                <AccordionItem
                   key={`${item.title_en}-${index}`}
                   title={locale === 'th' ? item.title_th : item.title_en}
                   defaultOpen={item.defaultOpen}
                >
                  <div className="text-neutral-800 text-sm leading-relaxed whitespace-pre-line pl-4 border-l-2 border-[var(--accent)]/30 font-light">
                    {locale === 'th' ? item.content_th : item.content_en}
                  </div>
                </AccordionItem>
              ))}

            </div>

            {/* Contact channels */}
            <div className="mb-10">
              <p className="text-neutral-400 text-sm mb-3 font-light">
                {locale === 'th' ? 'สอบถามเพิ่มเติม' : 'Contact Us'}
              </p>
              <div className="flex items-center gap-3">
                {process.env.NEXT_PUBLIC_LINE_ID && (
                  <a
                    href={`https://line.me/R/ti/p/${process.env.NEXT_PUBLIC_LINE_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LINE"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-[#06C755] hover:text-[#06C755] hover:bg-[#06C755]/5 transition-all"
                  >
                    <i className="fa-brands fa-line text-lg" />
                  </a>
                )}
                {process.env.NEXT_PUBLIC_FACEBOOK_CHAT_URL && (
                  <a
                    href={process.env.NEXT_PUBLIC_FACEBOOK_CHAT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook Messenger"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-[#1877F2]/5 transition-all"
                  >
                    <i className="fa-brands fa-facebook-messenger text-lg" />
                  </a>
                )}
                {process.env.NEXT_PUBLIC_PHONE && (
                  <a
                    href={`tel:${process.env.NEXT_PUBLIC_PHONE}`}
                    title={process.env.NEXT_PUBLIC_PHONE}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 hover:bg-neutral-900/5 transition-all"
                  >
                    <i className="fa-solid fa-phone text-base" />
                  </a>
                )}
                {process.env.NEXT_PUBLIC_EMAIL && (
                  <EmailButton email={process.env.NEXT_PUBLIC_EMAIL} locale={locale} />
                )}
              </div>
            </div>


          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

const FRAME_COUNT = 61
const FRAME_URLS = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/hero-section/v3/frame-${String(i + 1).padStart(4, '0')}.webp`,
)

function BottleInteractive() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const frameRef = useRef(30) // start at middle frame
  const loadedRef = useRef(0)
  const [ready, setReady] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  const draw = useCallback((frame: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = imagesRef.current[frame]
    if (!img) return

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const scale = (canvas.height / img.height) * 1.15
    const w = img.width * scale
    const h = img.height * scale
    const x = (canvas.width - w) / 2
    const y = (canvas.height - h) / 2
    ctx.drawImage(img, x, y, w, h)
  }, [])

  useEffect(() => {
    const images: HTMLImageElement[] = []
    FRAME_URLS.forEach((url, i) => {
      const img = new window.Image()
      img.src = url
      img.onload = () => {
        loadedRef.current++
        if (loadedRef.current >= 10 && !ready) {
          setReady(true)
          draw(frameRef.current)
        }
      }
      images[i] = img
    })
    imagesRef.current = images
  }, [draw, ready])

  const updateFromPosition = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    setMousePos({ x, y })
    const frame = Math.floor(x * (FRAME_COUNT - 1))
    frameRef.current = Math.max(0, Math.min(FRAME_COUNT - 1, frame))
    draw(frameRef.current)
  }, [draw])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    updateFromPosition(e.clientX, e.clientY)
  }, [updateFromPosition])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (touch) updateFromPosition(touch.clientX, touch.clientY)
  }, [updateFromPosition])

  const offsetX = (mousePos.x - 0.5) * 6
  const offsetY = (mousePos.y - 0.5) * 4

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="absolute inset-0 cursor-crosshair overflow-hidden touch-none"
    >
      {/* Bottle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          transition: 'transform 0.15s ease-out',
        }}
      />
    </div>
  )
}