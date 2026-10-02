const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('canteen_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to reach backend API. Ensure Express server is running on port 5000.');
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiRequest('/auth/me'),

  // Student
  getMenu: () => apiRequest('/menu'),
  placeOrder: (orderPayload) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(orderPayload) }),
  getOrderHistory: () => apiRequest('/orders/history'),

  // Admin
  getAdminMenu: () => apiRequest('/admin/menu'),
  createMenuItem: (item) => apiRequest('/admin/menu', { method: 'POST', body: JSON.stringify(item) }),
  updateMenuItem: (id, item) => apiRequest(`/admin/menu/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  deleteMenuItem: (id) => apiRequest(`/admin/menu/${id}`, { method: 'DELETE' }),

  getDashboard: () => apiRequest('/admin/dashboard'),
  getDailyReport: (date) => apiRequest(`/admin/reports/daily${date ? `?date=${date}` : ''}`),
  updateOrderStatus: (orderId, status) => apiRequest(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
};
