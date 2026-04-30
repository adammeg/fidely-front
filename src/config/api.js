import { Platform } from 'react-native';

/**
 * Resolution order for API base URL:
 * 1. EXPO_PUBLIC_API_URL (from .env in dev, EAS env at build time in prod) — wins if set.
 * 2. Production fallback baked into the JS bundle (used by APK if no env was injected).
 * 3. Dev fallback (Android emulator → 10.0.2.2, iOS simulator → localhost).
 *
 * `__DEV__` is `true` when running through Metro / Expo dev, `false` in EAS builds.
 */

const PROD_API_URL = 'https://fidely-back.onrender.com';

const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_PORT =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_PORT?.trim()) || '3002';
const DEV_FALLBACK = `http://${DEV_HOST}:${API_PORT}`;

function normalizeApiBaseUrl(raw) {
  const val = (raw || '').trim();
  if (!val) return null;
  try {
    const u = new URL(val);
    const metroPorts = new Set(['8081', '8084', '19000', '19001']);
    if (metroPorts.has(String(u.port)) && API_PORT) {
      u.port = String(API_PORT);
      return u.toString().replace(/\/$/, '');
    }
    return u.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

const fromEnv = normalizeApiBaseUrl(
  typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_URL : undefined
);

export const API_BASE_URL = fromEnv || (typeof __DEV__ !== 'undefined' && __DEV__ ? DEV_FALLBACK : PROD_API_URL);
