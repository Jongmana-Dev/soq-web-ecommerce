'use client'

import ReactMarkdown from 'react-markdown'
import type { HistoryContent } from '@/lib/cms'

interface Props {
  content: HistoryContent
  locale: string
}

export default function HistoryContentSection({ content, locale }: Props) {
  const md = locale === 'th' ? content.th : content.en

  if (!md) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-20">
          <p className="text-neutral-400 text-lg">
            {locale === 'th' ? 'ยังไม่มีเนื้อหา' : 'No content available'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <article className="prose prose-neutral prose-lg max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h1:text-center prose-h1:mb-8 prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-xl prose-p:leading-relaxed prose-p:text-neutral-600 prose-li:text-neutral-600 prose-li:leading-relaxed prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg prose-blockquote:border-[var(--accent)] prose-blockquote:text-neutral-500 prose-strong:text-neutral-800">
          <ReactMarkdown>{md}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
