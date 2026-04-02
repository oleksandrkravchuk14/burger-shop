import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import { ShoppingCart, Store } from 'lucide-react';

const Navbar = () => {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex gap-8 items-center">
        <Link to="/" className="text-2xl font-black text-orange-500 tracking-tighter flex items-center gap-2">
          <Store size={28} />
          <span>BURGER<span className="text-gray-900">SHOP</span></span>
        </Link>
        
        <Link to="/" className="font-bold text-gray-500 hover:text-orange-500 transition-colors flex items-center gap-2">
          Shop
        </Link>
      </div>

      <Link to="/cart" className="relative group p-2 bg-gray-50 rounded-xl hover:bg-orange-50 transition-all border border-transparent hover:border-orange-100">
        <div className="flex items-center gap-3 px-2">
          <ShoppingCart size={22} className="text-gray-700 group-hover:text-orange-500 transition-colors" />
          <span className="font-bold text-gray-700 group-hover:text-orange-600 hidden sm:block">Cart</span>
          
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md group-hover:scale-110 transition-transform">
              {totalItems}
            </span>
          )}
        </div>
      </Link>
    </nav>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<ShopPage />} />
              <Route path="/cart" element={<CartPage />} />
              {/* Редирект, якщо шлях не знайдено */}
              <Route path="*" element={<ShopPage />} />
            </Routes>
          </main>

          <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100 bg-white">
            © 2026 Burger Shop Delivery. All rights reserved.
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;