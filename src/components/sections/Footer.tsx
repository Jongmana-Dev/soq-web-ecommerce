'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  const locale = useLocale()

  // Class สำหรับลิงก์ในเมนู footer
  const footerLinkClass = "relative hover:text-white transition-colors before:content-['•'] before:absolute before:-left-4 before:text-gray-400 before:dark:text-gray-300"
  // ^^^ เพิ่ม bullet point ด้วย pseudo-element 'before'

  return (
    <footer
      id="footer"
      // พื้นหลังสีเทาเข้ม (#333333 หรือใกล้เคียง) text-gray-300 (สีข้อความทั่วไป) dark:text-gray-300
      className="bg-[#333333] dark:bg-chrome-footer pt-[100px] pb-[40px] w-full min-h-[400px] text-gray-300 dark:text-gray-300"
    >
      <div className="container max-w-[1440px] mx-auto px-4">
        {/* Main Grid for Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start pl-[80px] pr-[80px]">

          {/* Column 1: SOQ Logo & Copyright */}
          <div className="flex flex-col col-span-1 md:col-span-1 pr-4">
            {/* Logo SOQ */}
            <Image
              src="/path/to/your/soq-logo-white.png" // **โปรดแก้ไข Path ไปยังโลโก้ SOQ ของคุณ (สีขาว)**
              alt="SOQ Logo"
              width={180}
              height={60}
              className="h-[60px] w-auto mb-4"
            />
          </div>

          {/* Columns 2-5: Navigation Links and QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 col-span-1 md:col-span-4 gap-8">
            {/* Column 2 (Original Footer Col 1): สินค้า */}
            <div className="flex flex-col items-start">
              <h4 className="font-prompt text-lg font-semibold mb-4 text-white">
                {locale === 'th' ? 'สินค้า' : 'Products'}
              </h4>
              <ul className="space-y-2 font-poppins text-base">
                <li><Link href="#" className={footerLinkClass}>Star San</Link></li>
              </ul>
            </div>

            {/* Column 3 (Original Footer Col 2): มาตรฐานโรงงาน */}
            <div className="flex flex-col items-start">
              <h4 className="font-prompt text-lg font-semibold mb-4 text-white">
                {locale === 'th' ? 'มาตรฐานโรงงาน' : 'Factory Standards'}
              </h4>
              <ul className="space-y-2 font-poppins text-base">
                <li><Link href="#" className={footerLinkClass}>{locale === 'th' ? 'Factory Certification' : 'Factory Certification'}</Link></li>
                <li><Link href="#" className={footerLinkClass}>{locale === 'th' ? 'Manufacturing License' : 'Manufacturing License'}</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors hidden">{locale === 'th' ? 'Factory Accreditation' : 'Factory Accreditation'}</Link></li> {/* ซ่อนชั่วคราวตามภาพตัวอย่าง */}
                <li><Link href="#" className={footerLinkClass}>{locale === 'th' ? 'Production Certification' : 'Production Certification'}</Link></li>
              </ul>
            </div>

            {/* Column 4 (Original Footer Col 3): บริการ */}
            <div className="flex flex-col items-start">
              <h4 className="font-prompt text-lg font-semibold mb-4 text-white">
                {locale === 'th' ? 'บริการ' : 'Services'}
              </h4>
              <ul className="space-y-2 font-poppins text-base">
                <li><Link href="#" className={footerLinkClass}>{locale === 'th' ? 'รีวิวลูกค้า' : 'Customer Reviews'}</Link></li>
              </ul>
            </div>

            {/* Column 5 (New): คำถามที่พบบ่อย */}
            <div className="flex flex-col items-start">
              <h4 className="font-prompt text-lg font-semibold mb-4 text-white">
                {locale === 'th' ? 'คำถามที่พบบ่อย' : 'FAQs'}
              </h4>
              <ul className="space-y-2 font-poppins text-base">
                <li><Link href="#" className={footerLinkClass}>{locale === 'th' ? 'สินค้าแตกต่างจากที่อื่นอย่างไร?' : 'How is the product different?'}</Link></li>
                <li><Link href="#" className={footerLinkClass}>{locale === 'th' ? 'สินค้าผลิตที่ไหน?' : 'Where are the products made?'}</Link></li>
                <li><Link href="#" className={footerLinkClass}>{locale === 'th' ? 'มีการจัดส่งต่างประเทศไหม?' : 'Is international shipping available?'}</Link></li>
                <li><Link href="#" className={footerLinkClass}>{locale === 'th' ? 'นโยบายการคืน,เปลี่ยนสินค้า?' : 'Return and exchange policy?'}</Link></li>
                <li><Link href="#" className={footerLinkClass}>{locale === 'th' ? 'ใช้เวลาจัดส่งสินค้านานแค่ไหน?' : 'How long does shipping take?'}</Link></li>
                <li><Link href="#" className={footerLinkClass}>{locale === 'th' ? 'ติดต่อฝ่ายบริการลูกค้า?' : 'Contact customer service?'}</Link></li>
              </ul>
            </div>
          </div>

          {/* QR Code and Social Media Icons (แยกออกมาอยู่ด้านขวาสุด) */}
          <div className="flex flex-col items-end justify-start col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-1 order-last md:order-none">
            <div className="mt-0 md:mt-0 flex flex-col items-end">
              <Image
                src="https://via.placeholder.com/150x150/FFFFFF/000000?text=LINE_QR" // **โปรดแก้ไข URL เป็น QR Code ของ Line ของคุณ (พื้นหลังขาว โค้ดดำ)**
                alt="LINE QR Code"
                width={150}
                height={150}
                className="rounded-lg mb-4"
              />
              <p className="font-poppins text-sm text-white mb-4"> {/* เปลี่ยนเป็น text-white */}
                {locale === 'th' ? 'ช่องทางติดต่อ' : 'Contact Channels'}
              </p>
              <div className="flex gap-4">
                <a href="#" aria-label="Line" className="p-2 border border-white rounded-full"><i className="fa-brands fa-line text-xl text-white hover:text-accent transition-colors"></i></a>
                <a href="#" aria-label="Facebook" className="p-2 border border-white rounded-full"><i className="fa-brands fa-facebook-f text-xl text-white hover:text-accent transition-colors"></i></a>
                <a href="#" aria-label="Email" className="p-2 border border-white rounded-full"><i className="fa-solid fa-envelope text-xl text-white hover:text-accent transition-colors"></i></a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Privacy, Language Selector */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-700 font-poppins text-sm">
          <div className="flex gap-4 pl-[80px]">
            <p className="text-gray-400">© 2024 - Copyright</p>
            <Link href="#" className="hover:text-white transition-colors text-gray-400">Privacy</Link>
          </div>
          <div className="pr-[80px]">
            <Link href="#" className="hover:text-white transition-colors mr-2 text-gray-400">Eng</Link>
            <span>|</span>
            <Link href="#" className="hover:text-white transition-colors ml-2 text-gray-400">ไทย</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}