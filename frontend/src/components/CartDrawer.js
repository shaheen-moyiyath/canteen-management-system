'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ShoppingBag, X, Plus, Minus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  if (!isCartOpen) return null;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const payload = {
        items: cartItems.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity
        }))
      };

      const res = await api.placeOrder(payload);
      if (res.success) {
        setSuccessOrder(res.data);
        clearCart();
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (successOrder) {
      setSuccessOrder(null);
      router.push('/student/history');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold">Your Meal Tray</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Info Box */}
          <div className="bg-brand-50 border-b border-brand-100 px-6 py-3 text-xs text-brand-900 flex justify-between items-center">
            <div>
              <span className="font-semibold">{user?.name}</span> ({user?.college_id})
            </div>
            <span className="bg-brand-200 text-brand-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Token Counter Order
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {successOrder ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Order Confirmed!</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order Token ID:</span>
                    <span className="font-mono font-bold text-brand-600">#{successOrder.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-medium text-slate-800">{successOrder.order_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Payable at Counter:</span>
                    <span className="font-bold text-slate-900">₹{successOrder.total_amount}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Present your College ID (<span className="font-semibold">{user?.college_id}</span>) or Order #{successOrder.order_id} at the counter.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition shadow-md"
                >
                  View Order History
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-slate-600 font-medium">Your tray is empty</p>
                <p className="text-xs text-slate-400">Select fresh meal items from the daily menu to place your order.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {cartItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition"
                  >
                    <div className="flex-1 pr-2">
                      <h4 className="font-medium text-slate-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">₹{item.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[60px]">
                        <span className="text-xs font-bold text-slate-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item.item_id)}
                        className="text-slate-400 hover:text-red-500 p-1 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer / Checkout */}
          {!successOrder && cartItems.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Taxes & Service</span>
                  <span>₹0.00 (Subsidized)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-lg text-brand-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Payment is settled physically at the canteen pickup counter.
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <span>Submit Canteen Order (₹{totalAmount.toFixed(2)})</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
