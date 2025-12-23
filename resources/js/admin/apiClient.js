import axios from 'axios';

export const adminApi = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
  },
});

export function setAdminAuthToken(token) {
  if (token) {
    adminApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete adminApi.defaults.headers.common.Authorization;
  }
}
