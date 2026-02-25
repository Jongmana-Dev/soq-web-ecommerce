'use client'

import { useState, useEffect } from 'react'
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

interface ProductModalProps {
  product: {
    id: string
    name_th: string
    name_en: string
    long_desc_th: string
    long_desc_en: string
    image: string
    sizes: ProductSize[]
  }
  onClose: () => void
  locale: string
}

export default function ProductModal({ product, onClose, locale }: ProductModalProps) {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0])
  const [quantity, setQuantity] = useState(1)
  const add = useCart((state) => state.add)
  const showToast = useCartToast((s) => s.show)

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

  const ACCORDION_ITEMS = [
    {
      title_th: 'วิธีใช้',
      title_en: 'How to use',
      content_th: '1. ผสมผลิตภัณฑ์ SOQ 30 มิลลิลิตร ต่อน้ำ 18 ลิตร\n2. นำผลิตภัณฑ์ SOQ ที่ผสมแล้วฆ่าเชื้ออุปกรณ์ โดยการแช่ เช็ด หรือฉีดพ่นให้ทั่วทั้งพื้นผิว\n3. เทผลิตภัณฑ์ SOQ ออก โดยไม่ต้องล้างน้ำ สะอาดฆ่าเชื้ออุปกรณ์ จะพร้อมใช้งานทันที',
      content_en: '1. Mix 30ml of SOQ product per 18 liters of water.\n2. Apply the mixed solution to equipment by soaking, wiping, or spraying thoroughly.\n3. Drain the solution. No rinsing needed. The equipment is sanitized and ready to use immediately.',
    },
    {
      title_th: 'การจัดส่ง',
      title_en: 'Shipping',
      content_th: 'จัดส่งฟรีทั่วประเทศเมื่อสั่งซื้อครบ 1,000 บาท',
      content_en: 'Free shipping nationwide on orders over 1,000 THB.',
    },
  ]

const AccordionItem = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-neutral-200 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center text-left font-medium text-neutral-900 hover:text-[var(--accent)] transition-colors"
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] grid place-items-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl bg-[#F5F5F7] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-2 text-neutral-400 hover:text-black transition-colors"
          >
            <i className="fa-solid fa-xmark text-2xl" />
          </button>

          {/* Left: Image Container */}
          <div className="lg:w-1/2 bg-[#EAEAEA] relative min-h-[400px] lg:min-h-full flex items-center justify-center p-12">
            <div className="relative w-full h-full max-w-md aspect-[3/4]">
              <Image
                src={product.image}
                alt={locale === 'th' ? product.name_th : product.name_en}
                fill
                sizes="(max-width: 768px) 80vw, 40vw"
                className="object-contain drop-shadow-2xl mix-blend-multiply"
              />
              {/* Decorative Elements on Image */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full text-center pointer-events-none opacity-10">
                 <span className="text-9xl font-bold font-sans tracking-tighter">SOQ</span>
              </div>
            </div>
          </div>


          {/* Right: Details Container */}
          <div className="lg:w-1/2 bg-[#F5F5F7] p-8 lg:p-12 overflow-y-auto overscroll-contain custom-scrollbar">
            
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-5xl font-light text-neutral-800 leading-tight mb-2">
                {locale === 'th' ? product.name_th : product.name_en}
              </h2>
              
              {/* Size selector */}
              {product.sizes.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {product.sizes.map((size) => (
                    <button
                      key={size.volume}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm border transition-colors ${
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
            <div className="mb-8">
               <span className="text-3xl font-bold text-neutral-900">
                 {selectedSize.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} {locale === 'th' ? 'บาท' : 'THB'}
               </span>
            </div>

            {/* Description */}
            <p className="text-neutral-500 leading-relaxed mb-8 font-light">
              {locale === 'th' ? product.long_desc_th : product.long_desc_en}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 mb-10 pb-10 border-b border-neutral-200">
               {/* Quantity */}
               <div className="flex items-center bg-white border border-neutral-300 h-12">
                  <button onClick={() => handleQuantityChange('decrease')} className="w-10 h-full text-neutral-700 hover:bg-neutral-100 transition-colors">
                    <i className="fa-solid fa-minus text-xs" />
                  </button>
                  <span className="w-10 text-center font-bold text-neutral-900">{quantity}</span>
                  <button onClick={() => handleQuantityChange('increase')} className="w-10 h-full text-neutral-700 hover:bg-neutral-100 transition-colors">
                    <i className="fa-solid fa-plus text-xs" />
                  </button>
               </div>

               {/* Go to Cart */}
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
                  className="h-12 px-8 bg-neutral-900 font-bold text-white hover:bg-neutral-800 transition-all shadow-md flex-1"
               >
                  <i className="fa-solid fa-cart-shopping mr-2" />
                  {locale === 'th' ? 'ไปที่รถเข็น' : 'Go to Cart'}
               </button>
            </div>

            {/* Accordions */}
            <div className="space-y-4 mb-10">
              {ACCORDION_ITEMS.map((item, index) => (
                <AccordionItem
                   key={index}
                   title={locale === 'th' ? item.title_th : item.title_en}
                >
                  <div className="text-neutral-500 text-sm leading-relaxed whitespace-pre-line pl-4 border-l-2 border-[var(--accent)]/30">
                    {locale === 'th' ? item.content_th : item.content_en}
                  </div>
                </AccordionItem>
              ))}

              {/* Ask More */}
              <AccordionItem title={locale === 'th' ? 'สอบถามเพิ่มเติม' : 'Ask Us'}>
                <div className="flex flex-col gap-3 pl-4 border-l-2 border-[var(--accent)]/30">
                  <p className="text-neutral-500 text-sm mb-1">
                    {locale === 'th' ? 'แชทกับเราได้เลย' : 'Chat with us'}
                  </p>
                  <a
                    href="https://m.me/soqthailand"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 border border-neutral-200 text-neutral-700 hover:border-[#1877F2] hover:text-[#1877F2] transition-all text-sm"
                  >
                    <i className="fa-brands fa-facebook-messenger text-lg w-5 text-center" />
                    <span className="font-medium">{locale === 'th' ? 'แชท Facebook' : 'Chat Facebook'}</span>
                    <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-xs opacity-40" />
                  </a>
                  <a
                    href="https://line.me/R/ti/p/@soq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 border border-neutral-200 text-neutral-700 hover:border-[#06C755] hover:text-[#06C755] transition-all text-sm"
                  >
                    <i className="fa-brands fa-line text-lg w-5 text-center" />
                    <span className="font-medium">{locale === 'th' ? 'แชท LINE OA' : 'Chat LINE OA'}</span>
                    <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-xs opacity-40" />
                  </a>
                </div>
              </AccordionItem>
            </div>

            {/* Footer Socials */}
            <div className="flex items-center gap-6">
               <span className="font-semibold text-sm">{locale === 'th' ? 'ติดตามเราได้ที่' : 'Follow Us'}</span>
               <div className="flex gap-4 text-neutral-400">
                  <a href="https://facebook.com/soqthailand" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-facebook hover:text-[#1877F2] transition-colors cursor-pointer text-lg" />
                  </a>
                  <a href="https://line.me/R/ti/p/@soq" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-line hover:text-[#06C755] transition-colors cursor-pointer text-lg" />
                  </a>
               </div>
            </div>

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}