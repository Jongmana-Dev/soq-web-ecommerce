'use client'

import { useState, useMemo } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import ProductModal from '@/components/modals/ProductModal' 

// =========================================================================
// 1. MOCK DATA: (เหมือนเดิม)
// =========================================================================
type ProductSize = {
  label_th: string;
  label_en: string;
  volume: string;
  price: number;
}
const PRODUCT_SIZES: ProductSize[] = [
  { label_th: '330 มล.', label_en: '330ml', volume: '330ml', price: 120 },
  { label_th: '1 ลิตร', label_en: '1 Liter', volume: '1L', price: 350 },
  { label_th: '20 ลิตร', label_en: '20 Liter', volume: '20L', price: 5900 },
];
type ProductPage = {
  id: string; 
  name_th: string;
  name_en: string;
  short_desc_th: string;
  short_desc_en: string;
  long_desc_th: string; 
  long_desc_en: string; 
  mainImage: { src: string; alt: string };
  secondaryImage: { src: string; alt: string };
  galleryImages: string[]; 
  sizes: ProductSize[]; 
  features: {
    id: string;
    number: string;
    title_th: string;
    title_en: string;
    description_th: string;
    description_en: string;
  }[];
}
const ALL_PRODUCT_PAGES: ProductPage[] = [
  {
    id: 'star-san-premium',
    name_th: 'Star San Sanitizer Premium', // ชื่อนี้จะถูกใช้โดย Modal
    name_en: 'Star San Sanitizer Premium',
    // คำอธิบายสั้น (ตาม CSS: P1_1, font-size: 24px)
    short_desc_th: 'น้ำยาฆ่าเชื้อและทำความสะอาดอุปกรณ์สำหรับการต้มเบียร์ที่ได้รับความนิยมทั่วโลก ด้วยคุณสมบัติแบบ No-Rinse Sanitizer หรือการใช้งานโดยไม่ต้องล้างน้ำซ้ำหลังฆ่าเชื้อ',
    short_desc_en: 'A world-renowned sanitizer for brewing equipment, featuring a No-Rinse capability, meaning no rinsing is required after application.',
    long_desc_th: 'Star San Sanitizer Premium เป็นน้ำยาฆ่าเชื้อเกรดพรีเมียม... (ข้อความยาวสำหรับ Modal)',
    long_desc_en: 'Star San Sanitizer Premium is a premium acid-based sanitizer... (long description for Modal)',
    mainImage: {
      src: 'https://i.ibb.co/k2c5w0g/mockup-black-bottle.webp', // CDN image for black bottle
      alt: 'Black Star San Sanitizer Bottle Mockup',
    },
    secondaryImage: {
      src: 'https://i.ibb.co/TmgG7xY/mockup-blue-bottle.webp', // CDN image for blue bottle
      alt: 'Blue Star San Sanitizer Bottle Mockup',
    },
    galleryImages: [ 
      'https://i.ibb.co/k2c5w0g/mockup-black-bottle.webp',
      'https://i.ibb.co/TmgG7xY/mockup-blue-bottle.webp',
      'https://i.ibb.co/c8B3jY1/mockup-white-bottle.webp',
      'https://i.ibb.co/hV7235q/mockup-green-bottle.webp',
      'https://i.ibb.co/M731j6W/star-san-20L.webp',
      'https://i.ibb.co/ySW461g/star-san-1L.webp',
      'https://i.ibb.co/BcdjS4h/star-san-330ml.webp',
    ],
    sizes: PRODUCT_SIZES,
    features: [
      {
        id: 'feature-1',
        number: '01',
        title_th: 'ผสมสารละลาย', // เพิ่ม Title ให้ตรงกับ CSS (P2_1)
        title_en: 'Mix Solution',
        description_th: 'อัตราส่วนคือ 1 ออนซ์ (ประมาณ 30 มล.) ต่อน้ำ 5 แกลลอน (ประมาณ 19 ลิตร) ควรใช้น้ำที่มีค่า pH ต่ำกว่า 7 (น้ำกรองหรือน้ำ RO จะดีที่สุด)',
        description_en: 'Ratio is 1 oz (approx. 30 ml) per 5 gallons (approx. 19 liters) of water. Use at pH less than 7 (RO or filtered water is best).',
      },
      {
        id: 'feature-2',
        number: '02',
        title_th: 'ทำความสะอาดก่อน', // เพิ่ม Title ให้ตรงกับ CSS (P2_1)
        title_en: 'Clean First',
        description_th: 'ล้างคราบและสิ่งสกปรกออกจากอุปกรณ์ด้วยน้ำยาล้างหรือน้ำสบู่อ่อน ๆ Star San เป็น sanitizer (ฆ่าเชื้อ) ไม่ใช่ cleaner (ทำความสะอาด)',
        description_en: 'Remove all dirt and grime from equipment with mild detergent or soap. Star San is a sanitizer, not a cleaner.',
      },
    ],
  },
  // ... (สามารถเพิ่ม ProductPages อื่นๆ ได้ในอนาคต) ...
];

