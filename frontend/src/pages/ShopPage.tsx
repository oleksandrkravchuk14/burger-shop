import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Shop, Product } from '../types';
import { useCart } from '../context/CartContext';

const ShopPage = () => {
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt'>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const { addToCart } = useCart();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    api.get('/shops').then(res => {
      console.log("Отримані магазини:", res.data);
      setShops(res.data);
    });
  }, []);
  
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedShopId) params.append('shopId', selectedShopId);
    if (selectedCategory !== null) params.append('categoryId', String(selectedCategory));
    
    params.append('sortBy', sortBy);
    params.append('order', order);

    const url = `/products?${params.toString()}`;
    console.log("Відправляю запит:", url); 

    api.get(url)
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => console.error("Помилка завантаження товарів:", err));
      
  }, [selectedShopId, selectedCategory, sortBy, order]);

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-[1440px] mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          
          {/* ЛІВА ПАНЕЛЬ - Магазини */}
          <aside className="w-full md:w-1/4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200 md:sticky md:top-8">
              <div className="flex justify-between items-center mb-5 ml-2">
                <h3 className="text-xl font-black text-gray-800 tracking-tight">Shops</h3>
                {/* Фільтр рейтингу (чисто візуальний або можна прив'язати до запиту) */}
                <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-lg uppercase">Top Rated</span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Кнопка "Всі магазини" */}
                <button 
                  onClick={() => {
                    setSelectedShopId(null);
                    setSelectedCategory(null);
                  }}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
                    selectedShopId === null 
                      ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                      : 'bg-gray-50 text-gray-600 border-transparent hover:bg-white hover:shadow-md'
                  }`}
                >
                  <span className="font-bold block">All Shops</span>
                  <span className="text-xs opacity-70">Show everything</span>
                </button>
  
                <div className="h-px bg-gray-100 my-1" />
  
                {shops.length > 0 ? (
                  shops.map(shop => (
                    <button 
                      key={shop.id} 
                      onClick={() => {
                        setSelectedShopId(shop.id);
                        setSelectedCategory(null);
                      }}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
                        selectedShopId === shop.id 
                          ? 'bg-orange-500 text-white border-orange-500 shadow-orange-100 shadow-xl scale-[1.02]' 
                          : 'bg-gray-50 text-gray-600 border-transparent hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold block">{shop.name}</span>
                        <span className="text-xs font-black bg-white/20 px-1.5 py-0.5 rounded-md">⭐ {shop.rating}</span>
                      </div>
                      <span className="text-xs opacity-80">{shop.rating > 4.5 ? 'Highly recommended' : 'Fast delivery'}</span>
                    </button>
                  ))
                ) : (
                  <div className="py-4 text-center text-gray-400 text-sm animate-pulse">Loading shops...</div>
                )}
              </div>
            </div>
          </aside>
  
          {/* ПРАВА ПАНЕЛЬ - Товари */}
          <main className="w-full md:w-3/4">
            
            {/* ВЕРХНЯ ПАНЕЛЬ: Категорії + Сортування */}
            <div className="flex flex-col gap-6 mb-8">
              
              {/* Фільтри категорій */}
              <div className="bg-white p-3 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-3 overflow-hidden">
                <span className="hidden lg:block ml-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Categories</span>
                <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl overflow-x-auto no-scrollbar w-full flex-nowrap">
                  {[
                    { id: null, name: 'All' },
                    { id: 1, name: 'Burgers' },
                    { id: 2, name: 'Drinks' },
                    { id: 3, name: 'Desserts' },
                    { id: 4, name: 'Sides' }
                  ].map(cat => (
                    <button 
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-7 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                        selectedCategory === cat.id 
                          ? 'bg-white text-orange-500 shadow-sm ring-1 ring-gray-200' 
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Заголовок секції та СОРТУВАННЯ */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  {selectedShopId ? shops.find(s => s.id === selectedShopId)?.name : 'Fresh Menu'}
                </h2>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3 hidden sm:block">Sort:</span>
                  <select 
                    value={`${sortBy}-${order}`}
                    onChange={(e) => {
                      const [newSort, newOrder] = e.target.value.split('-') as [any, any];
                      setSortBy(newSort);
                      setOrder(newOrder);
                    }}
                    className="bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-xl outline-none border-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer text-sm"
                  >
                    <option value="name-asc">A → Z</option>
                    <option value="name-desc">Z → A</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="createdAt-desc">Newest First</option>
                  </select>
                </div>
              </div>
            </div>
  
            {/* Сітка товарів */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map(product => (
                  <div key={product.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 group flex flex-col">
                    <div className="relative w-full h-44 bg-gray-50 rounded-[1.8rem] mb-5 overflow-hidden flex items-center justify-center">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-500">
                      {
                      product.categoryId === 1 ? '🍔' : 
                      product.categoryId === 2 ? '🥤' : 
                        product.categoryId === 3 ? '🍦' : 
                          product.categoryId === 4 ? '🍟' : '🍽️'
                      }
                      </div>
                       {/* Бейдж для нових товарів */}
                       {new Date(product.createdAt).getTime() > Date.now() - 86400000 && (
                         <span className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">NEW</span>
                       )}
                    </div>
                    
                    <h4 className="font-black text-xl text-gray-800 px-2 line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-gray-400 px-2 mt-1">Best ingredients only</p>
                    
                    <div className="flex-grow min-h-[20px]" />
  
                    <div className="flex items-center justify-between mt-4 px-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Price</span>
                        <span className="text-xl font-black text-orange-600">
                          {product.price} <small className="text-[10px] uppercase">UAH</small>
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          console.log("Додано:", product.name);
                          addToCart(product);
                        }}
                        className="bg-gray-900 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg flex items-center gap-2 group/btn"
                      >
                        <span className="group-hover/btn:translate-x-1 transition-transform">Add</span>
                        <span className="text-lg">+</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                  <div className="text-5xl mb-4 opacity-20">🍽️</div>
                  <p className="text-gray-400 font-bold text-lg">No products found</p>
                  <p className="text-gray-300 text-sm">Try changing filters or shop</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;