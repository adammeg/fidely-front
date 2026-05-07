import * as Location from 'expo-location';
import { Platform } from 'react-native';

let inFlight = false;

/**
 * Asks the user for location permission (best-effort; never throws).
 * If granted, fetches the current coords and posts them to the API.
 * Safe to call multiple times — only one network call at a time.
 */
export async function requestAndRegisterLocation(api) {
  if (inFlight) return null;
  inFlight = true;
  try {
    if (Platform.OS === 'web') return null;

    const existing = await Location.getForegroundPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted' && existing.canAskAgain !== false) {
      const next = await Location.requestForegroundPermissionsAsync();
      status = next.status;
    }
    if (status !== 'granted') return null;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const lat = pos?.coords?.latitude;
    const lng = pos?.coords?.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;

    try {
      await api.post('/auth/me/location', { lat, lng });
    } catch {
      // Silent — location is best-effort.
    }

    return { lat, lng };
  } catch {
    return null;
  } finally {
    inFlight = false;
  }
}
