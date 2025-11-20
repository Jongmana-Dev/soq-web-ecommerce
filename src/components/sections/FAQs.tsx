'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Data สำหรับ FAQ Cards
const faqItems = [
  {
    icon: 'fa-solid fa-box',
    title_th: 'สินค้าแตกต่างจากที่อื่นอย่างไร?',
    title_en: 'How is the product different?',
    description_th: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    description_en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    link_th: 'อ่านรายละเอียด',
    link_en: 'Read details',
  },
  {
    icon: 'fa-solid fa-flask',
    title_th: 'สินค้าผลิตที่ไหน?',
    title_en: 'Where are the products made?',
    description_th: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    description_en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    link_th: 'อ่านรายละเอียด',
    link_en: 'Read details',
  },
  {
    icon: 'fa-solid fa-truck-fast',
    title_th: 'มีการจัดส่งต่างประเทศไหม?',
    title_en: 'Is international shipping available?',
    description_th: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    description_en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    link_th: 'อ่านรายละเอียด',
    link_en: 'Read details',
  },
  {
    icon: 'fa-solid fa-rotate',
    title_th: 'นโยบายการคืน,เปลี่ยนสินค้า?',
    title_en: 'Return and exchange policy?',
    description_th: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    description_en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    link_th: 'อ่านรายละเอียด',
    link_en: 'Read details',
  },
  {
    icon: 'fa-solid fa-clock',
    title_th: 'ใช้เวลาจัดส่งสินค้านานแค่ไหน?',
    title_en: 'How long does shipping take?',
    description_th: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    description_en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    link_th: 'อ่านรายละเอียด',
    link_en: 'Read details',
  },
  {
    icon: 'fa-solid fa-headset',
    title_th: 'ติดต่อฝ่ายบริการลูกค้า?',
    title_en: 'Contact customer service?',
    description_th: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    description_en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh tristique ipsum.',
    link_th: 'อ่านรายละเอียด',
    link_en: 'Read details',
  },
];


export default function FAQ() {
  const locale = useLocale()
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section
      id="faq"
      className="bg-light-gray dark:bg-chrome-1 pt-[77px] pb-[77px] w-full min-h-[700px]"
      ref={ref}
    >
      <div className="container max-w-[1440px] mx-auto px-4">
        {/* FAQs Heading */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={itemVariants}
          className="flex flex-col items-start mb-12 pl-[80px]"
        >
          {/* "FAQs." text-gray-400 */}
          <h2 className="font-prompt text-[40px] leading-[48px] font-semibold text-gray-400 dark:text-white mb-2">
            {locale === 'th' ? 'FAQs.' : 'FAQs.'}
          </h2>
          {/* "คำถามที่พบบ่อย" text-black */}
          <h3 className="font-prompt text-[40px] leading-[48px] font-semibold text-black dark:text-white mb-4">
            {locale === 'th' ? 'คำถามที่พบบ่อย' : 'Frequently Asked Questions'}
          </h3>
          {/* Description text-gray-700 */}
          <p className="font-poppins text-lg leading-relaxed text-gray-700 dark:text-gray-300 max-w-[400px]">
            Lorem ipsum is common placeholder text used to demonstrate the graphic elements of a document or visual presentation.
          </p>
        </motion.div>

        {/* FAQ Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-[80px]">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
              // Card styles: ไม่มี shadow, ไม่มี border, bg-white
              className="flex flex-col items-start bg-white dark:bg-chrome-3 p-6 rounded-lg h-[270px]"
            >
              {/* Icon: text-gray-700 (สีเทาเข้ม/ดำ ตามภาพตัวอย่าง) */}
              <i className={`${item.icon} text-3xl text-gray-700 mb-4`}></i> {/* เปลี่ยนจาก text-accent เป็น text-gray-700 */}
              {/* Title: text-black */}
              <h4 className="font-prompt text-xl font-semibold text-black dark:text-white mb-2">
                {locale === 'th' ? item.title_th : item.title_en}
              </h4>
              {/* Description: text-gray-700 */}
              <p className="font-poppins text-base text-gray-700 dark:text-gray-300 mb-4 flex-grow">
                {locale === 'th' ? item.description_th : item.description_en}
              </p>
              {/* Link: text-gray-700 underline (สีเทาเข้ม/ดำ ตามภาพตัวอย่าง) */}
              <a
                href="#"
                className="font-poppins text-base text-gray-700 dark:text-white underline hover:no-underline" // เปลี่ยนจาก text-black เป็น text-gray-700
              >
                {locale === 'th' ? item.link_th : item.link_en}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}