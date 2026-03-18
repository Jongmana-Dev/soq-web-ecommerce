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
        className="relative w-full overflow-hidden pt-[40px]"
      >
        {/* Mobile: image on top + text below */}
        <div className="lg:hidden">
          <div className="relative w-full h-[50vh]">
            <Image
              src="/hero-section/v2/hero.webp"
              alt="SOQ. Safe for Sip"
              fill
              sizes="100vw"
              className="object-cover object-[center_30%]"
              priority
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="px-6 py-8 text-center"
          >
            <div className="space-y-2">
              <h1 className="font-prompt text-3xl font-thin leading-tight text-[var(--accent)] tracking-wide">
                SOQ.
              </h1>
              <h2 className="font-prompt text-3xl font-thin leading-tight text-black uppercase tracking-wide">
                SAFE FOR SIP
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-md mx-auto font-poppins text-sm leading-relaxed text-black font-light"
            >
              {locale === 'th'
                ? 'ผลิตภัณฑ์สำหรับฆ่าเชื้อแบคทีเรียโดยไม่ต้องล้างน้ำออก'
                : 'No-rinse antibacterial product'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6"
            >
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="group relative inline-flex h-10 items-center justify-center overflow-hidden bg-[var(--accent)] px-8 font-prompt text-sm font-normal text-black shadow-xl shadow-black/5"
              >
                <span className="relative z-10">
                  {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Desktop: original layout with background image */}
        <div className="hidden lg:block">
        <div className="container mx-auto px-8 relative min-h-[calc(85vh-76px)]">
          <Image
            src="/hero-section/v2/hero.webp"
            alt="SOQ. Safe for Sip"
            fill
            sizes="1440px"
            className="object-cover object-[center_30%]"
          />

          <div className="relative z-10 flex min-h-[calc(85vh-76px)] items-start pt-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl text-left"
          >
            <div className="space-y-3">
              <h1 className="font-prompt text-5xl font-thin leading-tight xl:text-6xl text-[var(--accent)] tracking-wide drop-shadow-lg">
                SOQ.
              </h1>
              <h2 className="font-prompt text-5xl font-thin leading-tight text-black xl:text-6xl uppercase tracking-wide drop-shadow-md">
                SAFE FOR SIP
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-24 max-w-md font-poppins text-base leading-relaxed text-black font-light"
            >
              {locale === 'th'
                ? 'ผลิตภัณฑ์สำหรับฆ่าเชื้อแบคทีเรียโดยไม่ต้องล้างน้ำออก'
                : 'No-rinse antibacterial product'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10"
            >
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden bg-[var(--accent)] px-12 font-prompt text-sm font-normal text-black shadow-xl shadow-black/5"
              >
                <span className="relative z-10">
                  {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
          </div>
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
