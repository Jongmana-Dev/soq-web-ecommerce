'use client'

import { createContext, useContext } from 'react'
import type { ContactInfo } from '@/lib/cms'

const ContactInfoContext = createContext<ContactInfo>({
  phone: '',
  email: '',
  line_id: '',
  line_url: '',
  facebook_url: '',
  facebook_chat_url: '',
})

export function ContactInfoProvider({
  value,
  children,
}: {
  value: ContactInfo
  children: React.ReactNode
}) {
  return (
    <ContactInfoContext.Provider value={value}>
      {children}
    </ContactInfoContext.Provider>
  )
}

export function useContactInfo() {
  return useContext(ContactInfoContext)
}
