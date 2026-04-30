import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Obtains the native FCM/APNs device token (via Expo) and registers it with fidely-back.
 * Works on a development/production build with Firebase configured; often fails or no-ops in Expo Go on Android.
 */
export async function registerFcmTokenWithBackend(api) {
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }
  if (status !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  try {
    const native = await Notifications.getDevicePushTokenAsync();
    const platform =
      native.type === 'ios' ? 'ios' : native.type === 'android' ? 'android' : 'unknown';
    await api.post('/notifications/fcm-token', { token: native.data, platform });
  } catch (err) {
    console.warn('[push]', err?.message || err);
  }
}
