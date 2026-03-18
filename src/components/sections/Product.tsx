'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { useReveal } from '@/hooks/useReveal'
import ProductModal from '@/components/modals/ProductModal'
import type { ProductData } from '@/lib/products'
import type { UsageStep } from '@/lib/cms'

interface Props {
  products: ProductData[]
  usageSteps: UsageStep[]
}

export default function ProductShowcase({ products, usageSteps }: Props) {
  const locale = useLocale()
  const [modalProduct, setModalProduct] = useState<ProductData | null>(null)
  const { ref } = useReveal()

  const firstProduct = products[0]
  if (!firstProduct) return null

  return (
    <section
      id="products"
      data-section="true"
      ref={ref}
      className="reveal relative bg-[#ECEDEA] py-20 lg:py-28 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── TOP ROW: Title (left) + Products grid (left) ─── */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">

          {/* LEFT: Title + Product Grid + Desc + CTA */}
          <div className="lg:w-[32%] flex-shrink-0">
            {/* Title */}
            <h3 className="text-[var(--accent)] font-prompt font-extralight text-4xl sm:text-5xl lg:text-[3.5rem] mb-1 tracking-tighter">
              SOQ.
            </h3>
            <h2 className="text-neutral-800 font-extralight text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.05] mb-8 tracking-wide uppercase">
              SAFE FOR SIP
            </h2>

            {/* Description + CTA */}
            <p className="text-black text-sm sm:text-base leading-relaxed mb-6 font-light mt-16 lg:mt-20">
              {locale === 'th' ? firstProduct.short_desc_th : firstProduct.short_desc_en}
            </p>
            <button
              onClick={() => setModalProduct(firstProduct)}
              className="bg-[var(--accent)] text-neutral-900 px-10 py-3.5 font-normal text-sm shadow-lg shadow-[var(--accent)]/20 hover:scale-105 active:scale-95 transition-transform"
            >
              {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
            </button>
          </div>

          {/* ─── RIGHT: Usage Steps Cards ─── */}
          {usageSteps.length > 0 && (
            <div className="reveal reveal-delay-2 lg:w-[68%] w-full">
 

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {usageSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`reveal reveal-delay-${Math.min(index + 3, 6)} group bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300`}
                  >
                    {/* Step image */}
                    {step.image && (
                      <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden">
                        <Image
                          src={step.image}
                          alt={locale === 'th' ? step.title_th : step.title_en}
                          fill
                          sizes="(max-width: 640px) 100vw, 280px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    {/* Step content */}
                    <div className="p-5 flex items-start gap-3">
                      <span className="text-4xl font-extralight text-[var(--accent)] tabular-nums leading-none shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-neutral-800 leading-relaxed font-light pt-1">
                        {locale === 'th' ? step.description_th : step.description_en}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal */}
      {modalProduct && (
        <ProductModal
          product={{
            id: modalProduct.id,
            name_th: modalProduct.name_th,
            name_en: modalProduct.name_en,
            long_desc_th: modalProduct.long_desc_th ?? modalProduct.short_desc_th,
            long_desc_en: modalProduct.long_desc_en ?? modalProduct.short_desc_en,
            image: modalProduct.image,
            images: modalProduct.images,
            sizes: modalProduct.sizes,
          }}
          onClose={() => setModalProduct(null)}
          locale={locale}
          usageSteps={usageSteps}
        />
      )}
    </section>
  )
}
