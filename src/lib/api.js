import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getToken, setStoredUser, setToken } from './storage';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onForcedSignOut = null;

/** Allow the AuthProvider to receive forced sign-out events. */
export function setForcedSignOutHandler(fn) {
  onForcedSignOut = fn;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || '';
    if (status === 403 && /disabled/i.test(msg)) {
      try {
        await setToken(null);
        await setStoredUser(null);
      } catch {}
      if (onForcedSignOut) onForcedSignOut(msg);
    }
    return Promise.reject(err);
  }
);

