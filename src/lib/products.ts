export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

// In a real app this data would come from a database or API.
export const products: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    price: 19.99,
    image: '/images/product1.png',
  },
  {
    id: '2',
    name: 'Product 2',
    price: 29.99,
    image: '/images/product2.png',
  },
  {
    id: '3',
    name: 'Product 3',
    price: 39.99,
    image: '/images/product3.png',
  },
];