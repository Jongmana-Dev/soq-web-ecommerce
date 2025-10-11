'use client'
import * as React from 'react'

type AccordionProps = React.HTMLAttributes<HTMLDivElement> & { type: 'single'; collapsible?: boolean }
export function Accordion({ className, children }: AccordionProps) {
  return <div className={className}>{children}</div>
}

export function AccordionItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <div data-accordion-item={value} className="border-b">{children}</div>
}

export function AccordionTrigger({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <button
      type="button"
      onClick={() => setOpen(o => !o)}
      className="w-full py-4 text-left flex justify-between items-center"
      aria-expanded={open}
    >
      <span>{children}</span>
      <span className="ml-4">{open ? '−' : '+'}</span>
    </button>
  )
}

export function AccordionContent({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState(0)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const btn = el.previousElementSibling as HTMLButtonElement | null
    const h = () => {
      const expanded = btn?.getAttribute('aria-expanded') === 'true'
      setOpen(Boolean(expanded))
      setHeight(expanded ? el.scrollHeight : 0)
    }
    h()
    btn?.addEventListener('click', h)
    return () => btn?.removeEventListener('click', h)
  }, [])

  return (
    <div
      ref={ref}
      className="overflow-hidden transition-all"
      style={{ height, opacity: open ? 1 : 0.7 }}
    >
      <div className="pb-4 opacity-80">{children}</div>
    </div>
  )
}
