'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'


interface ProductSize {
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
    galleryImages: string[]
    sizes: ProductSize[]
  }
  onClose: () => void
  locale: string
}

export default function ProductModal({ product, onClose, locale }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0])
  const [quantity, setQuantity] = useState(1)

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
    {
      title_th: 'ติดต่อ',
      title_en: 'Contact',
      content_th: 'ต้องการความช่วยเหลือ? ติดต่อเราได้ที่ contact@soq.co.th',
      content_en: 'Need help? Contact us at contact@soq.co.th',
    },
  ]

const AccordionItem = ({ title, content }: { title: string; content: string }) => {
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
            <div className="mt-4 text-neutral-500 text-sm leading-relaxed whitespace-pre-line pl-4 border-l-2 border-[var(--accent)]/30">
              {content}
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
                src={product.galleryImages[0]}
                alt="Product Image"
                fill
                className="object-contain drop-shadow-2xl mix-blend-multiply"
              />
              {/* Decorative Elements on Image */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full text-center pointer-events-none opacity-10">
                 <span className="text-9xl font-bold font-sans tracking-tighter">SOQ</span>
              </div>
            </div>
            
            {/* Thumbnails (Static for visual) */}
            <div className="absolute bottom-8 right-8 w-24 aspect-[3/4] bg-white shadow-lg border-2 border-white overflow-hidden hidden lg:block">
               <Image 
                 src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2670&auto=format&fit=crop"
                 alt="Thumbnail"
                 fill
                 className="object-cover"
               />
            </div>
          </div>


          {/* Right: Details Container */}
          <div className="lg:w-1/2 bg-[#F5F5F7] p-8 lg:p-12 overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-5xl font-light text-neutral-800 leading-tight mb-2">
                <span className="text-[var(--accent)] font-medium">Star San</span> <br/>
                Sanitizer
              </h2>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex text-[var(--accent)] text-sm">
                  {[1,2,3,4,5].map(i => <i key={i} className="fa-solid fa-star" />)}
                </div>
                <span className="text-sm font-semibold text-neutral-800 ml-1">288 reviews</span>
              </div>
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
               <div className="flex items-center bg-white border border-neutral-200 h-12">
                  <button onClick={() => handleQuantityChange('decrease')} className="w-10 h-full hover:bg-neutral-50 transition-colors">
                    <i className="fa-solid fa-minus text-xs" />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button onClick={() => handleQuantityChange('increase')} className="w-10 h-full hover:bg-neutral-50 transition-colors">
                    <i className="fa-solid fa-plus text-xs" />
                  </button>
               </div>

               {/* Add to Cart */}
               <button className="h-12 px-6 border border-neutral-300 font-medium hover:border-black transition-colors bg-white">
                  {locale === 'th' ? 'เพิ่มลงตะกร้า' : 'Add to Cart'}
               </button>

               {/* Buy Now */}
               <button className="h-12 px-8 bg-[var(--accent)] font-bold text-neutral-900 hover:bg-[#F3C85B]/90 transition-colors shadow-sm flex-1">
                  {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
               </button>
            </div>

            {/* Accordions */}
            <div className="space-y-4 mb-10">
              {ACCORDION_ITEMS.map((item, index) => (
                <AccordionItem 
                   key={index} 
                   title={locale === 'th' ? item.title_th : item.title_en}
                   content={locale === 'th' ? item.content_th : item.content_en}
                />
              ))}
            </div>

            {/* Footer Socials */}
            <div className="flex items-center gap-6">
               <span className="font-semibold text-sm">{locale === 'th' ? 'ติดต่อต่อ' : 'Contact'}</span>
               <div className="flex gap-4 text-neutral-400">
                  <i className="fa-brands fa-facebook hover:text-black transition-colors cursor-pointer text-lg" />
                  <i className="fa-brands fa-line hover:text-black transition-colors cursor-pointer text-lg" />
                  <i className="fa-brands fa-twitter hover:text-black transition-colors cursor-pointer text-lg" />
                  <i className="fa-solid fa-arrow-up-right-from-square hover:text-black transition-colors cursor-pointer text-lg" />
               </div>
            </div>

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}