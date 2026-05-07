import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { api, setForcedSignOutHandler } from '../lib/api';
import { getStoredUser, getToken, setStoredUser, setToken } from '../lib/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [token, storedUser] = await Promise.all([getToken(), getStoredUser()]);
        if (mounted) setUser(token ? storedUser : null);
      } finally {
        if (mounted) setBooting(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setForcedSignOutHandler((message) => {
      setUser(null);
      Alert.alert('Signed out', message || 'Your account has been disabled.');
    });
    return () => setForcedSignOutHandler(null);
  }, []);

  const signIn = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    await setToken(res.data.token);
    await setStoredUser(res.data.user);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post('/auth/register', payload);
    await setToken(res.data.token);
    await setStoredUser(res.data.user);
    setUser(res.data.user);
  }, []);

  const signOut = useCallback(async () => {
    await setToken(null);
    await setStoredUser(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const res = await api.get('/auth/me');
    await setStoredUser(res.data.user);
    setUser(res.data.user);
  }, []);

  const value = useMemo(() => ({ booting, user, signIn, register, signOut, refreshMe }), [booting, user, signIn, register, signOut, refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

