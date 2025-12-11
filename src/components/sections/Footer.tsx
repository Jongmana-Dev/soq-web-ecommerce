'use client'

import { useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function Footer() {
  const locale = useLocale()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const footerLinks = {
    products: {
      title: locale === 'th' ? 'สินค้า' : 'Products',
      links: [
        { label: 'Star San 330ml', href: '#products' },
        { label: 'Star San 1L', href: '#products' },
        { label: 'Star San 20L', href: '#products' },
      ],
    },
    company: {
      title: locale === 'th' ? 'บริษัท' : 'Company',
      links: [
        { label: locale === 'th' ? 'เกี่ยวกับเรา' : 'About Us', href: '#' },
        { label: locale === 'th' ? 'มาตรฐานโรงงาน' : 'Factory Standards', href: '#industrial-standards' },
        { label: locale === 'th' ? 'รีวิวลูกค้า' : 'Reviews', href: '#testimonials' },
      ],
    },
    support: {
      title: locale === 'th' ? 'ช่วยเหลือ' : 'Support',
      links: [
        { label: locale === 'th' ? 'คำถามที่พบบ่อย' : 'FAQs', href: '#faq' },
        { label: locale === 'th' ? 'การจัดส่ง' : 'Shipping', href: '#faq' },
        { label: locale === 'th' ? 'นโยบายคืนสินค้า' : 'Returns', href: '#faq' },
      ],
    },
  }

  const socialLinks = [
    { icon: 'fa-brands fa-line', href: '#', label: 'Line' },
    { icon: 'fa-brands fa-facebook-f', href: '#', label: 'Facebook' },
    { icon: 'fa-solid fa-envelope', href: 'mailto:contact@soq.co.th', label: 'Email' },
  ]

  return (
    <footer
      id="footer"
      ref={ref}
      className="relative bg-[#1A1A1A] text-white pt-24 pb-12 z-10"
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* 1. Left: Large Logo (Spans 4 cols) */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={inView ? { opacity: 1 } : {}}
             transition={{ duration: 0.6 }}
             className="lg:col-span-5 flex flex-col justify-between"
          >
             <div className="flex-1 flex items-center justify-center lg:justify-start py-10 lg:py-0">
                {/* Logo SVG Representation */}
                <div className="relative">
                   <h1 className="text-[8rem] lg:text-[10rem] leading-none font-bold tracking-tighter text-white/90">
                     SOQ.
                   </h1>
                   {/* Decorative lines/circles could go here to match the graphic exactly if we had the SVG, using text for now as requested */}
                </div>
             </div>
             
             <div className="mt-8 text-neutral-500 text-sm hidden lg:block">
               © {new Date().getFullYear()} — Copyright
             </div>
          </motion.div>

          {/* 2. Center: Links (Spans 4 cols) */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={inView ? { opacity: 1, y: 0 } : {}}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="lg:col-span-4 grid grid-cols-2 gap-8 lg:pl-12"
          >
             {/* Col 1 */}
             <div className="space-y-10">
                <div>
                   <h4 className="text-neutral-500 text-sm mb-4 font-light">
                     ● {locale === 'th' ? 'สินค้า' : 'Product'}
                   </h4>
                   <ul className="space-y-2">
                     <li>
                       <Link href="#products" className="text-lg font-medium hover:text-[var(--accent)] transition-colors">Star San</Link>
                     </li>
                   </ul>
                </div>

                <div>
                   <h4 className="text-neutral-500 text-sm mb-4 font-light">
                     ● {locale === 'th' ? 'มาตรฐานโรงงาน' : 'Factory Standards'}
                   </h4>
                   <ul className="space-y-2">
                     <li><Link href="#" className="font-light hover:text-[var(--accent)] transition-colors">Factory Certification</Link></li>
                     <li><Link href="#" className="font-light hover:text-[var(--accent)] transition-colors">Manufacturing License</Link></li>
                     <li><Link href="#" className="font-light hover:text-[var(--accent)] transition-colors">Factory Accreditation</Link></li>
                     <li><Link href="#" className="font-light hover:text-[var(--accent)] transition-colors">Production Certification</Link></li>
                   </ul>
                </div>
                
                <div>
                   <h4 className="text-neutral-500 text-sm mb-4 font-light">
                     ● {locale === 'th' ? 'ติดต่อ' : 'Contact'}
                   </h4>
                   <ul className="space-y-2 font-medium">
                     <li>Line</li>
                     <li>Facebook</li>
                     <li>{locale === 'th' ? 'ที่อยู่' : 'Address'}</li>
                   </ul>
                </div>
             </div>

             {/* Col 2 */}
             <div className="space-y-10">
                <div>
                   <h4 className="text-neutral-500 text-sm mb-4 font-light">
                     ● {locale === 'th' ? 'รีวิว' : 'Reviews'}
                   </h4>
                   <ul className="space-y-2">
                     <li>
                       <Link href="#testimonials" className="font-light hover:text-[var(--accent)] transition-colors">
                         {locale === 'th' ? 'รีวิวจากลูกค้า' : 'Customer Reviews'}
                       </Link>
                     </li>
                   </ul>
                </div>

                <div>
                   <h4 className="text-neutral-500 text-sm mb-4 font-light">
                     ● {locale === 'th' ? 'คำถามที่พบบ่อย' : 'FAQs'}
                   </h4>
                   <ul className="space-y-2">
                     <li><Link href="#faq" className="font-light hover:text-[var(--accent)] transition-colors">{locale === 'th' ? 'สินค้าแตกต่าง...?': 'How differs?'}</Link></li>
                     <li><Link href="#faq" className="font-light hover:text-[var(--accent)] transition-colors">{locale === 'th' ? 'ผลิตที่ไหน?' : 'Where made?'}</Link></li>
                     <li><Link href="#faq" className="font-light hover:text-[var(--accent)] transition-colors">{locale === 'th' ? 'ส่งต่างประเทศ?' : 'Intl Shipping?'}</Link></li>
                     <li><Link href="#faq" className="font-light hover:text-[var(--accent)] transition-colors">{locale === 'th' ? 'นโยบายคืน?' : 'Return Policy'}</Link></li>
                   </ul>
                </div>
             </div>
          </motion.div>

          {/* 3. Right: QR & Social (Spans 3 cols) */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={inView ? { opacity: 1, x: 0 } : {}}
             transition={{ duration: 0.6, delay: 0.3 }}
             className="lg:col-span-3 flex flex-col items-center lg:items-end gap-8"
          >
             {/* QR Code */}
             <div className="bg-white p-3 w-48 h-48 flex items-center justify-center">
                {/* Placeholder for QR Code */}
                <div className="w-full h-full border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400">
                    <span className="text-xs">QR CODE</span>
                </div>
             </div>

             <div className="flex flex-col items-center lg:items-end gap-4">
                <span className="text-neutral-500 text-sm">{locale === 'th' ? 'ติดตามเราได้ที่' : 'Follow Us'}</span>
                <div className="flex gap-4">
                   <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-black hover:scale-110 transition-transform">
                     <i className="fa-brands fa-facebook-f" />
                   </a>
                   <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-black hover:scale-110 transition-transform">
                     <i className="fa-brands fa-line" />
                   </a>
                </div>
             </div>

             <div className="mt-auto pt-8 lg:pt-0 w-full flex justify-center lg:justify-end gap-4 text-xs font-medium text-neutral-500">
                <button onClick={() => window.location.href='/en'} className={locale === 'en' ? 'text-white' : 'hover:text-white'}>Eng</button>
                <button onClick={() => window.location.href='/th'} className={locale === 'th' ? 'text-white' : 'hover:text-white'}>ไทย</button>
             </div>

          </motion.div>

        </div>

        {/* Mobile Copyright */}
        <div className="mt-12 text-center text-neutral-500 text-xs lg:hidden">
            © {new Date().getFullYear()} — Copyright
        </div>

      </div>
    </footer>
  )
}
