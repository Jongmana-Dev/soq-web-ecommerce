'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from '@/i18n/navigation'
import { useCart } from '@/lib/store'
import { useCartToast } from '@/lib/cart-toast'
import dynamic from 'next/dynamic'
const ContactModal = dynamic(() => import('@/components/modals/ContactModal'))


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

function EmailContactButton({ locale }: { locale: string }) {
  const [showContact, setShowContact] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowContact(true)}
        title={locale === 'th' ? 'ส่งอีเมล' : 'Send email'}
        className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 hover:bg-neutral-900/5 transition-all"
      >
        <i className="fa-solid fa-envelope text-base" />
      </button>
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
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
  const [imgIndex, setImgIndex] = useState(0)
  const [imgDirection, setImgDirection] = useState(0)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [fetchedSteps, setFetchedSteps] = useState<UsageStepData[]>([])
  const [dataReady, setDataReady] = useState(false)
  const [dataError, setDataError] = useState(false)
  const add = useCart((state) => state.add)
  const showToast = useCartToast((s) => s.show)

  // Fetch shipping rates + usage steps (if not provided via props)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Shipping rates
        const shippingRes = await fetch('/api/settings-proxy/shipping')
        if (!shippingRes.ok) throw new Error(`Shipping API error: ${shippingRes.status}`)
        const shippingData = await shippingRes.json()
        setShippingRates(shippingData.rates ?? [])

        // Usage steps (if not provided via props)
        if (!usageSteps || usageSteps.length === 0) {
          const stepsRes = await fetch('/api/settings-proxy/usage-steps')
          if (!stepsRes.ok) throw new Error(`Usage steps API error: ${stepsRes.status}`)
          const stepsData = await stepsRes.json()
          setFetchedSteps(stepsData.data ?? [])
        }

        setDataReady(true)
      } catch (err) {
        console.error('ProductModal data load failed:', err)
        setDataError(true)
        // Still show modal but with available data
        setDataReady(true)
      }
    }
    loadData()
  }, [usageSteps])

  const resolvedSteps = (usageSteps && usageSteps.length > 0) ? usageSteps : fetchedSteps

  // Build images list from API, fallback to main image if empty
  const apiImages = (product.images ?? []).map((img) => ({
    url: img.url,
    alt: (locale === 'th' ? img.alt_th : img.alt_en) ?? (locale === 'th' ? product.name_th : product.name_en),
  }))
  const allImages = apiImages.length > 0
    ? apiImages
    : [{ url: product.image, alt: locale === 'th' ? product.name_th : product.name_en }]

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    setQuantity((prev) => {
      if (type === 'increase') return prev + 1
      if (type === 'decrease' && prev > 1) return prev - 1
      return prev
    })
  }

  // EC-12: use a ref so the event listener is registered only once,
  // regardless of whether the parent re-creates the onClose callback identity
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, []) // empty deps — stable via ref

  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    overlayRef.current?.scrollTo(0, 0)
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

  // Show loading overlay until data is ready
  if (!dataReady) {
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white p-8 flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {dataError ? (
            <>
              <i className="fa-solid fa-circle-exclamation text-2xl text-red-500" />
              <span className="text-sm text-neutral-700">{locale === 'th' ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load data'}</span>
              <button
                onClick={() => { setDataError(false); setDataReady(false); }}
                className="mt-2 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                {locale === 'th' ? 'ลองใหม่' : 'Retry'}
              </button>
            </>
          ) : (
            <>
              <span className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-neutral-500 font-light">{locale === 'th' ? 'กำลังโหลด...' : 'Loading...'}</span>
            </>
          )}
        </div>
      </div>,
      document.body
    )
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

          {/* Left: Image Gallery */}
          <div className="lg:w-1/2 relative h-[35vh] sm:h-[40vh] lg:h-auto shrink-0" style={{ backgroundColor: '#ECEDEA' }}>
            {(
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
                    className="h-12 px-4 sm:px-8 bg-neutral-800 font-normal text-white hover:bg-neutral-800 transition-all flex-1 min-w-0"
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
                <EmailContactButton locale={locale} />
              </div>
            </div>


          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

// 360° BottleInteractive removed — using gallery mode only