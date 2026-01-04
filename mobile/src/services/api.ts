import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROD_API_URL = 'https://quick-finance-1i2h.onrender.com/api';
const DEV_API_URL = 'http://localhost:3000/api';

const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

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

  async googleSignIn(idToken: string) {
    const response = await api.post('/auth/google', { idToken });
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

  // Get trend data
  async getTrend() {
    const response = await api.get('/stats/trend');
    return response.data.data;
  },

  // Get user info
  async getUserInfo() {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  // Update user profile
  async updateProfile(data: { firstName?: string; lastName?: string; name?: string }) {
    const response = await api.patch('/auth/profile', data);
    return response.data.data;
  },

  // Logout
  async logout() {
    await AsyncStorage.removeItem('authToken');
  },

  // Delete Account
  async deleteAccount() {
    const response = await api.delete('/auth/account');
    await AsyncStorage.removeItem('authToken');
    return response.data;
  },

  // Recurring Transactions
  async getRecurring() {
    const response = await api.get('/recurring');
    return response.data;
  },

  async createRecurring(data: {
    amount: number;
    type: 'EXPENSE' | 'INCOME';
    category: string;
    description?: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval: number;
    startDate: string;
    endDate?: string;
  }) {
    const response = await api.post('/recurring', data);
    return response.data;
  },

  async updateRecurring(id: string, data: {
    amount?: number;
    category?: string;
    description?: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    endDate?: string | null;
    isActive?: boolean;
  }) {
    const response = await api.patch(`/recurring/${id}`, data);
    return response.data;
  },

  async deleteRecurring(id: string) {
    const response = await api.delete(`/recurring/${id}`);
    return response.data;
  },

  async processRecurring() {
    const response = await api.post('/recurring/process');
    return response.data;
  },

  // Favorite Categories
  async getFavoriteCategories(type?: 'EXPENSE' | 'INCOME') {
    const response = await api.get('/categories/favorites', {
      params: type ? { type } : {},
    });
    return response.data.data;
  },

  async addFavoriteCategory(data: {
    category: string;
    emoji: string;
    type: 'EXPENSE' | 'INCOME';
    order?: number;
  }) {
    const response = await api.post('/categories/favorites', data);
    return response.data.data;
  },

  async updateFavoriteCategory(id: string, data: {
    emoji?: string;
    order?: number;
  }) {
    const response = await api.patch(`/categories/favorites/${id}`, data);
    return response.data.data;
  },

  async deleteFavoriteCategory(id: string) {
    const response = await api.delete(`/categories/favorites/${id}`);
    return response.data;
  },

  async getAllCategories(type?: 'EXPENSE' | 'INCOME') {
    const response = await api.get('/categories/all', {
      params: type ? { type } : {},
    });
    return response.data.data;
  },
};

export default api;
