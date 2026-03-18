'use client'

import { useLocale } from 'next-intl'
import dynamic from 'next/dynamic'
import { useReveal } from '@/hooks/useReveal'
import type { HistoryContent } from '@/lib/cms'

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false })

interface Props {
  content: HistoryContent
}

export default function AboutSection({ content }: Props) {
  const locale = useLocale()
  const { ref } = useReveal()

  const md = locale === 'th' ? content.th : content.en
  if (!md) return null

  return (
    <section
      id="about"
      data-section="true"
      className="relative bg-[#ECEDEA] py-20 lg:py-28 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div
          ref={ref}
          className="reveal bg-white p-8 sm:p-12 lg:p-14"
        >
          {/* Header — same style as Testimonials */}
          <div className="mb-16 lg:mb-24 pl-4 border-l-4 border-[var(--accent)]">
            <h2 className="font-prompt text-3xl font-thin leading-tight text-neutral-800 sm:text-4xl lg:text-5xl">
              {locale === 'th' ? 'เรื่องราวของ' : 'The Story of'} <br />
              <span className="text-[var(--accent)]">{locale === 'th' ? 'SOQ.' : 'SOQ.'}</span>
            </h2>
          </div>

          {/* Content */}
          <div className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-neutral-800 prose-headings:text-base prose-headings:mt-6 prose-headings:mb-2 prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:mt-0 prose-h1:mb-4 prose-p:text-neutral-500 prose-p:text-sm prose-p:sm:text-base prose-p:font-light prose-p:leading-relaxed prose-strong:text-neutral-800 prose-strong:font-semibold prose-em:text-neutral-600 prose-blockquote:border-l-[var(--accent)] prose-blockquote:bg-[#ECEDEA] prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:text-neutral-500 prose-blockquote:text-sm prose-blockquote:font-light prose-blockquote:not-italic prose-blockquote:mt-6">
            <ReactMarkdown>{md}</ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  )
}
