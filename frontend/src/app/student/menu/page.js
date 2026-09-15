'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { 
  UtensilsCrossed, 
  Search, 
  Plus, 
  Check, 
  ShoppingBag, 
  Sparkles, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';

function StudentMenuContent() {
  const { user } = useAuth();
  const { addItem, cartItems, setIsCartOpen, totalItemCount, totalAmount } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemMap, setAddedItemMap] = useState({});

  const fetchMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getMenu();
      if (res.success) {
        setItems(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to load menu. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAddToCart = (item) => {
    addItem(item, 1);
    // Temporary flash feedback
    setAddedItemMap(prev => ({ ...prev, [item.item_id]: true }));
    setTimeout(() => {
      setAddedItemMap(prev => ({ ...prev, [item.item_id]: false }));
    }, 1200);
  };

  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
  });

  const getItemQuantityInCart = (itemId) => {
    const match = cartItems.find(i => i.item_id === itemId);
    return match ? match.quantity : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-brand-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            Today's Fresh Daily Specials
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Student'}!
          </h1>
          <p className="text-orange-100 text-sm sm:text-base">
            Select your lunch or refreshments below. Your order will be immediately queued for preparation at the counter.
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Status */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes (Biryani, Meals...)"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />
        </div>

        <button
          onClick={fetchMenu}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Menu
        </button>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-medium">Fetching today's menu offerings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="font-bold text-red-800 text-sm">Failed to Load Menu</h3>
          <p className="text-xs text-red-600">{error}</p>
          <button
            onClick={fetchMenu}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700">No menu items found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery ? 'Try clearing your search query.' : 'The canteen has not published available items yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const inCartCount = getItemQuantityInCart(item.item_id);
            const isJustAdded = addedItemMap[item.item_id];

            return (
              <div
                key={item.item_id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-brand-300 transition flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                      Available
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description || 'Freshly prepared daily meal option.'}
                  </p>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 bg-slate-50/50">
                  <div className="py-3">
                    <span className="text-xs text-slate-400 block font-medium">Price</span>
                    <span className="text-lg font-black text-slate-900">₹{parseFloat(item.price).toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-brand-500 hover:bg-brand-600 active:scale-95 text-white'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Added
                      </>
                    ) : inCartCount > 0 ? (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Add ({inCartCount})
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Add to Tray
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Tray Summary on bottom right when items exist */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3.5 px-5 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-xl transition active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-white text-brand-600 text-[11px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                {totalItemCount}
              </span>
            </div>
            <span>View Tray & Order</span>
            <span className="pl-2 border-l border-brand-400 font-mono text-sm">
              ₹{totalAmount.toFixed(2)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function StudentMenuPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentMenuContent />
    </ProtectedRoute>
  );
}
