'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import ProductModal from '@/components/modals/ProductModal'
import type { ProductData } from '@/lib/products'
import { Float, HoverLift, useParallax } from '@/components/motion'

const FEATURES = [
  {
    id: 'feature-1',
    number: '01',
    title_th: 'ผสมผลิตภัณฑ์',
    title_en: 'Simple Mix',
    description_th: 'ผสมผลิตภัณฑ์ SOQ 30 มิลลิลิตร ต่อน้ำ 18 ลิตร',
    description_en: 'Mix 30ml of SOQ product per 18 liters of water.',
    image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 'feature-2',
    number: '02',
    title_th: 'นำไปใช้งาน',
    title_en: 'Easy Application',
    description_th: 'นำผลิตภัณฑ์ที่ผสมแล้วฆ่าเชื้ออุปกรณ์ โดยการแช่ เช็ด หรือฉีดพ่นให้ทั่วพื้นผิว',
    description_en: 'Apply solution to equipment by soaking, wiping, or spraying surfaces.',
    image: 'https://images.unsplash.com/photo-1615631648086-325cd3d0006d?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 'feature-3',
    number: '03',
    title_th: 'พร้อมใช้งาน',
    title_en: 'Ready to Use',
    description_th: 'เทผลิตภัณฑ์ออก โดยไม่ต้องล้างน้ำ สะอาดฆ่าเชื้ออุปกรณ์ จะพร้อมใช้งานทันที',
    description_en: 'Drain the solution. No rinsing needed. Equipment is sanitized and ready.',
    image: 'https://images.unsplash.com/photo-1585751918361-b1e6cb747304?q=80&w=2670&auto=format&fit=crop',
  },
]

interface Props {
  products: ProductData[]
}

export default function ProductShowcase({ products }: Props) {
  const locale = useLocale()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  // Parallax for left/right columns
  const { ref: leftRef, y: leftY } = useParallax({ speed: 0.04 })
  const { ref: rightRef, y: rightY } = useParallax({ speed: -0.03 })

  // Use first product from API (Star San 330ml)
  const product = products[0]

  if (!product) return null

  return (
    <section
      id="products"
      data-section="true"
      ref={ref}
      className="relative bg-[#F5F5F7] py-20 lg:py-32 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col lg:flex-row gap-10 sm:gap-16 lg:gap-24 items-start">

          {/* Left Column: Intro */}
          <motion.div
            ref={leftRef}
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: leftY }}
            className="lg:w-1/3 pt-10"
          >
             <h3 className="text-[var(--accent)] font-medium text-2xl sm:text-3xl lg:text-4xl mb-2">
               {locale === 'th' ? product.name_th : product.name_en}
             </h3>
             <h2 className="text-neutral-800 font-light text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-8">
               Sanitizer <br/>
               <span className="font-medium">Premium</span>
             </h2>

             <p className="text-neutral-500 text-lg leading-relaxed mb-10 max-w-md font-light">
               {locale === 'th' ? product.short_desc_th : product.short_desc_en}
             </p>

             <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[var(--accent)] text-neutral-900 px-10 py-4 font-semibold text-lg shadow-lg shadow-[var(--accent)]/20"
             >
                {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
             </motion.button>
          </motion.div>

          {/* Right Column: 3-Step Features */}
          <motion.div
            ref={rightRef}
            style={{ y: rightY }}
            className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
             {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 60, scale: 0.97 }}
                  animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.1 + (index * 0.12), ease: [0.16, 1, 0.3, 1] }}
                  className="group relative"
                >
                   <HoverLift lift={-6} scale={1.015}>
                   {/* Card */}
                   <div className="bg-white overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col border border-gray-100">
                      {/* Image Area */}
                      <div className="relative h-64 bg-gray-100 overflow-hidden">
                         <div className="absolute inset-0 bg-gray-200 animate-pulse group-hover:hidden" />
                         <Image
                           src={feature.image}
                           alt={feature.title_en}
                           fill
                           sizes="(max-width: 768px) 100vw, 33vw"
                           className="object-cover transition-transform duration-700 group-hover:scale-110"
                         />
                         <Float amplitude={3} duration={4} delay={index * 0.8} className="absolute top-4 left-4 z-10">
                           <div className="text-6xl font-black text-white/80 drop-shadow-md">
                             {feature.number}
                           </div>
                         </Float>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                         <h4 className="text-lg font-bold text-neutral-800 mb-3">
                           {locale === 'th' ? feature.title_th : feature.title_en}
                         </h4>
                         <p className="text-sm text-neutral-500 leading-relaxed">
                           {locale === 'th' ? feature.description_th : feature.description_en}
                         </p>
                      </div>
                   </div>
                   </HoverLift>
                </motion.div>
             ))}
          </motion.div>

        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <ProductModal
          product={{
            id: product.id,
            name_th: product.name_th,
            name_en: product.name_en,
            long_desc_th: product.long_desc_th ?? product.short_desc_th,
            long_desc_en: product.long_desc_en ?? product.short_desc_en,
            image: product.image,
            sizes: product.sizes,
          }}
          onClose={() => setIsModalOpen(false)}
          locale={locale}
        />
      )}
    </section>
  )
}
