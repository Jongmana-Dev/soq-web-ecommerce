'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'

export default function IndustrialStandards() {
  const locale = useLocale()

  // Data สำหรับโลโก้ AI Partners (ใช้โลโก้ที่เหมาะกับพื้นหลังสีอ่อน)
  const aiPartners = [
    { name: 'Canva', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg' },
    { name: 'Bard', src: 'https://www.vectorlogo.zone/logos/google_bard/google_bard-icon.svg' },
    { name: 'OpenAI', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/OpenAI_logo_white.svg/2000px-OpenAI_logo_white.svg.png' },
    { name: 'Bing', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Bing_logo_%282016%29.svg/2000px-Bing_logo_%282016%29.svg.png' },
    { name: 'NovelAI', src: 'https://novelai.net/assets/logo.png' },
    { name: 'DALL-E 2', src: 'https://openai.com/dall-e-2/assets/images/logo.svg' },
    { name: 'ChatGPT', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/2000px-ChatGPT_logo.svg.png' },
    { name: 'Google AI', src: 'https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_200x66px.svg' },
    { name: 'CharacterAI', src: 'https://character.ai/img/logo.54f6.svg' },
  ];

  return (
    <section
      id="industrial-standards"
      className="bg-light-gray dark:bg-chrome-1 pt-[77px] pb-[77px] w-full min-h-[600px]"
    >
      <div className="container max-w-[1440px] mx-auto px-4">
        {/* Main Grid for 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Industrial Standards Text */}
          <div className="flex flex-col items-start pt-[50px] pl-[80px]">
            {/* Headlines: text-black (ตามภาพตัวอย่าง) */}
            <h2 className="font-prompt text-[40px] leading-[48px] font-semibold text-black dark:text-white mb-4">
              {locale === 'th' ? 'Industrial Standards' : 'Industrial Standards'}
            </h2>
            <h3 className="font-prompt text-[40px] leading-[48px] font-semibold text-black dark:text-white mb-6">
              {locale === 'th' ? 'มาตรฐานโรงงาน' : 'Factory Standards'}
            </h3>
            {/* Description: text-gray-700 (เพื่อให้ดูเข้มขึ้นเล็กน้อยบนพื้นขาว) */}
            <p className="font-poppins text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-8 max-w-[375px]">
              {locale === 'th'
                ? 'ทำให้เราจัดหาการผลิตที่ได้มาตรฐาน ที่อยู่ในคุณภาพ สามารถใช้งานกับระบบการผลิต และธุรกิจได้อย่างมั่นใจ ให้เป็นไปได้ทุกขั้นตอน'
                : 'We ensure standard production with quality, usable in production systems and business with confidence, making every step possible.'}
            </p>
            {/* Button: text-black, border-black (ตามภาพตัวอย่าง) */}
            <button className="py-3 px-8 bg-transparent border border-black text-black rounded-md transition-colors hover:bg-black/10">
              {locale === 'th' ? 'อ่านรายละเอียด' : 'Read More'}
            </button>
          </div>

          {/* Right Column: AI Partners Logos */}
          <div className="flex items-center justify-center p-8">
            <div className="grid grid-cols-3 gap-8 max-w-[500px]">
              {/* ใช้ Image component และปรับ src เป็นโลโก้สีดำ/สีเข้มที่เหมาะสม */}
              <div className="flex items-center justify-center h-20">
                <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Canva_Logo.svg/1000px-Canva_Logo.svg.png" alt="Canva" width={100} height={40} className="object-contain max-h-full" />
              </div>
              <div className="flex items-center justify-center h-20">
                <Image src="https://www.vectorlogo.zone/logos/google_bard/google_bard-icon.svg" alt="Bard" width={100} height={40} className="object-contain max-h-full" />
              </div>
              <div className="flex items-center justify-center h-20">
                <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/OpenAI.svg/2000px-OpenAI.svg.png" alt="OpenAI" width={100} height={40} className="object-contain max-h-full" />
              </div>
              <div className="flex items-center justify-center h-20">
                <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Bing_logo.svg/2000px-Bing_logo.svg.png" alt="Bing" width={100} height={40} className="object-contain max-h-full" />
              </div>
              <div className="flex items-center justify-center h-20">
                <Image src="https://novelai.net/assets/logo.png" alt="NovelAI" width={100} height={40} className="object-contain max-h-full" />
              </div>
              <div className="flex items-center justify-center h-20">
                <Image src="https://openai.com/dall-e-2/assets/images/logo.svg" alt="DALL-E 2" width={100} height={40} className="object-contain max-h-full" />
              </div>
              <div className="flex items-center justify-center h-20">
                <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/2000px-ChatGPT_logo.svg.png" alt="ChatGPT" width={100} height={40} className="object-contain max-h-full" />
              </div>
              <div className="flex items-center justify-center h-20">
                <Image src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_200x66px.svg" alt="Google AI" width={100} height={40} className="object-contain max-h-full" />
              </div>
              <div className="flex items-center justify-center h-20">
                <Image src="https://character.ai/img/logo.54f6.svg" alt="CharacterAI" width={100} height={40} className="object-contain max-h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}