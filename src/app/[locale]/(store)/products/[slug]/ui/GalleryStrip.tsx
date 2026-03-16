'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function GalleryStrip({ images }: { images: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((src, i) => (
        <motion.div key={i} className="rounded border border-border p-2"
          initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: i * 0.05}}>
          <Image src={src} alt={`thumb-${i}`} width={320} height={320} className="mx-auto h-auto w-auto" />
        </motion.div>
      ))}
    </div>
  )
}
