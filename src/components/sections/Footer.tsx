import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }} />
            <div>
              <div className="text-sm font-semibold">SOQ</div>
              <div className="text-xs opacity-75">Premium Cleaners</div>
            </div>
          </div>

          <nav className="flex items-center gap-5 text-sm opacity-90">
            <Link href="#features" className="hover:opacity-100">Features</Link>
            <Link href="#faqs" className="hover:opacity-100">FAQs</Link>
            <Link href="#contact" className="hover:opacity-100">Contact</Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-xs opacity-70 flex items-center justify-between">
          <div>© {new Date().getFullYear()} SOQ. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:opacity-100">Privacy</a>
            <a href="#" className="hover:opacity-100">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
