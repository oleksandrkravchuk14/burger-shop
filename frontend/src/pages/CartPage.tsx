import { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/axios'; 

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Валідація Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Будь ласка, введіть коректну електронну пошту.");
      return;
    }

    // 2. Валідація телефону (тільки цифри, мінімум 10)
    const phoneRegex = /^\d{10,}$/;
    const cleanPhone = formData.phone.replace(/\D/g, ''); // видаляємо все крім цифр для перевірки
    if (!phoneRegex.test(cleanPhone)) {
      alert("Введіть коректний номер телефону (мінімум 10 цифр).");
      return;
    }

    if (!formData.name || !formData.address) {
      alert("Будь ласка, заповніть всі поля.");
      return;
    }

    try {
      setLoading(true);
      
      // Відправка в БД
      const response = await api.post('/orders', {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        totalPrice: totalPrice,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      });

      if (response.status === 201 || response.status === 200) {
        alert("🎉 Замовлення прийнято! Смачного!");
        clearCart();
        setFormData({ name: '', email: '', phone: '', address: '' });
      }
    } catch (error: any) {
      console.error("Order submit error:", error);
      alert("Помилка при відправці замовлення. Перевірте з'єднання з сервером.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8 text-gray-900">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* ЛІВА ПАНЕЛЬ (Форма) */}
        <div className="w-full md:w-1/2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 h-fit">
          <h2 className="text-2xl font-black mb-6">Delivery Details</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {[
              { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter your name...' },
              { id: 'email', label: 'Email', type: 'email', placeholder: 'example@mail.com' },
              { id: 'phone', label: 'Phone', type: 'text', placeholder: '0931234567' }
            ].map((field) => (
              <div key={field.id} className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-widest">
                  {field.label}
                </label>
                <input 
                  type={field.type}
                  name={field.id}
                  value={(formData as any)[field.id]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full p-4 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                />
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-widest">Address</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Where should we bring the food?"
                className="w-full p-4 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all font-medium h-32 resize-none"
              />
            </div>
          </form>
        </div>

        {/* ПРАВА ПАНЕЛЬ (Товари) */}
        <div className="w-full md:w-1/2">
          <div className="bg-white p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col max-h-none md:max-h-[calc(100vh-100px)]">
            <h2 className="text-2xl font-black mb-6 px-2">Order Summary</h2>
            
            <div className="overflow-y-auto pr-2 no-scrollbar flex flex-col gap-4">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-[1.8rem] border border-gray-50">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl md:text-3xl shadow-sm">
                      {item.categoryId === 2 ? '🥤' : '🍔'}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-gray-800 truncate">{item.name}</h4>
                      <p className="text-orange-600 font-black">{item.price} UAH</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:bg-gray-100 font-bold"
                        >-</button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:bg-gray-100 font-bold"
                        >+</button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-400 font-medium">Cart is empty 🍔</div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 px-2">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total:</span>
                <span className="text-3xl font-black text-gray-800">{totalPrice} UAH</span>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={cart.length === 0 || loading}
                className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xl shadow-lg transition-all active:scale-95 disabled:bg-gray-200"
              >
                {loading ? "Sending..." : "Submit Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;