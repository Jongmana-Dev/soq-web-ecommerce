'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

const heroImages = [
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1600&auto=format&fit=crop'
]

export default function Hero(){
  const t = useTranslations()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start','end start'] })
  const y1 = useTransform(scrollYProgress, [0,1], [0,-60])
  const y2 = useTransform(scrollYProgress, [0,1], [0,-120])

  return (
    <section ref={ref} className="relative overflow-hidden pb-24 pt-24">
      <div className="container relative z-10">
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-background/60 px-4 py-2 text-sm backdrop-blur">
          <span className="rounded-full bg-[--color-gold]/15 px-2 py-0.5 text-xs text-[--color-gold]">New</span>
          <span className="text-muted-foreground">{t('hero.kicker')}</span>
        </div>

        <motion.h1 initial={{opacity:0, x:-60, letterSpacing:'0.3em'}} animate={{opacity:1, x:0, letterSpacing:'0em'}} transition={{duration:1.1, ease:'easeOut'}}
          className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          {t('hero.h1_1')} <span className="gold-text">{t('hero.h1_2_lux')}</span> {t('hero.h1_3_smooth')}
        </motion.h1>

        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t('hero.p')}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button variant="gold" className="btn-glint" asChild><a href="#products">{t('hero.cta.viewProducts')}</a></Button>
          <Button variant="outline" asChild><a href="#contact">{t('hero.cta.getQuote')}</a></Button>
        </div>
      </div>

      {/* Parallax gallery */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[20%] w-[1400px] -translate-x-1/2 opacity-80">
        <motion.div style={{ y: y1 }} className="grid grid-cols-3 gap-4">
          {heroImages.map((src, i) => (
            <motion.img key={i} src={src} alt="hero" className="h-56 w-full rounded-xl object-cover md:h-72"
              initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: i*0.08}}/>
          ))}
        </motion.div>
      </div>
      <motion.div style={{ y: y2 }} className="absolute -bottom-16 right-10 h-48 w-48 rounded-full bg-[--color-gold]/20 blur-3xl" />
    </section>
  )
}
