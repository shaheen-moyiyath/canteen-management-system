'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { api } from '../../../lib/api';
import { 
  History, 
  Calendar, 
  Clock, 
  Receipt, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';

function StudentHistoryContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getOrderHistory();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Collected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <Clock3 className="w-3 h-3" />
            Pending Pickup
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Your Order History</h1>
            <p className="text-xs text-slate-500">Track and view receipts for all your past meals</p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-medium">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="font-bold text-red-800 text-sm">Failed to Load Orders</h3>
          <p className="text-xs text-red-600">{error}</p>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No orders placed yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't submitted any canteen meal orders yet. Head to the Daily Menu to place your first meal order!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition hover:shadow-sm"
            >
              {/* Order Meta Header */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/80 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                    Order #{order.order_id}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {order.order_date}
                    </span>
                    {order.created_at && (
                      <span className="flex items-center gap-1 hidden sm:inline-flex">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="font-black text-slate-900 text-base">
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="p-6">
                <div className="divide-y divide-slate-100">
                  {order.items && order.items.map((item) => (
                    <div key={item.order_item_id || item.item_id} className="py-2.5 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{item.item_name}</span>
                        <span className="text-xs text-slate-400">× {item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 mr-2">@ ₹{parseFloat(item.unit_price).toFixed(2)}</span>
                        <span className="font-bold text-slate-800">
                          ₹{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentHistoryContent />
    </ProtectedRoute>
  );
}
