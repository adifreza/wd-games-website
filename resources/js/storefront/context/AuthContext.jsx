import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiLogin, apiLogout, apiMe, apiRegister, setAuthToken } from '../services/index.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'wdgames.jwt';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthToken(token || null);
  }, [token]);

  const refreshMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const me = await apiMe();
      setUser(me);
      return me;
    } catch {
      // token invalid/expired
      setUser(null);
      setToken('');
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
      return null;
    }
  }, [token]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      const accessToken = res?.access_token;
      if (!accessToken) throw new Error('Token not found');

      setToken(accessToken);
      localStorage.setItem(STORAGE_KEY, accessToken);
      setAuthToken(accessToken);

      await refreshMe();

      return true;
    } finally {
      setLoading(false);
    }
  }, [refreshMe]);

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    try {
      await apiRegister({ name, email, password });
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await apiLogout();
    } finally {
      setUser(null);
      setToken('');
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
    }
  }, [token]);

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, refreshMe }),
    [token, user, loading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
