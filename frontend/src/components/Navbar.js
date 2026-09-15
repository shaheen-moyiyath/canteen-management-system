'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  History, 
  LayoutDashboard, 
  Settings2, 
  FileText, 
  LogOut, 
  User, 
  Menu, 
  X 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is not logged in or on login page, don't display authenticated navbar
  if (!user || pathname === '/login' || pathname === '/') {
    return null;
  }

  const isAdmin = user.role === 'admin';

  const studentLinks = [
    { href: '/student/menu', label: 'Daily Menu', icon: UtensilsCrossed },
    { href: '/student/history', label: 'Order History', icon: History },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    { href: '/admin/menu', label: 'Menu Management', icon: Settings2 },
    { href: '/admin/reports', label: 'Daily Reports', icon: FileText },
  ];

  const navLinks = isAdmin ? adminLinks : studentLinks;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-brand-600 to-brand-500 text-white p-2 rounded-xl shadow-sm">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <Link href={isAdmin ? '/admin/dashboard' : '/student/menu'} className="font-bold text-slate-800 text-base sm:text-lg tracking-tight hover:text-brand-600 transition">
                Canteen Order System
              </Link>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isAdmin 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {isAdmin ? 'Admin Portal' : 'Student Portal'}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">| Amal College</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Student Cart Trigger */}
            {!isAdmin && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-semibold shadow-sm transition active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Tray</span>
                {totalItemCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-brand-600 bg-white rounded-full">
                    {totalItemCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile Badge */}
            <div className="hidden lg:flex items-center gap-2 text-xs border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg">
              <User className="w-4 h-4 text-slate-500" />
              <div className="text-left">
                <div className="font-semibold text-slate-800 max-w-[120px] truncate">{user.name}</div>
                <div className="text-slate-500 text-[11px]">{user.college_id}</div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <div className="py-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">{user.name}</span>{' '}
              <span className="text-slate-500">({user.college_id})</span>
            </div>
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
