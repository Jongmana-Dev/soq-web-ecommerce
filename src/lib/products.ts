export type Product = { slug:string; name:string; price:number; short:string; description:string; images:string[] }
const U = (id: string) => `https://images.unsplash.com/${id}?q=80&w=1600&auto=format&fit=crop`
const P = (id: number) => `https://picsum.photos/id/${id}/1200/800`
const products: Product[] = [
  { slug:'star-san-sanitizer', name:'Star San Sanitizer', price:450, short:'โฟมซานิไทซ์สำหรับงานคราฟท์เบียร์', description:'ฆ่าเชื้อไวใน 1 นาที เหมาะกับสแตนเลสและผิวสัมผัสอาหาร', images:[P(1039),P(1027),U('photo-1502877338535-766e1452684a')] },
  { slug:'pbw-cleaner', name:'PBW Cleaner', price:380, short:'ผงทำความสะอาดคราบเข้มข้น', description:'ขจัดคราบโปรตีน/คราบหินปูน ไม่ทำลายพื้นผิว', images:[U('photo-1519681393784-d120267933ba'),P(1011),P(1015)] },
  { slug:'acid-rinse', name:'Acid Rinse', price:520, short:'กรดอ่อนสำหรับล้างคราบหินปูนหลังต้ม', description:'pH-balanced สำหรับงานเบียร์โดยเฉพาะ', images:[P(1006),U('photo-1508057198894-247b23fe5ade'),P(1002)] }
]
export function listProducts(){ return products }
export function getProductBySlug(slug:string){ return products.find(p=>p.slug===slug) }
