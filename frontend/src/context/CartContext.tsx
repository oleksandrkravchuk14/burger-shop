import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Описуємо тип товару в кошику
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
    categoryId?: number; 
    shopId?: string;   
  }

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Завантажуємо кошик з LocalStorage при старті
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('burger-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Зберігаємо кошик щоразу, коли він змінюється
  useEffect(() => {
    localStorage.setItem('burger-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

// Хук для зручного використання контексту
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};