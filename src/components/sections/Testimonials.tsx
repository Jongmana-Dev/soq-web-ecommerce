'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// =========================================================================
// 1. MOCK DATA: ใช้ CDN Image ที่ตรงตามภาพมากที่สุด
// =========================================================================

// โลโก้บริษัทสำหรับแถบเลื่อน (ใช้ CDN ที่มีรูปโลโก้หรือ text placeholder)
const COMPANY_LOGOS = [
  { name: 'Tum Yuen', src: 'https://cdn.pixabay.com/photo/2021/08/04/13/06/logo-6521873_1280.png' }, // Generic Logo CDN
  { name: 'MARTHA', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Martha_Stewart_Living_Omnimedia_logo.svg/1200px-Martha_Stewart_Living_Omnimedia_logo.svg.png' }, // Martha Logo CDN
  { name: 'Psycho', src: 'https://static.vecteezy.com/system/resources/previews/018/930/690/original/abstract-psycho-logo-design-template-free-vector.jpg' }, // Psycho Logo CDN
  { name: 'CLARITY BREWING', src: 'https://placehold.co/120x40/f0f0f0/333333?text=CLARITY+BREWING&font=lato' }, // Text Placeholder
  { name: 'Ka', src: 'https://placehold.co/80x40/f0f0f0/333333?text=Ka&font=lato' }, // Text Placeholder
  { name: 'Andechs', src: 'https://www.andechs.de/fileadmin/template/img/logo.svg' }, // Andechs Logo CDN
  { name: 'WKO', src: 'https://placehold.co/100x40/f0f0f0/333333?text=WKO&font=lato' }, // Text Placeholder
  // ทำซ้ำสำหรับ Infinite Scroll
  { name: 'Tum Yuen 2', src: 'https://cdn.pixabay.com/photo/2021/08/04/13/06/logo-6521873_1280.png' },
  { name: 'MARTHA 2', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Martha_Stewart_Living_Omnimedia_logo.svg/1200px-Martha_Stewart_Living_Omnimedia_logo.svg.png' },
  { name: 'Psycho 2', src: 'https://static.vecteezy.com/system/resources/previews/018/930/690/original/abstract-psycho-logo-design-template-free-vector.jpg' },
  { name: 'CLARITY BREWING 2', src: 'https://placehold.co/120x40/f0f0f0/333333?text=CLARITY+BREWING&font=lato' },
  { name: 'Ka 2', src: 'https://placehold.co/80x40/f0f0f0/333333?text=Ka&font=lato' },
  { name: 'Andechs 2', src: 'https://www.andechs.de/fileadmin/template/img/logo.svg' },
  { name: 'WKO 2', src: 'https://placehold.co/100x40/f0f0f0/333333?text=WKO&font=lato' },
]

type TestimonialContentType = {
  type: 'video' | 'image';
  src: string; // URL ของวิดีโอ (YouTube embed) หรือรูปภาพ
  thumbnail?: string; // Thumbnail สำหรับวิดีโอ
  alt: string;
}

type TestimonialCardType = {
  id: string;
  logo: string; 
  quote: string;
  author: string;
  role: string;
}

type TestimonialPage = {
  content: TestimonialContentType; 
  cards: TestimonialCardType[];    
}

const ALL_TESTIMONIAL_PAGES: TestimonialPage[] = [
  {
    content: {
      type: 'video',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1', // ตัวอย่าง YouTube embed
      thumbnail: 'https://i.ibb.co/L51HkLw/testimonial-video-placeholder.webp', // รูป Thumbnail วิดีโอ (CDN)
      alt: 'Video Testimonial from Jane Cooper',
    },
    cards: [
      {
        id: 'martha-1',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Martha_Stewart_Living_Omnimedia_logo.svg/1200px-Martha_Stewart_Living_Omnimedia_logo.svg.png',
        quote: 'ตอนแรกกังวลว่าจะใช้ของไม่ตรงปก แต่พอใช้จริงจังคือบอกเลยว่าคุณภาพ ภาพกันน้ำมากกกคือวัสดุดีมากใช้ดี งานจบงานส่งดีลดการแจ้งซ่อมตรวจสอบเร็วรักการส่งการ',
        author: 'Jane Cooper',
        role: 'CEO, Airbnb',
      },
      {
        id: 'psycho-1',
        logo: 'https://static.vecteezy.com/system/resources/previews/018/930/690/original/abstract-psycho-logo-design-template-free-vector.jpg',
        quote: 'ใช้แล้วรู้สึกแตกต่างจากราคา อาจแพงที่สุดแต่ไม่เคยใช้ของที่รอยขีดข่วนเป็นสิบ แต่ประโยชน์การใช้งานที่ครอบคลุมมากๆ รู้สึกว่าคุ้มค่าเกินคุ้มที่จ่ายไป บอกเลยว่าประทับใจตั้งแต่แรกใช้ และต้องได้ซ้ำ แนะนำต่อ ให้เพื่อนๆ แน่นอนครับ',
        author: 'Jane Cooper',
        role: 'CEO, Airbnb',
      },
    ],
  },
  {
    content: {
      type: 'image',
      src: 'https://i.ibb.co/C07Bf5L/testimonial-image-2.webp', // รูปภาพ Testimonial (CDN)
      alt: 'Image Testimonial from John Doe',
    },
    cards: [
      {
        id: 'companyX-1',
        logo: 'https://placehold.co/100x40/FFFFFF/000000?text=CLARITY+BREWING&font=lato',
        quote: 'บริการดีเยี่ยม สินค้ามีคุณภาพตรงปก ส่งไว ตอบคำถามรวดเร็ว แนะนำเลยครับ ไม่ผิดหวังแน่นอนที่เลือกใช้บริการที่นี่',
        author: 'John Doe',
        role: 'Founder, Company X',
      },
      {
        id: 'companyY-1',
        logo: 'https://placehold.co/100x40/FFFFFF/000000?text=Ka&font=lato',
        quote: 'ทีมงานมืออาชีพ ใส่ใจทุกรายละเอียด แก้ปัญหาให้ลูกค้าได้รวดเร็วและมีประสิทธิภาพสูง ประทับใจมากครับ',
        author: 'Sarah Smith',
        role: 'CTO, Company Y',
      },
    ],
  },
  {
    content: {
      type: 'image',
      src: 'https://i.ibb.co/Jz5G3Jk/testimonial-image-3.webp', // รูปภาพ Testimonial (CDN)
      alt: 'Image Testimonial from Mary Johnson',
    },
    cards: [
      {
        id: 'andechs-1',
        logo: 'https://www.andechs.de/fileadmin/template/img/logo.svg',
        quote: 'คุณภาพของสินค้าและบริการเกินความคาดหวังมากๆ คุ้มค่าทุกบาททุกสตางค์ที่จ่ายไป แนะนำให้คนรู้จักมาใช้บริการต่อๆ ไป',
        author: 'Mary Johnson',
        role: 'Marketing Lead, Andechs',
      },
      {
        id: 'wko-1',
        logo: 'https://placehold.co/100x40/FFFFFF/000000?text=WKO&font=lato',
        quote: 'ทุกครั้งที่ติดต่อมาได้รับการบริการอย่างเป็นกันเองและรวดเร็ว พนักงานมีความรู้และให้คำแนะนำดีมากครับ',
        author: 'Robert Brown',
        role: 'Operations Manager, WKO',
      },
    ],
  },
]

// =========================================================================
// 2. Component หลัก Testimonials
// =========================================================================

export default function Testimonials() {
  const locale = useLocale()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const currentTestimonialPage = ALL_TESTIMONIAL_PAGES[currentPageIndex];
  const totalPages = ALL_TESTIMONIAL_PAGES.length;

  const handlePrevPage = () => {
    setIsPlayingVideo(false);
    setCurrentPageIndex((prevIndex) => 
      prevIndex === 0 ? totalPages - 1 : prevIndex - 1
    );
  };

  const handleNextPage = () => {
    setIsPlayingVideo(false);
    setCurrentPageIndex((prevIndex) => 
      prevIndex === totalPages - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <section id="testimonials" className="section bg-background dark:bg-chrome-2">
      <div className="container">
        {/* แถบโลโก้บริษัทด้านบน พร้อม Infinite Scroll Effect */}
        <div className="relative mb-12 overflow-hidden py-4">
          <div className="flex animate-marquee whitespace-nowrap">
            {COMPANY_LOGOS.map((logo, index) => (
              <Image
                key={`logo-${index}-1`}
                src={logo.src}
                alt={logo.name}
                width={120} // ปรับขนาดให้ใหญ่ขึ้นเล็กน้อย
                height={40} 
                className="mx-8 h-8 w-auto opacity-70 transition-opacity hover:opacity-100 dark:brightness-[100] dark:invert"
              />
            ))}
            {COMPANY_LOGOS.map((logo, index) => (
              <Image
                key={`logo-${index}-2`}
                src={logo.src}
                alt={logo.name}
                width={120} 
                height={40} 
                className="mx-8 h-8 w-auto opacity-70 transition-opacity hover:opacity-100 dark:brightness-[100] dark:invert"
              />
            ))}
          </div>
        </div>

        {/* Grid หลัก 2 คอลัมน์สำหรับ Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          
          {/* คอลัมน์ซ้าย: รูปภาพ/วิดีโอ และหัวข้อ */}
          <div className="flex flex-col gap-6 md:pr-8">
            
            {/* ================ FIX HERE (Text Styling) ================ */}
            <div className="relative flex flex-col items-start pt-6"> {/* เพิ่ม pt-6 เพื่อยกอัญประกาศขึ้นไปอีก */}
              <span className="font-poppins text-[70px] leading-[0.6] font-bold absolute left-[-10px] top-0" style={{ color: 'var(--accent)' }}>
                “
              </span>
              <div className="ml-10"> {/* ปรับ ml ให้เหมาะกับอัญประกาศ */}
                <h2 className="font-prompt text-3xl font-semibold text-text dark:text-chrome-text">
                  {locale === 'th' ? 'คำยืนยันจาก' : 'Testimonials from'}
                  <br/>
                  <span style={{ color: 'var(--accent)' }}>{locale === 'th' ? 'ลูกค้าที่ประทับใจ' : 'Satisfied Customers'}</span>
                </h2>
                <p className="font-prompt text-base text-muted dark:text-gray-400 max-w-sm mt-4">
                  {locale === 'th' ? 'สิ่งที่เราพูดอาจไม่สำคัญ เท่ากับสิ่งที่ลูกค้าของเรายืนยัน' : 'What we say might not matter as much as what our customers say.'}
                </p>
              </div>
            </div>
            {/* ======================================================== */}

            {/* ส่วนแสดงวิดีโอหรือรูปภาพ */}
            <div className="relative mt-4 w-full h-[300px] rounded-lg overflow-hidden shadow-lg border border-line dark:border-line-strong">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPageIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {currentTestimonialPage.content.type === 'video' && (
                    isPlayingVideo ? (
                      <iframe
                        src={currentTestimonialPage.content.src}
                        frameBorder="0"
                        allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        title={currentTestimonialPage.content.alt}
                      ></iframe>
                    ) : (
                      <>
                        <Image
                          src={currentTestimonialPage.content.thumbnail!}
                          alt={currentTestimonialPage.content.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority // โหลดรูปนี้ก่อน
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <button
                            onClick={() => setIsPlayingVideo(true)}
                            className="h-16 w-16 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-black transition-transform hover:scale-105"
                            aria-label="Play video testimonial"
                          >
                            <i className="fa-solid fa-play fa-xl ml-1"></i>
                          </button>
                        </div>
                      </>
                    )
                  )}
                  {currentTestimonialPage.content.type === 'image' && (
                    <Image
                      src={currentTestimonialPage.content.src}
                      alt={currentTestimonialPage.content.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority // โหลดรูปนี้ก่อน
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* คอลัมน์ขวา: Testimonials Cards */}
          <div className="flex flex-col gap-8 md:pl-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPageIndex + "-cards"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex flex-col gap-8"
              >
                {currentTestimonialPage.cards.map((testimonial) => (
                  <div key={testimonial.id} className="card p-6 md:p-8">
                    {/* ================ FIX HERE (Card Text Styling) ================ */}
                    <p className="font-prompt text-xl font-semibold text-text dark:text-chrome-text mb-4">
                      {testimonial.id.includes('martha') ? 'MARTHA' : (testimonial.id.includes('psycho') ? 'Psycho' : 'Company Name')}
                    </p> {/* ปรับขนาดและน้ำหนัก font */}

                    <p className="font-prompt text-lg leading-relaxed text-text dark:text-chrome-text mb-4">
                      <span className="font-poppins text-2xl font-bold mr-1" style={{ color: 'var(--accent)' }}>“</span>
                      {testimonial.quote}
                    </p>
                    
                    <p className="font-prompt text-sm font-semibold text-text dark:text-chrome-text">
                      {testimonial.author}
                    </p>
                    <p className="font-prompt text-xs text-muted dark:text-gray-400">
                      {testimonial.role}
                    </p>
                    {/* =============================================================== */}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end gap-4 mt-6">
              <button 
                onClick={handlePrevPage}
                className="btn h-10 w-10 flex items-center justify-center text-text dark:text-chrome-text border border-line dark:border-line-strong hover:bg-surface-2 dark:hover:bg-chrome-2"
                aria-label="Previous testimonial page"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <span className="font-prompt text-base text-text dark:text-chrome-text">
                {currentPageIndex + 1} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                className="btn h-10 w-10 flex items-center justify-center text-text dark:text-chrome-text border border-line dark:border-line-strong hover:bg-surface-2 dark:hover:bg-chrome-2"
                aria-label="Next testimonial page"
              >
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}