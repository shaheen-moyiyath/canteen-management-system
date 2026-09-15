'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, UserCheck, ShieldCheck, ArrowRight, Clock, ChefHat, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/menu');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-orange-50/40 to-slate-50 border-b border-slate-200/80 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-semibold uppercase tracking-wider shadow-xs">
            <UtensilsCrossed className="w-3.5 h-3.5 text-brand-600" />
            Amal College of Advanced Studies
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Canteen Ordering System <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 to-amber-600 bg-clip-text text-transparent">
              A Digital Solution for Campus Meals
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg">
            Say goodbye to morning rush lines and manual tally sheets. Pre-order your daily campus meals in seconds, while the canteen kitchen gets accurate real-time cooking tallies.
          </p>

          {/* Quick Action Portals */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            <Link
              href="/login?role=student"
              className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition group"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition">
                    Student Portal
                  </div>
                  <p className="text-xs text-slate-500">Order daily meals & track history</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/login?role=admin"
              className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition group"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition">
                    Admin Portal
                  </div>
                  <p className="text-xs text-slate-500">Live order tallies & reports</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Pre-Order Before Cut-Off</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Students confirm meals from home or class before morning cut-off hours, eliminating lunchtime queue anxiety.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Real-Time Kitchen Tallies</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kitchen staff view exact aggregate quantities (e.g., 52 Veg Thali, 35 Chicken Biryani) to prepare optimal portions and cut waste.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Instant Counter Verification</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Fast counter pickup verified against student College ID number, with daily financial and order reconciliation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer info */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>Department of Computer Science - Fifth Semester Major Project (FYUGP)</div>
          <div>Amal College of Advanced Studies, Nilambur</div>
        </div>
      </footer>
    </div>
  );
}
