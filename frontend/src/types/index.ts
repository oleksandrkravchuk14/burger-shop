export interface Product {
    id: string;
    name: string;
    price: number;
    image: string | null;
    categoryId: number;
    shopId: string;
    createdAt: string;
  }
  
  export interface Shop {
    id: string;
    name: string;
    rating: number;
    products?: Product[];
  }
  
  export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
  }
  
  export interface Order {
    userName: string;
    email: string;
    phone: string;
    address: string;
    items: OrderItem[];
    totalPrice: number;
  }