import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Methods
export const apiService = {
  // Auth
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.data.token) {
      await AsyncStorage.setItem('authToken', response.data.data.token);
    }
    return response.data;
  },

  async register(email: string, password: string, name: string) {
    const response = await api.post('/auth/register', { email, password, name });
    if (response.data.data.token) {
      await AsyncStorage.setItem('authToken', response.data.data.token);
    }
    return response.data;
  },

  // Quick Entry - Super Fast!
  async quickEntry(amount: number, category: string, type: 'EXPENSE' | 'INCOME' = 'EXPENSE') {
    const response = await api.post('/transactions/quick', { amount, category, type });
    return response.data;
  },

  // Get category suggestions
  async getCategorySuggestions() {
    const response = await api.get('/transactions/categories/suggestions');
    return response.data.data.suggestions;
  },

  // Get transactions
  async getTransactions(limit = 50) {
    const response = await api.get(`/transactions?limit=${limit}`);
    return response.data;
  },

  // Update transaction
  async updateTransaction(id: string, data: {
    amount?: number;
    category?: string;
    type?: 'EXPENSE' | 'INCOME';
    description?: string;
  }) {
    const response = await api.patch(`/transactions/${id}`, data);
    return response.data;
  },

  // Delete transaction
  async deleteTransaction(id: string) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // Get stats
  async getStats() {
    const response = await api.get('/stats');
    return response.data.data;
  },

  // Get user info
  async getUserInfo() {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  // Logout
  async logout() {
    await AsyncStorage.removeItem('authToken');
  },
};

export default api;
