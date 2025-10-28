import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
        <div className="flex items-center gap-2">
          <span className="badge-gold">SOQ</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="#features">Features</Link>
          <Link href="#faqs">FAQs</Link>
          <Link href="#contact">Contact</Link>
        </nav>
      </div>
    </footer>
  )
}
