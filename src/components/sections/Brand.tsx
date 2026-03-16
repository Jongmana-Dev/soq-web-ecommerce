import { useTranslations } from 'next-intl'
import { Link as I18nLink } from '@/i18n/navigation'

const BRANDS = [
  { name: 'Martha', style: 'font-serif font-bold tracking-tighter' },
  { name: 'Krom', style: 'font-sans font-black uppercase tracking-widest' },
  { name: 'Psycho', style: 'font-mono font-bold lowercase italic' },
  { name: 'Clantry', style: 'font-serif font-medium uppercase tracking-widest text-xs' },
  { name: 'Psycho', style: 'font-mono font-bold lowercase italic' }, // Repeated for effect as in image
  { name: 'Krom', style: 'font-sans font-black uppercase tracking-widest' },
  { name: 'Martha', style: 'font-serif font-bold tracking-tighter' },
  { name: 'Andechs', style: 'font-serif font-bold uppercase tracking-wide' },
  { name: 'Wild', style: 'font-cursive font-bold -rotate-12' },
  { name: 'Andechs', style: 'font-serif font-bold uppercase tracking-wide' },
  { name: 'Martha', style: 'font-serif font-bold tracking-tighter' },
]

export function Brand() {
  const t = useTranslations('brand')
  
  return (
    <section className="w-full bg-[#ECEDEA] py-10 overflow-hidden border-b border-white/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-12 opacity-80">
          {BRANDS.map((brand, i) => (
            <span 
              key={i} 
              className={`text-2xl md:text-3xl text-neutral-800 hover:text-black transition-colors cursor-default ${brand.style}`}
            >
              {brand.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}