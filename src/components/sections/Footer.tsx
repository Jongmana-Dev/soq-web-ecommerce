export default function Footer(){
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-2">
          <div className="text-xl font-semibold">SOQ</div>
          <p className="text-sm text-muted-foreground">Premium Brewing Care</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-medium">เมนู</div>
          <ul className="space-y-1">
            <li><a href="#features" className="text-muted-foreground hover:text-foreground">ฟีเจอร์</a></li>
            <li><a href="#products" className="text-muted-foreground hover:text-foreground">สินค้า</a></li>
            <li><a href="#pricing" className="text-muted-foreground hover:text-foreground">แพ็กเกจ</a></li>
            <li><a href="#faq" className="text-muted-foreground hover:text-foreground">คำถามที่พบบ่อย</a></li>
          </ul>
        </div>
        <form className="space-y-3 text-sm">
          <div className="font-medium">อัปเดตโปรโมชั่น</div>
          <input className="h-10 w-full rounded-md border border-border bg-transparent px-3" placeholder="อีเมลของคุณ" />
          <button className="btn-glint rounded-full bg-foreground px-5 py-2 text-background">Subscribe</button>
        </form>
      </div>
      <div className="container mt-10 flex items-center justify-between text-xs text-muted-foreground">
        <div>© {year} SOQ. All rights reserved.</div>
        <div className="text-xs">Built with Next.js 15 + Tailwind v4</div>
      </div>
    </footer>
  )
}
