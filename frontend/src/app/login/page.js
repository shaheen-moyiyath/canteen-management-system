'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  UtensilsCrossed, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap, 
  UserPlus, 
  LogIn,
  CheckCircle2 
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, user } = useAuth();

  // Primary mode: 'login' vs 'register'
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login role: 'student' vs 'admin'
  const [loginRole, setLoginRole] = useState('student');
  
  // Form fields
  const [name, setName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin' || roleParam === 'student') {
      setLoginRole(roleParam);
    }
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register' || modeParam === 'signup') {
      setActiveTab('register');
    }
  }, [searchParams]);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.push('/admin/dashboard');
      else router.push('/student/menu');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (activeTab === 'register') {
      // Registration validation
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!collegeId.trim()) {
        setError('Please enter your College ID (e.g. AZAYSCS055).');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify.');
        return;
      }

      setLoading(true);
      try {
        setSuccessMsg('Creating account in database...');
        await register(name.trim(), collegeId.trim().toUpperCase(), password, 'student');
      } catch (err) {
        setError(err.message || 'Registration failed. This College ID may already exist in the database.');
        setSuccessMsg('');
      } finally {
        setLoading(false);
      }
    } else {
      // Login validation
      if (!collegeId.trim() || !password.trim()) {
        setError('Please enter both College ID and password.');
        return;
      }

      setLoading(true);
      try {
        await login(collegeId.trim(), password, loginRole);
      } catch (err) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  const fillCredentials = (id, pass, role) => {
    setActiveTab('login');
    setLoginRole(role);
    setCollegeId(id);
    setPassword(pass);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Card Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-1">
            <UtensilsCrossed className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Canteen Portal</h1>
          <p className="text-xs text-slate-300">Amal College of Advanced Studies, Nilambur</p>
        </div>

        {/* PRIMARY TOP TABS: [ Sign In ] vs [ Create an Account ] */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl transition duration-200 ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-md font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <LogIn className="w-4 h-4 text-brand-500" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl transition duration-200 ${
              activeTab === 'register'
                ? 'bg-white text-emerald-800 shadow-md font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Create Account</span>
          </button>
        </div>

        {/* SUB-HEADER / ROLE TOGGLE */}
        {activeTab === 'login' ? (
          <div className="px-6 pt-5 pb-1 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Role:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setLoginRole('student');
                  setError('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  loginRole === 'student'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginRole('admin');
                  setError('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  loginRole === 'admin'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 pt-5 pb-1">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2 text-xs">
              <UserPlus className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>New Student Registration:</strong> Enter your details below to save your account in the database.</span>
            </div>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Full Name field (Register only) */}
          {activeTab === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammed Shaheen"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>
          )}

          {/* College ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {activeTab === 'register' 
                ? 'College Admission / ID' 
                : (loginRole === 'admin' ? 'Admin ID' : 'Student College ID')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder={
                  activeTab === 'register'
                    ? 'e.g. AZAYSCS055'
                    : (loginRole === 'admin' ? 'e.g. ADMIN01' : 'e.g. AZAYSCS032')
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition uppercase"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password {activeTab === 'register' && <span className="text-slate-400 font-normal lowercase">(min 6 chars)</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                required
              />
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {activeTab === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 group text-white ${
              activeTab === 'register'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-brand-500 hover:bg-brand-600'
            } disabled:opacity-50`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : activeTab === 'register' ? (
              <>
                <span>Register & Create Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </>
            ) : (
              <>
                <span>Sign In to {loginRole === 'admin' ? 'Admin Dashboard' : 'Student Menu'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </>
            )}
          </button>

          {/* Quick Demo Fillers (Only on Login tab) */}
          {activeTab === 'login' && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Quick Demo Accounts
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('AZAYSCS032', 'student123', 'student')}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition text-center"
                >
                  Student Demo
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('ADMIN01', 'admin123', 'admin')}
                  className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-medium text-amber-900 transition text-center"
                >
                  Admin Demo
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center p-12">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
