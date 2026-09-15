'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { api } from '../../../lib/api';
import { 
  LayoutDashboard, 
  ChefHat, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';

function AdminDashboardContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchDashboard = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.getDashboard();
      if (res.success) {
        setData(res);
        setError('');
      }
    } catch (err) {
      if (!isSilent) setError(err.message || 'Failed to load live dashboard.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto-refresh interval (every 15 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchDashboard(true);
    }, 15000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchDashboard]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await fetchDashboard(true);
    } catch (err) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const filteredOrders = data?.orders?.filter(order => {
    const q = searchQuery.toLowerCase();
    return (
      order.student_name?.toLowerCase().includes(q) ||
      order.college_id?.toLowerCase().includes(q) ||
      String(order.order_id).includes(q)
    );
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Live Canteen Kitchen Dashboard</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                ● LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-time daily preparation counts & student counter verification | Date: <span className="font-semibold text-slate-700">{data?.date || 'Today'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-brand-500 focus:ring-brand-400"
            />
            Auto-refresh (15s)
          </label>

          <button
            onClick={() => fetchDashboard(false)}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders Today</p>
            <p className="text-2xl font-black text-slate-900">{data?.stats?.total_orders ?? 0}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collection</p>
            <p className="text-2xl font-black text-slate-900">₹{data?.stats?.total_revenue ?? '0.00'}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Pickup</p>
            <p className="text-2xl font-black text-amber-600">{data?.stats?.pending_count ?? 0}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Meals Collected</p>
            <p className="text-2xl font-black text-emerald-600">{data?.stats?.completed_count ?? 0}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Item-Wise Breakdown Kitchen Tallies */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900">Kitchen Preparation Meal Tallies</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Updated automatically</span>
        </div>

        <div className="p-6">
          {!data?.item_tally || data.item_tally.length === 0 ? (
            <p className="text-center py-6 text-sm text-slate-400">No menu items found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.item_tally.map((item) => (
                <div
                  key={item.item_id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-300 transition flex items-center justify-between shadow-xs"
                >
                  <div className="space-y-1 pr-2">
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-slate-500">Sales: ₹{item.total_sales}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-brand-600 font-mono">
                      {item.total_quantity}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Portions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Counter Verification Student Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Counter Pickup Verification List</h2>
            </div>
            <p className="text-xs text-slate-500">
              Verify student identity via College ID and mark collected meals
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Name or Order #..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Order Token</th>
                <th className="px-6 py-3.5">Student / College ID</th>
                <th className="px-6 py-3.5">Ordered Items</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Counter Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No matching orders placed today.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isUpdating = statusUpdatingId === order.order_id;

                  return (
                    <tr key={order.order_id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        #{order.order_id}
                        <div className="text-[10px] font-normal text-slate-400">
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{order.student_name}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{order.college_id}</div>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <div className="space-y-1">
                          {order.items?.map((item) => (
                            <div key={item.order_item_id || item.item_id} className="text-slate-800">
                              <span className="font-bold text-brand-600">{item.quantity}×</span> {item.item_name}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-black text-slate-900 text-sm">
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        {order.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            Collected
                          </span>
                        ) : order.status === 'cancelled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                            Pending Pickup
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(order.order_id, 'completed')}
                              disabled={isUpdating}
                              title="Confirm Student Picked Up Meal"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Handover
                            </button>
                          )}

                          {order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(order.order_id, 'cancelled')}
                              disabled={isUpdating}
                              title="Cancel Order"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 disabled:opacity-50 rounded-lg text-xs font-medium transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
