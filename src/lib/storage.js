import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'fidely.token';
const USER_KEY = 'fidely.user';

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token) {
  if (!token) return AsyncStorage.removeItem(TOKEN_KEY);
  return AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setStoredUser(user) {
  if (!user) return AsyncStorage.removeItem(USER_KEY);
  return AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

