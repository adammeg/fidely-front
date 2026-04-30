import { Platform } from 'react-native';

/**
 * Default dev URL for fidely-back.
 * Android emulator: 10.0.2.2 → host machine.
 * iOS simulator: localhost → host Mac.
 * Physical device / Expo Go: set EXPO_PUBLIC_API_URL in fidely-front/.env (http://YOUR_PC_IP:PORT).
 * Port must match fidely-back PORT — use EXPO_PUBLIC_API_PORT for emulator defaults.
 */
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_PORT =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_PORT?.trim()) || '3002';
const DEFAULT_URL = `http://${DEV_HOST}:${API_PORT}`;

function normalizeApiBaseUrl(raw) {
  const val = (raw || '').trim();
  if (!val) return DEFAULT_URL;
  try {
    const u = new URL(val);
    // If someone accidentally points to the Metro port, force the backend port.
    // Common Metro ports in Expo: 8081, 8084, 19000, 19001.
    const metroPorts = new Set(['8081', '8084', '19000', '19001']);
    if (metroPorts.has(String(u.port)) && API_PORT) {
      u.port = String(API_PORT);
      return u.toString().replace(/\/$/, '');
    }
    return u.toString().replace(/\/$/, '');
  } catch {
    // If it's not a valid URL, fall back to default.
    return DEFAULT_URL;
  }
}

export const API_BASE_URL = normalizeApiBaseUrl(
  typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_URL : undefined
);
