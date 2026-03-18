'use client'

import { useLocale } from 'next-intl'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useReveal } from '@/hooks/useReveal'
import type { HistoryContent } from '@/lib/cms'

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false })

interface Props {
  content: HistoryContent
  images?: string[]
}

export default function AboutSection({ content, images = [] }: Props) {
  const locale = useLocale()
  const { ref } = useReveal()
  const [activeIndex, setActiveIndex] = useState(0)

  const md = locale === 'th' ? content.th : content.en
  if (!md) return null

  const hasImages = images.length > 0

  return (
    <section
      id="about"
      data-section="true"
      className="relative bg-[#ECEDEA] py-20 lg:py-28 overflow-hidden"
    >
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${hasImages ? 'max-w-6xl' : 'max-w-4xl'}`}>
        <div
          ref={ref}
          className={`reveal bg-white p-8 sm:p-12 lg:p-14 ${hasImages ? 'lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start' : ''}`}
        >
          {/* Left column: heading + content */}
          <div>
            {/* Header — same style as Testimonials */}
            <div className="mb-16 lg:mb-24 pl-4 border-l-4 border-[var(--accent)]">
              <h2 className="font-prompt text-3xl font-extralight leading-tight text-neutral-800 sm:text-4xl lg:text-5xl">
                {locale === 'th' ? 'เรื่องราวของ' : 'The Story of'} <br />
                <span className="text-[var(--accent)]">{locale === 'th' ? 'SOQ.' : 'SOQ.'}</span>
              </h2>
            </div>

            {/* Content */}
            <div className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-neutral-800 prose-headings:text-base prose-headings:mt-6 prose-headings:mb-2 prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:mt-0 prose-h1:mb-4 prose-p:text-neutral-500 prose-p:text-sm prose-p:sm:text-base prose-p:font-light prose-p:leading-relaxed prose-strong:text-neutral-800 prose-strong:font-semibold prose-em:text-neutral-600 prose-blockquote:border-l-[var(--accent)] prose-blockquote:bg-[#ECEDEA] prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:text-neutral-500 prose-blockquote:text-sm prose-blockquote:font-light prose-blockquote:not-italic prose-blockquote:mt-6">
              <ReactMarkdown>{md}</ReactMarkdown>
            </div>
          </div>

          {/* Right column: images (desktop only — stacked above on mobile) */}
          {hasImages && (
            <ImageRotator images={images} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
          )}
        </div>
      </div>
    </section>
  )
}

// Separated so useEffect can run without violating Rules of Hooks in the early-return above
function ImageRotator({
  images,
  activeIndex,
  setActiveIndex,
}: {
  images: string[]
  activeIndex: number
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>
}) {
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((prev: number) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [images.length, setActiveIndex])

  return (
    <div className="mt-10 lg:mt-0 order-first lg:order-last">
      {/* Image container with fixed aspect ratio */}
      <div className="relative w-[75%] mx-auto aspect-[3/4] max-h-[70vh] overflow-hidden bg-[#ECEDEA]">
        {images.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
            aria-hidden={i !== activeIndex}
          >
            <Image
              src={src}
              alt={`About SOQ image ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators — only shown when there are multiple images */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Image navigation">
          {images.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Image ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-6 bg-[var(--accent)]'
                  : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
