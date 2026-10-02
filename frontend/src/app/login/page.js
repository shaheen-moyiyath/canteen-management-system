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
  CheckCircle2 
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, user } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  
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
      setSelectedRole(roleParam);
    }
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') {
      setIsRegister(true);
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

    if (isRegister) {
      // Registration validation
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!collegeId.trim()) {
        setError('Please enter your College ID.');
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
        setSuccessMsg('Creating your account...');
        await register(name.trim(), collegeId.trim().toUpperCase(), password, 'student');
      } catch (err) {
        setError(err.message || 'Registration failed. College ID might already be registered.');
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
        await login(collegeId.trim(), password, selectedRole);
      } catch (err) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  const fillCredentials = (id, pass, role) => {
    setIsRegister(false);
    setSelectedRole(role);
    setCollegeId(id);
    setPassword(pass);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-2xl bg-white/10 backdrop-blur-md mb-1">
            {isRegister ? (
              <UserPlus className="w-6 h-6 text-emerald-400" />
            ) : (
              <UtensilsCrossed className="w-6 h-6 text-brand-400" />
            )}
          </div>
          <h1 className="text-xl font-bold">
            {isRegister ? 'Create Student Account' : 'Canteen Portal Login'}
          </h1>
          <p className="text-xs text-slate-300">
            {isRegister 
              ? 'Register once to order daily meals & snacks'
              : 'Amal College of Advanced Studies, Nilambur'}
          </p>
        </div>

        {/* Role Switcher (Only in Login Mode) */}
        {!isRegister ? (
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                selectedRole === 'student'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                selectedRole === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Admin / Canteen
            </button>
          </div>
        ) : (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-800 font-medium flex items-center justify-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Student Self-Registration Portal</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
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

          {/* Full Name (Registration only) */}
          {isRegister && (
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>
          )}

          {/* College ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isRegister ? 'College Admission / ID' : (selectedRole === 'admin' ? 'Admin ID' : 'Student College ID')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder={isRegister ? 'e.g. AZAYSCS055' : (selectedRole === 'admin' ? 'e.g. ADMIN01' : 'e.g. AZAYSCS032')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password {isRegister && <span className="text-slate-400 font-normal lowercase">(min 6 chars)</span>}
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

          {/* Confirm Password (Registration only) */}
          {isRegister && (
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 group mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isRegister ? (
              <>
                <span>Create Account & Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </>
            ) : (
              <>
                <span>Sign In to {selectedRole === 'admin' ? 'Admin Dashboard' : 'Student Menu'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </>
            )}
          </button>

          {/* Toggle between Login and Register */}
          <div className="text-center pt-2">
            {isRegister ? (
              <p className="text-xs text-slate-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2 ml-1"
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                New student?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setSelectedRole('student');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2 ml-1"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>

          {/* Quick Demo Credentials helper (Only on login) */}
          {!isRegister && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Quick Demo Fillers
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