// =========================================================================
// 2. Component หลัก ProductShowcase (เน้น Layout และ Styling ตามภาพล่าสุด)
// =========================================================================

export default function ProductShowcase() {
  const locale = useLocale()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false) 
  const [selectedProduct, setSelectedProduct] = useState<ProductPage | null>(null);

  const currentProductPage = ALL_PRODUCT_PAGES[currentPageIndex];
  const totalPages = ALL_PRODUCT_PAGES.length > 0 ? ALL_PRODUCT_PAGES.length : 1; // สมมติ 1 หน้าเป็นอย่างน้อย

  const handlePrevPage = () => {
    setCurrentPageIndex((prevIndex) => 
      prevIndex === 0 ? totalPages - 1 : prevIndex - 1
    );
  };

  const handleNextPage = () => {
    setCurrentPageIndex((prevIndex) => 
      prevIndex === totalPages - 1 ? 0 : prevIndex + 1
    );
  };

  const openProductModal = (product: ProductPage) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // HTML สำหรับชื่อสินค้าที่ต้องการสีและโครงสร้างตามภาพล่าสุด
  const productNameHtml = useMemo(() => {
    // ตามภาพล่าสุด: Star San Sanitizer Premium ทั้งหมดเป็นสีดำ และมีการตัดบรรทัดที่ชัดเจน
    return `Star San<br/>Sanitizer<br/>Premium`;
  }, []);

  return (
    <section 
      id="product-showcase" 
      // Background สีเทาอ่อน (Light Mode Only เพื่อให้ตรงภาพ)
      className="bg-[#F8F8F8] pt-[77px] pb-[77px] w-full min-h-[1024px] overflow-hidden" 
    >
      <div 
        // Container ที่จำกัดความกว้าง 1440px และจัดกึ่งกลาง
        className="max-w-[1440px] mx-auto px-[5px]" // ใช้ px-[5px] เพื่อ match gap ของ flex container ด้านใน
        style={{ height: 'calc(1024px - 154px)' }} // 1024px (section height) - 77px*2 (section padding)
      >
        {/* Main Flex Container: flex-direction: row; align-items: flex-start; padding: 0px; gap: 5px; */}
        <div className="flex flex-row items-start gap-[5px] h-full">
          
          {/* ====================================================================================
              1. Left Column (Content left)
                 - Headline: "Star San Sanitizer Premium" (สีดำ)
                 - Description: "น้ำยาฆ่าเชื้อและทำความสะอาดอุปกรณ์..." (สีดำ)
                 - Button: "ซื้อเลย" (Background เหลือง, Text ดำ)
             ==================================================================================== */}
          {/* Frame 1261153342 (width: 547px;) */}
          <div className="flex-none w-[547px] h-full flex flex-col justify-start">
            {/* Content left (gap: 45px;) */}
            <div className="flex flex-col items-start gap-[45px] w-[375px] h-auto ml-[80px]"> {/* จัดตำแหน่งด้วย ml */}
              {/* Headline Container (height: 300px;) */}
              <div className="w-[375px] h-[300px]">
                {/* Star San Sanitizer Premium (font-family: 'Prompt', font-weight: 300, font-size: 80px, line-height: 100px, color: #000000) */}
                <h2 
                  className="font-prompt font-light text-[80px] leading-[100px] text-black"
                  style={{ whiteSpace: 'nowrap' }} // ป้องกันการตัดบรรทัดที่ไม่ต้องการ
                  dangerouslySetInnerHTML={{ __html: productNameHtml }}
                >
                </h2>
              </div>

              {/* Description & Button Container (gap: 16px;) */}
              <div className="flex flex-col items-start gap-[16px] w-[375px]">
                {/* Description (font-family: 'Poppins', font-weight: 275, font-size: 24px, line-height: 36px, color: #06040A) */}
                <p className="font-poppins font-light text-[24px] leading-[36px] text-[#06040A] w-[375px] h-[180px]">
                  {locale === 'th'
                    ? currentProductPage.short_desc_th
                    : currentProductPage.short_desc_en}
                </p>

                {/* Button "ซื้อเลย" (width: 227px, height: 50.47px, background: #F3C85B, color: #000000, font-size: 18px, line-height: 28px, font-weight: 500) */}
                <button 
                  onClick={() => openProductModal(currentProductPage)} 
                  className="flex items-center justify-center w-[227px] h-[50.47px] bg-[#F3C85B] text-black 
                             font-prompt font-medium text-[18px] leading-[28px] transition-transform hover:scale-105" 
                >
                  {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>

          {/* ====================================================================================
              2. Right Column (Frame 1261153346)
                 - Headline: "วิธีใช้ Star San Sanitizer" (สีดำ)
                 - Image Container: กรอบขาว มีเงา แสดงรูปภาพ 2 ขวด
                 - Feature Cards: "01", "02" (ตัวเลขสีส้มจางๆ, Text สีดำ), Pagination
             ==================================================================================== */}
          {/* Frame 1261153346 (width: 888px; gap: 20px;) */}
          <div className="flex-none w-[888px] h-full flex flex-col justify-start items-start gap-[20px]">
            {/* Projects Container (width: 888px; gap: 48px;) */}
            <div className="flex flex-col items-start gap-[48px] w-full">
              {/* Headline "วิธีใช้ Star San Sanitizer" (font-family: 'Poppins', font-weight: 300, font-size: 24px, line-height: 36px, color: #000000) */}
              <h3 className="font-poppins font-light text-[24px] leading-[36px] text-black pl-[4px]">
                {locale === 'th' ? 'วิธีใช้ Star San Sanitizer' : 'How to use Star San Sanitizer'}
              </h3>

              {/* Image & Feature Cards Main Flex (gap: 48px;) */}
              <div className="flex flex-row justify-between items-start gap-[48px] w-full">
                
                {/* Image Container (Rectangle 90 / Rectangle 91 - width: 428px, height: 620px, background: #D9D9D9 (gray), border-radius: 16px) */}
                <div 
                  className="relative w-[428px] h-[620px] bg-white rounded-[16px] shadow-md overflow-hidden flex justify-center items-center"
                  style={{ boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.1), 0px 2px 7px rgba(0, 0, 0, 0.06)' }} // ตาม Figma box-shadow
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPageIndex + "-images-right"}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full flex justify-center items-center"
                    >
                      {/* รูปภาพขวด 2 ขวด (ใช้ CDN URL ที่คุณให้มา) */}
                      <Image
                        src="https://i.ibb.co/k2c5w0g/mockup-black-bottle.webp" // Black bottle (Free_Plastic_Jar_Mockup_4.jpg)
                        alt="Black Star San Sanitizer Bottle Mockup"
                        width={320} // กำหนด width/height เพื่อควบคุมขนาดให้เหมาะสม
                        height={400}
                        className="absolute z-10 top-1/2 left-1/2 -translate-x-[60%] -translate-y-1/2 transform rotate-[-5deg] object-contain drop-shadow-md"
                        priority
                      />
                      <Image
                        src="https://i.ibb.co/TmgG7xY/mockup-blue-bottle.webp" // Blue bottle (Free_Plastic_Jar_Mockup_5.jpg)
                        alt="Blue Star San Sanitizer Bottle Mockup"
                        width={320}
                        height={400}
                        className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] transform rotate-[5deg] object-contain drop-shadow-md"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Feature Cards Column (width: 428px) */}
                <div className="flex flex-col justify-between items-start gap-[16px] w-[428px] h-[620px]"> {/* ปรับ height ให้เท่ากับรูปภาพ */}
                  {currentProductPage.features.map((feature, index) => (
                    // Frame 14613 (gap: 24px;)
                    <div key={feature.id} className="flex flex-row items-start gap-[24px] w-full h-[150px]">
                      {/* Number "01" / "02" (font-family: 'Prompt', font-weight: 300, font-size: 48px, line-height: 56px, color: rgba(255, 179, 15, 0.4)) */}
                      <p className="font-prompt font-light text-[48px] leading-[56px]" 
                         style={{ color: 'rgba(254, 197, 54, 0.4)' }}> {/* ใช้สีตามที่ระบุใน CSS */}
                        {feature.number}
                      </p>
                      {/* Text content (Title & Description) */}
                      <div className="flex flex-col">
                        {/* Title (font-family: 'Poppins', font-weight: 300, font-size: 20px, line-height: 30px, color: #06040A) */}
                        <h4 className="font-poppins font-light text-[20px] leading-[30px] text-[#06040A]">
                          {locale === 'th' ? feature.title_th : feature.title_en}
                        </h4>
                        {/* Description (font-family: 'Poppins', font-weight: 300, font-size: 20px, line-height: 30px, color: #06040A) */}
                        <p className="font-poppins font-light text-[20px] leading-[30px] text-[#06040A]">
                          {locale === 'th' ? feature.description_th : feature.description_en}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Controls (Frame 191 - width: 118.28px, height: 40px, gap: 7.64px) */}
              <div className="flex items-center justify-end gap-[7.64px] w-full pr-[4px]"> {/* จัดชิดขวาและเพิ่ม pr */}
                {/* Arrow Left Button (width: 40px, height: 40px, background: #FFFFFF, shadow, border-radius: 142.857px) */}
                <button 
                  onClick={handlePrevPage}
                  className="flex items-center justify-center w-[40px] h-[40px] bg-white shadow-md rounded-full text-black hover:bg-gray-100 transition-colors"
                  style={{ boxShadow: '0px 0px 4.28571px rgba(16, 24, 40, 0.1), 0px 2.85714px 7.14286px rgba(16, 24, 40, 0.06)' }}
                  aria-label="Previous product page"
                >
                  <i className="fa-solid fa-arrow-left text-[18px]"></i>
                </button>
                {/* "1/3" (font-family: 'Prompt', font-weight: 300, font-size: 16px, line-height: 24px, color: #000000) */}
                <span className="font-prompt font-light text-[16px] leading-[24px] text-black">
                  {currentPageIndex + 1} / {totalPages}
                </span>
                {/* Arrow Right Button */}
                <button
                  onClick={handleNextPage}
                  className="flex items-center justify-center w-[40px] h-[40px] bg-white shadow-md rounded-full text-black hover:bg-gray-100 transition-colors"
                  style={{ boxShadow: '0px 0px 4.28571px rgba(16, 24, 40, 0.1), 0px 2.85714px 7.14286px rgba(16, 24, 40, 0.06)' }}
                  aria-label="Next product page"
                >
                  <i className="fa-solid fa-arrow-right text-[18px]"></i>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Product Modal (ยังคงอยู่เหมือนเดิม) */}
      {isModalOpen && selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={closeProductModal} 
          locale={locale}
        />
      )}
    </section>
  )
}