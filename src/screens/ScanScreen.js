import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '../lib/api';
import { Button, Screen, theme } from '../ui/components';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  async function onBarcodeScanned({ data }) {
    if (busy) return;
    setBusy(true);
    try {
      let payload = null;
      try {
        payload = JSON.parse(data);
      } catch {
        payload = { clientId: data };
      }

      if (!payload?.clientId) {
        Alert.alert('Invalid QR', 'This QR does not contain a clientId.');
        return;
      }

      const res = await api.post('/cards/scan', { clientId: payload.clientId });
      const cardId = res?.data?.card?.id;
      if (cardId) {
        navigation.replace('ShopCard', { cardId });
      } else {
        Alert.alert('Success', 'Client added.');
        navigation.goBack();
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Scan failed';
      Alert.alert('Error', msg);
    } finally {
      setBusy(false);
    }
  }

  if (!permission) {
    return (
      <Screen title="Scan">
        <Text style={{ marginBottom: 12, color: theme.muted, textAlign: 'center' }}>Requesting permission…</Text>
      </Screen>
    );
  }
  if (!permission.granted) {
    return (
      <Screen title="Scan">
        <Text style={{ marginBottom: 12, color: theme.muted, textAlign: 'center', lineHeight: 20 }}>
          Camera permission is required to scan QR codes.
        </Text>
        <Button title="Allow camera" onPress={requestPermission} />
        <Button title="Back" onPress={() => navigation.goBack()} variant="secondary" />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={busy ? undefined : onBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      <View style={{ position: 'absolute', bottom: 24, left: 16, right: 16 }}>
        <Button title={busy ? 'Processing…' : 'Cancel'} onPress={() => navigation.goBack()} variant="secondary" disabled={busy} />
      </View>
    </View>
  );
}

