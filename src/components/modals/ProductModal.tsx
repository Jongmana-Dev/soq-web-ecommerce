'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// =========================================================================
// 1. Interfaces (ควรจะตรงกับใน ProductShowcase.tsx)
// =========================================================================
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

// =========================================================================
// 2. Component หลัก ProductModal
// =========================================================================
export default function ProductModal({ product, onClose, locale }: ProductModalProps) {
  // ตั้งค่า selectedSize เริ่มต้นเป็นขนาดแรกของสินค้า
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0])
  const [quantity, setQuantity] = useState(1) // ปริมาณเริ่มต้น
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // handleSizeChange ตอนนี้จะถูกเรียกเมื่อคลิกปุ่มขนาด
  const handleSizeChange = (size: ProductSize) => {
    setSelectedSize(size)
  }

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    setQuantity((prev) => {
      if (type === 'increase') return prev + 1
      if (type === 'decrease' && prev > 1) return prev - 1
      return prev
    })
  }

  const handleAddToCart = () => {
    alert(
      `${quantity} x ${selectedSize[locale === 'th' ? 'label_th' : 'label_en']} ${
        product[locale === 'th' ? 'name_th' : 'name_en']
      } added to cart! Total: ฿${(selectedSize.price * quantity).toLocaleString()}`
    )
    onClose()
  }

  const handleImageNav = (direction: 'prev' | 'next') => {
    setCurrentImageIndex((prevIndex) => {
      if (direction === 'next') {
        return (prevIndex + 1) % product.galleryImages.length
      } else {
        return (prevIndex - 1 + product.galleryImages.length) % product.galleryImages.length
      }
    })
  }

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // ProductNameHtml: Star San ให้เป็นสีเหลือง
  const productNameHtml = useMemo(() => {
    const name = locale === 'th' ? product.name_th : product.name_en
    return name.replace('Star San', `<span style="color:var(--accent)">Star San</span>`)
  }, [product.name_th, product.name_en, locale])

  // คำนวณราคารวม
  const totalPrice = useMemo(() => {
    return (selectedSize.price * quantity).toLocaleString(locale === 'th' ? 'th-TH' : 'en-US')
  }, [selectedSize.price, quantity, locale])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-white dark:bg-chrome-2 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-line dark:border-line-strong"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white z-20 transition"
            aria-label="Close product modal"
          >
            <i className="fa-solid fa-xmark fa-xl"></i>
          </button>

          {/* Left Side: Product Gallery */}
          <div className="relative md:w-1/2 w-full bg-muted dark:bg-chrome-1 p-6 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-80 md:h-[420px] flex items-center justify-center"
              >
                <Image
                  src={product.galleryImages[currentImageIndex]}
                  alt={product.name_en}
                  fill
                  className="object-contain rounded-lg"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Thumbnail Navigation */}
            {product.galleryImages.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto justify-center">
                {product.galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-16 h-16 relative rounded-md overflow-hidden border-2 transition-colors ${
                      i === currentImageIndex
                        ? 'border-accent shadow-md'
                        : 'border-transparent hover:border-accent/60'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={img} alt={`thumb-${i}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Navigation Arrows */}
            {product.galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => handleImageNav('prev')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-chrome-3/70 rounded-full p-2 shadow hover:bg-white dark:hover:bg-chrome-3"
                  aria-label="Previous image"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button
                  onClick={() => handleImageNav('next')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-chrome-3/70 rounded-full p-2 shadow hover:bg-white dark:hover:bg-chrome-3"
                  aria-label="Next image"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </>
            )}
          </div>

          {/* Right Side: Product Details & Actions */}
          <div className="flex flex-col justify-between md:w-1/2 w-full p-8">
            <div className="overflow-y-auto pr-1">
              <h2
                className="font-prompt text-3xl font-semibold text-text dark:text-chrome-text mb-3 leading-snug"
                dangerouslySetInnerHTML={{ __html: productNameHtml }}
              />
              <p className="font-prompt text-gray-500 dark:text-gray-400 mb-1">
                {locale === 'th' ? 'ราคาต่อหน่วย' : 'Price per unit'}
              </p>
              <p className="font-poppins text-4xl font-bold text-accent mb-6">
                ฿{selectedSize.price.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US')}
              </p>

              {/* Select size: Radio-like Buttons - สีเหลืองเมื่อเลือก */}
              <div className="mb-6">
                <p className="font-prompt text-sm text-gray-700 dark:text-chrome-text mb-2">
                  {locale === 'th' ? 'เลือกขนาด' : 'Select Size'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size.volume}
                      onClick={() => handleSizeChange(size)}
                      className={`
                        flex flex-col items-center justify-center p-3 border 
                        transition-all duration-200
                        rounded-md
                        ${
                          selectedSize.volume === size.volume
                            // เมื่อเลือก: พื้นหลังเหลือง, ข้อความดำ, border เหลือง
                            ? 'border-accent bg-accent text-black font-semibold shadow-sm'
                            // เมื่อไม่ได้เลือก: พื้นหลังขาว, ข้อความดำ, border เทา
                            : 'border-gray-300 bg-white text-black hover:border-gray-400'
                        }
                      `}
                      aria-label={`${locale === 'th' ? 'เลือกขนาด' : 'Select size'} ${locale === 'th' ? size.label_th : size.label_en}`}
                    >
                      <span className="font-prompt text-lg">
                        {locale === 'th' ? size.label_th : size.label_en}
                      </span>
                      <span className="font-poppins text-sm text-gray-500">
                        ฿{size.price.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Description */}
              <div className="prose prose-sm dark:prose-invert font-prompt text-gray-700 dark:text-chrome-text leading-relaxed">
                <p>{locale === 'th' ? product.long_desc_th : product.long_desc_en}</p>
              </div>
            </div>

            {/* Quantity + Add to cart */}
            <div className="mt-8 pt-6 border-t border-line dark:border-line-strong flex items-center gap-4">
              {/* Quantity Control */}
              <div className="flex items-center border border-line dark:border-line-strong rounded-md">
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  className="h-12 w-12 text-text dark:text-chrome-text transition-colors hover:bg-surface-2 dark:hover:bg-chrome-3 disabled:opacity-50"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <i className="fa-solid fa-minus"></i>
                </button>
                {/* แก้สีของ Quantity text ให้เป็นสีดำ */}
                <span className="h-12 w-12 flex items-center justify-center font-poppins font-semibold text-black dark:text-chrome-text">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange('increase')}
                  className="h-12 w-12 text-text dark:text-chrome-text transition-colors hover:bg-surface-2 dark:hover:bg-chrome-3"
                  aria-label="Increase quantity"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>

              {/* ปุ่ม "ซื้อเลย" สีเหลือง, ข้อความดำ */}
              <button
                onClick={handleAddToCart}
                // bg-accent คือสีเหลืองของเรา
                // text-black คือสีดำของข้อความ
                className="flex-1 h-12 bg-accent hover:bg-accent/90 text-black font-semibold rounded-md shadow-md transition-all duration-200 active:scale-95"
                aria-label={locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
              >
                {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'} | ฿{totalPrice}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}