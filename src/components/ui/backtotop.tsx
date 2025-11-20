'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function BackToTop() {
  const [showButton, setShowButton] = useState(false)
  const [openChat, setOpenChat] = useState(false) // สถานะสำหรับเปิด/ปิดช่องแชท

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) { // แสดงปุ่มเมื่อเลื่อนลงมาเกิน 300px
        setShowButton(true)
      } else {
        setShowButton(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Variants สำหรับ AnimatePresence ของปุ่มแชท
  const chatVariants = {
    hidden: { opacity: 0, y: 20, transition: { type: 'spring', stiffness: 300, damping: 20 } },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  }

  return (
    <>
      {/* Back to Top Button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 z-50 p-3 bg-accent text-black rounded-full shadow-lg hover:bg-accent/90 transition-all duration-300"
            aria-label="Scroll to top"
          >
            <i className="fa-solid fa-arrow-up text-xl"></i>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat / Contact Buttons */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end space-y-3">
        {/* Toggle Button for Chat Options */}
        <motion.button
          onClick={() => setOpenChat(!openChat)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 w-14 h-14 flex items-center justify-center"
          aria-label={openChat ? "Close chat options" : "Open chat options"}
        >
          {openChat ? (
            <i className="fa-solid fa-xmark text-2xl"></i> // Icon X เมื่อเปิด
          ) : (
            <i className="fa-solid fa-comment-dots text-2xl"></i> // Icon แชทเมื่อปิด
          )}
        </motion.button>

        {/* Chat Options (Line, Facebook, Email) */}
        <AnimatePresence>
          {openChat && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={chatVariants}
              className="flex flex-col items-end space-y-3"
            >
              {/* Line Button */}
              <Link
                href="https://line.me/ti/p/@your_line_id" // **โปรดแก้ไข Line ID ของคุณ**
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#00C300] text-white rounded-full shadow-lg hover:bg-[#00A000] transition-all duration-300 w-14 h-14 flex items-center justify-center"
                aria-label="Chat on Line"
              >
                <i className="fa-brands fa-line text-2xl"></i>
              </Link>
              {/* Facebook Button */}
              <Link
                href="https://m.me/your_facebook_page_id" // **โปรดแก้ไข Facebook Page ID ของคุณ**
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#1877F2] text-white rounded-full shadow-lg hover:bg-[#145CBF] transition-all duration-300 w-14 h-14 flex items-center justify-center"
                aria-label="Chat on Facebook Messenger"
              >
                <i className="fa-brands fa-facebook-messenger text-2xl"></i>
              </Link>
              {/* Email Button */}
              <Link
                href="mailto:your_email@example.com" // **โปรดแก้ไข Email ของคุณ**
                className="p-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 w-14 h-14 flex items-center justify-center"
                aria-label="Send an email"
              >
                <i className="fa-solid fa-envelope text-2xl"></i>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}