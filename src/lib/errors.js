import axios from 'axios';
import { API_BASE_URL } from '../config/api';

/**
 * Turns axios/network errors into a user-visible string (not just "Something went wrong").
 */
export function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data.message === 'string') return data.message;
    if (data?.errors && typeof data.errors === 'object') {
      const first = Object.values(data.errors).find((v) => typeof v === 'string');
      if (first) return first;
    }
    if (data?.issues && Array.isArray(data.issues)) {
      const first = data.issues[0];
      if (first?.message) return first.message;
    }
    if (error.code === 'ECONNABORTED') {
      return `Request timed out. Is the API running at ${API_BASE_URL}?`;
    }
    if (error.response) {
      return `Server error (${error.response.status}). Check API logs.`;
    }
    return `Cannot reach API at ${API_BASE_URL}. On a phone, set EXPO_PUBLIC_API_URL in fidely-front/.env to http://YOUR_PC_LAN_IP:PORT (same port as fidely-back), then restart Expo with --clear.`;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

/**
 * Pull a per-field error map from an axios error (matches the backend `errors` object).
 * Returns an empty object if none.
 */
export function getApiFieldErrors(error) {
  if (!axios.isAxiosError(error)) return {};
  const data = error.response?.data;
  if (data?.errors && typeof data.errors === 'object') {
    const out = {};
    for (const k of Object.keys(data.errors)) {
      const v = data.errors[k];
      if (typeof v === 'string') out[k] = v;
    }
    return out;
  }
  if (data?.issues && Array.isArray(data.issues)) {
    const out = {};
    for (const i of data.issues) {
      const path = (i.path || []).join('.') || '_';
      if (!out[path] && typeof i.message === 'string') out[path] = i.message;
    }
    return out;
  }
  return {};
}
