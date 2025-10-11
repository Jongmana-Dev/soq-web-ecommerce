export default function Pricing(){
  const tiers = [
    ['Starter', 'เริ่มต้นทำคราฟท์ที่บ้าน', '990'],
    ['Brewpub', 'เหมาะกับร้านขนาดกลาง', '2,900'],
    ['Pro', 'สำหรับโรงเบียร์/โรงงาน', '9,900']
  ] as const
  return (
    <section id="pricing" className="container py-24">
      <h2 className="text-2xl font-semibold">แพ็กเกจ</h2>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {tiers.map(([tier, desc, price]) => (
          <div key={tier} className="card p-6">
            <div className="text-lg font-medium">{tier}</div>
            <div className="my-2 text-3xl font-bold">฿{price}</div>
            <p className="text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
