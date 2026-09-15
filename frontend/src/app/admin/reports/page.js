'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { api } from '../../../lib/api';
import { 
  FileText, 
  Calendar, 
  Printer, 
  Download, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle,
  Building
} from 'lucide-react';

function AdminReportsContent() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async (dateToFetch) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getDailyReport(dateToFetch || selectedDate);
      if (res.success) {
        setReport(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch daily report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Control Toolbar (Hidden when printing) */}
      <div className="no-print bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Daily Static Summary Reports</h1>
            <p className="text-xs text-slate-500">Order reconciliation, item popularity tally & revenue documentation</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none"
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 no-print">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-medium">Generating reconciliation report...</p>
        </div>
      ) : report ? (
        /* Printable Report Sheet */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Official Report Header */}
          <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest">
                <Building className="w-4 h-4" />
                Amal College of Advanced Studies, Nilambur
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Daily Canteen Order Summary Report
              </h2>
              <p className="text-xs text-slate-500">
                Generated for Date: <span className="font-bold text-slate-800">{report.report_date}</span>
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 font-mono">
              <div>Ref: RPT-{report.report_date.replace(/-/g, '')}</div>
              <div>Generated: {new Date(report.generated_at).toLocaleString()}</div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{report.summary.total_orders}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50">
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Sales</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">₹{report.summary.total_revenue}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Collected Meals</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{report.summary.completed_orders}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending / Cancelled</p>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {report.summary.pending_orders} <span className="text-xs font-normal text-slate-400">/ {report.summary.cancelled_orders}</span>
              </p>
            </div>
          </div>

          {/* Section 1: Item Popularity & Consumption Breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              1. Item-Wise Sales & Portion Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Item Name</th>
                    <th className="py-2.5 px-4 text-center">Unit Price</th>
                    <th className="py-2.5 px-4 text-center">Quantity Prepared/Sold</th>
                    <th className="py-2.5 px-4 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {report.item_breakdown.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-slate-400">
                        No item sales recorded for this date.
                      </td>
                    </tr>
                  ) : (
                    report.item_breakdown.map((item) => (
                      <tr key={item.item_id}>
                        <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                        <td className="py-3 px-4 text-center">₹{item.revenue_generated && item.quantity_sold ? (item.revenue_generated / item.quantity_sold).toFixed(2) : '—'}</td>
                        <td className="py-3 px-4 text-center font-bold text-brand-600">{item.quantity_sold} portions</td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">₹{item.revenue_generated}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Student Order Audit Trail */}
          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              2. Student Orders Audit Trail
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Order ID</th>
                    <th className="py-2.5 px-4">Student Name</th>
                    <th className="py-2.5 px-4">College ID</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {report.orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400">
                        No orders registered on this date.
                      </td>
                    </tr>
                  ) : (
                    report.orders.map((o) => (
                      <tr key={o.order_id}>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">#{o.order_id}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{o.student_name}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{o.college_id}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            o.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-slate-900">
                          ₹{parseFloat(o.total_amount).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signoff block for paper print */}
          <div className="pt-12 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-800">Canteen Manager Signature</p>
              <div className="h-10 border-b border-dashed border-slate-300 w-48 mt-2"></div>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Auditor / Faculty In-Charge</p>
              <div className="h-10 border-b border-dashed border-slate-300 w-48 mt-2"></div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminReportsContent />
    </ProtectedRoute>
  );
}
