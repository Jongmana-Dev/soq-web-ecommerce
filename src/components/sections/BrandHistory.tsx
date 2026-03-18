'use client'

import { useLocale } from 'next-intl'
import Image from 'next/image'
import { useReveal } from '@/hooks/useReveal'
import type { BrandHistory } from '@/lib/cms'

interface Props {
  items: BrandHistory[]
}

export default function BrandHistorySection({ items }: Props) {
  const locale = useLocale()
  const { ref } = useReveal()

  if (items.length === 0) return null

  return (
    <section
      id="brand-history"
      data-section="true"
      ref={ref}
      className="reveal relative bg-[#ECEDEA] py-20 lg:py-32 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-poppins font-extralight text-neutral-800">
            {locale === 'th' ? 'เรื่องราวของ' : 'Our'}{' '}
            <span className="font-semibold text-[var(--accent)]">
              {locale === 'th' ? 'แบรนด์' : 'Story'}
            </span>
          </h2>
          <p className="mt-16 lg:mt-20 text-black text-lg max-w-2xl mx-auto font-light">
            {locale === 'th'
              ? 'เส้นทางการพัฒนาผลิตภัณฑ์ SOQ จากจุดเริ่มต้นสู่มาตรฐานระดับสากล'
              : 'The journey of SOQ from inception to international standards'}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neutral-200 to-transparent hidden lg:block" />

          <div className="space-y-12 lg:space-y-0">
            {items.map((item, index) => {
              const isLeft = index % 2 === 0

              return (
                <div
                  key={item.id}
                  className={`reveal reveal-delay-${Math.min(index + 1, 6)} relative lg:flex lg:items-center lg:gap-12 ${
                    isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } lg:mb-16`}
                >
                  {/* Content side */}
                  <div className={`lg:w-1/2 ${isLeft ? 'lg:text-right lg:pr-12' : 'lg:pl-12'}`}>
                    <div
                      className={`inline-flex items-center gap-2 mb-3 ${
                        isLeft ? 'lg:flex-row-reverse' : ''
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl font-black text-[var(--accent)]">
                        {item.year}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-neutral-800 mb-3">
                      {locale === 'th' ? item.title_th : item.title_en}
                    </h3>
                    <p className="text-neutral-500 leading-relaxed font-light">
                      {locale === 'th' ? item.description_th : item.description_en}
                    </p>
                  </div>

                  {/* Center dot */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--accent)] border-4 border-white shadow-sm z-10" />

                  {/* Image side */}
                  <div className="lg:w-1/2 mt-6 lg:mt-0">
                    {item.image ? (
                      <div
                        className={`relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-lg ${
                          isLeft ? 'lg:ml-12' : 'lg:mr-12'
                        }`}
                      >
                        <Image
                          src={item.image}
                          alt={locale === 'th' ? item.title_th : item.title_en}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-full aspect-[16/10] rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center ${
                          isLeft ? 'lg:ml-12' : 'lg:mr-12'
                        }`}
                      >
                        <span className="text-4xl sm:text-6xl font-black text-neutral-200">{item.year}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
