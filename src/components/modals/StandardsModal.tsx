'use client'

import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

type StandardsModalProps = {
  onClose: () => void
}

const CERTIFICATIONS_DETAILS = [
  { 
    id: 'fda',
    icon: 'fa-solid fa-certificate', 
    title_en: 'FDA Certified', 
    title_th: 'FDA รับรอง',
    desc_en: 'Approved by the Food and Drug Administration, ensuring clear safety standards for food contact.',
    desc_th: 'ได้รับการรับรองจากสำนักงานคณะกรรมการอาหารและยา มั่นใจได้ในความปลอดภัยสำหรับการสัมผัสอาหาร'
  },
  { 
    id: 'iso',
    icon: 'fa-solid fa-shield-halved', 
    title_en: 'ISO 9001', 
    title_th: 'ISO 9001',
    desc_en: 'Manufactured under ISO 9001 quality management systems, guaranteeing consistent product quality.',
    desc_th: 'ผลิตภายใต้ระบบบริหารงานคุณภาพ ISO 9001 รับประกันคุณภาพสินค้าที่สม่ำเสมอ'
  },
  { 
    id: 'eco',
    icon: 'fa-solid fa-leaf', 
    title_en: 'Eco-Friendly', 
    title_th: 'เป็นมิตรกับสิ่งแวดล้อม',
    desc_en: 'Biodegradable formula that is safe for the environment and breaks down naturally.',
    desc_th: 'สูตรย่อยสลายได้ทางชีวภาพ ปลอดภัยต่อสิ่งแวดล้อมและย่อยสลายได้ตามธรรมชาติ'
  },
  { 
    id: 'lab',
    icon: 'fa-solid fa-flask-vial', 
    title_en: 'Lab Tested', 
    title_th: 'ทดสอบในห้องปฏิบัติการ',
    desc_en: 'Rigorously tested in certified laboratories to verify efficacy against bacteria and yeast.',
    desc_th: 'ผ่านการทดสอบอย่างเข้มงวดในห้องปฏิบัติการที่ได้รับการรับรอง เพื่อยืนยันประสิทธิภาพในการฆ่าเชื้อแบคทีเรียและยีสต์'
  },
  { 
    id: 'gmp',
    icon: 'fa-solid fa-check-double', 
    title_en: 'GMP Standard', 
    title_th: 'มาตรฐาน GMP',
    desc_en: 'Produced according to Good Manufacturing Practices (GMP) ensuring high quality production standards.',
    desc_th: 'ผลิตตามหลักเกณฑ์วิธีการที่ดีในการผลิต (GMP) มั่นใจได้ในมาตรฐานการผลิตระดับสูง'
  },
  { 
    id: 'global',
    icon: 'fa-solid fa-globe', 
    title_en: 'World Class', 
    title_th: 'ระดับโลก',
    desc_en: 'Trusted by homebrewers and professionals in over 50 countries worldwide.',
    desc_th: 'ได้รับความไว้วางใจจากผู้ผลิตเบียร์และมืออาชีพในกว่า 50 ประเทศทั่วโลก'
  },
]

export default function StandardsModal({ onClose }: StandardsModalProps) {
  const locale = useLocale()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-3xl font-light text-neutral-900 mb-1">
                {locale === 'th' ? 'มาตรฐานของเรา' : 'Our Standards'}
              </h2>
              <p className="text-neutral-500 text-sm">
                {locale === 'th' ? 'ความใส่ใจในคุณภาพและความปลอดภัย' : 'Commitment to Quality and Safety'}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-black transition-colors"
            >
              <i className="fa-solid fa-xmark text-xl" />
            </button>
          </div>

          {/* Grid Content */}
          <div className="overflow-y-auto p-8 bg-[#F5F5F7]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CERTIFICATIONS_DETAILS.map((cert, index) => (
                <motion.div
                   key={cert.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.1 }}
                   className="bg-white p-6 shadow-sm border border-gray-100 hover:border-[var(--accent)] hover:shadow-md transition-all group"
                >
                   <div className="flex items-start gap-4">
                      <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-neutral-50 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
                        <i className={`${cert.icon} text-xl`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-neutral-900 mb-2">
                          {locale === 'th' ? cert.title_th : cert.title_en}
                        </h3>
                        <p className="text-sm text-neutral-500 leading-relaxed group-hover:text-neutral-700 transition-colors">
                          {locale === 'th' ? cert.desc_th : cert.desc_en}
                        </p>
                      </div>
                   </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-white flex justify-end">
             <button
                onClick={onClose}
                className="px-8 py-3 bg-neutral-900 text-white font-medium hover:bg-black transition-colors"
             >
                {locale === 'th' ? 'ปิด' : 'Close'}
             </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
