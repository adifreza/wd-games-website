import { api, setAuthToken as _setAuthToken } from './apiClient.js';
import {
  mockCreateOrder,
  mockGetGames,
  mockGetHddVariants,
  mockGetOrders,
  mockLogin,
  mockLogout,
  mockMe,
  mockRegister,
} from './mockApi.js';

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_API || '').toLowerCase() === 'true';

if (import.meta.env.DEV) {
  // Helpful debug signal: are we hitting Laravel API or mock API?
  // eslint-disable-next-line no-console
  console.info(`[WD Games Storefront] API mode: ${USE_MOCK ? 'MOCK' : 'REAL'}`);
}

export function setAuthToken(token) {
  _setAuthToken(token);
}

// Auth
export async function apiLogin(payload) {
  if (USE_MOCK) return mockLogin(payload);
  const { data } = await api.post('/auth/login', payload);
  return data;
}

export async function apiRegister(payload) {
  if (USE_MOCK) return mockRegister(payload);
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function apiMe() {
  if (USE_MOCK) return mockMe();
  const { data } = await api.get('/auth/me');
  return data;
}

export async function apiLogout() {
  if (USE_MOCK) return mockLogout();
  const { data } = await api.post('/auth/logout');
  return data;
}

// Catalog
export async function apiGetGames() {
  if (USE_MOCK) return mockGetGames();
  const { data } = await api.get('/games');
  return data;
}

export async function apiGetHddVariants() {
  if (USE_MOCK) return mockGetHddVariants();
  const { data } = await api.get('/hdd-variants');
  return data;
}

// Orders
export async function apiGetOrders() {
  if (USE_MOCK) return mockGetOrders();
  const { data } = await api.get('/orders');
  return data;
}

export async function apiCreateOrder(payload) {
  if (USE_MOCK) return mockCreateOrder(payload);
  const { data } = await api.post('/orders', payload);
  return data;
}
