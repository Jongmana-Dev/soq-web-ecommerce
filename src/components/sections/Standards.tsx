export default function Standards(){
  const items = [
    ['NSF/ANSI', 'มาตรฐานสุขอนามัย'],
    ['ISO 9001', 'ระบบคุณภาพ'],
    ['GMP', 'การผลิตที่ดี'],
    ['Food Grade', 'ปลอดภัยสัมผัสอาหาร']
  ] as const
  return (
     <section id="standards" data-section="true" className="container py-24">
      <h2 className="text-2xl font-semibold">มาตรฐานโรงงาน</h2>
      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map(([title, sub]) => (
          <div key={title} className="card flex flex-col items-center gap-2 p-6 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" className="text-[--color-gold]"><path fill="currentColor" d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4l-6 4l1.5-7.5L2 9h7z"/></svg>
            <div className="font-medium">{title}</div>
            <div className="text-xs text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
