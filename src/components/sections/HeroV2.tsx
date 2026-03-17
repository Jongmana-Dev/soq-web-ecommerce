'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ProductModal from '@/components/modals/ProductModal'
import type { ProductData } from '@/lib/products'

interface Props {
  products: ProductData[]
}

export default function HeroV2({ products }: Props) {
  const locale = useLocale()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const product = products[0]

  return (
    <div style={{ backgroundColor: '#ECEDEA' }}>
      <section
        id="hero"
        data-section="true"
        className="relative min-h-[85vh] w-full overflow-hidden pt-[76px]"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative min-h-[calc(85vh-76px)]">
          {/* Background image constrained to container */}
          <Image
            src="/hero-section/v2/hero.webp"
            alt="SOQ. Safe for Sip"
            fill
            sizes="(max-width: 1440px) 100vw, 1440px"
            className="object-cover object-[center_30%]"
            priority
          />

          <div className="relative z-10 flex min-h-[calc(85vh-76px)] items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl text-center lg:text-left"
          >
            <div className="space-y-2 sm:space-y-3">
              <h1 className="font-prompt text-4xl font-light leading-tight sm:text-6xl lg:text-8xl xl:text-9xl text-[var(--accent)] tracking-tighter drop-shadow-lg">
                SOQ.
              </h1>
              <h2 className="font-prompt text-2xl font-light leading-tight text-white sm:text-3xl lg:text-5xl xl:text-6xl uppercase tracking-wide drop-shadow-md">
                SAFE FOR SIP
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 lg:mt-6 max-w-md mx-auto lg:mx-0 font-poppins text-xs leading-relaxed text-white/80 sm:text-sm lg:text-base drop-shadow"
            >
              {locale === 'th'
                ? 'ผลิตภัณฑ์สำหรับฆ่าเชื้อแบคทีเรียโดยไม่ต้องล้างน้ำออก'
                : 'No-rinse antibacterial product'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 lg:mt-8"
            >
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="group relative inline-flex h-12 lg:h-14 items-center justify-center overflow-hidden bg-[var(--accent)] px-8 lg:px-12 font-prompt text-base lg:text-lg font-bold text-black shadow-xl shadow-black/5"
              >
                <span className="relative z-10">
                  {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
          </div>
        </div>

        {isModalOpen && product && (
          <ProductModal
            product={{
              id: product.id,
              name_th: product.name_th,
              name_en: product.name_en,
              long_desc_th: product.long_desc_th ?? product.short_desc_th,
              long_desc_en: product.long_desc_en ?? product.short_desc_en,
              image: product.image,
              images: product.images,
              sizes: product.sizes,
            }}
            onClose={() => setIsModalOpen(false)}
            locale={locale}
          />
        )}
      </section>
    </div>
  )
}
