'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check saved session on mount
    const savedToken = localStorage.getItem('canteen_token');
    const savedUser = localStorage.getItem('canteen_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('canteen_token');
        localStorage.removeItem('canteen_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (college_id, password, role) => {
    const res = await api.login({ college_id, password, role });
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('canteen_token', res.token);
      localStorage.setItem('canteen_user', JSON.stringify(res.user));

      // Role-based redirect
      if (res.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/menu');
      }
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, college_id, password, role = 'student') => {
    const res = await api.register({ name, college_id, password, role });
    if (res.success) {
      // Automatically log in newly created user
      return await login(college_id, password, role);
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('canteen_token');
    localStorage.removeItem('canteen_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
