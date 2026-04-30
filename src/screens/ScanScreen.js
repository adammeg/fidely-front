import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '../lib/api';
import { Button, Pill, Screen, theme } from '../ui/components';

const FRAME_SIZE = 260;
const CORNER = 28;
const CORNER_THICK = 4;
const CORNER_COLOR = '#22C55E';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        Animated.timing(sweep, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      ])
    ).start();
  }, [sweep]);

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
      <Screen title="Camera access" subtitle="We use the camera only to read client QR codes.">
        <Button title="Allow camera" onPress={requestPermission} size="lg" />
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" />
      </Screen>
    );
  }

  const sweepY = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE - 2],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={busy ? undefined : onBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* dim overlay */}
      <View pointerEvents="none" style={StyleSheetAbsolute}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <Pill tone="brand">SCANNING…</Pill>
          </View>

          <View style={{ width: FRAME_SIZE, height: FRAME_SIZE }}>
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
            <Animated.View
              style={{
                position: 'absolute',
                left: 8,
                right: 8,
                height: 2,
                backgroundColor: CORNER_COLOR,
                opacity: 0.85,
                shadowColor: CORNER_COLOR,
                shadowOpacity: 0.8,
                shadowRadius: 8,
                transform: [{ translateY: sweepY }],
              }}
            />
          </View>

          <Text style={{ color: '#fff', marginTop: 22, fontWeight: '800' }}>
            Point the camera at the client’s QR
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6, fontSize: 12.5, textAlign: 'center', paddingHorizontal: 20 }}>
            We’ll automatically open their loyalty card.
          </Text>
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: 28, left: 18, right: 18 }}>
        <Button title={busy ? 'Processing…' : 'Cancel'} onPress={() => navigation.goBack()} variant="dark" disabled={busy} />
      </View>
    </View>
  );
}

const StyleSheetAbsolute = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };

function Corner({ pos }) {
  const base = {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: CORNER_COLOR,
  };
  const tl = { ...base, top: 0, left: 0, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderTopLeftRadius: 8 };
  const tr = { ...base, top: 0, right: 0, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderTopRightRadius: 8 };
  const bl = { ...base, bottom: 0, left: 0, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderBottomLeftRadius: 8 };
  const br = { ...base, bottom: 0, right: 0, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderBottomRightRadius: 8 };
  const map = { tl, tr, bl, br };
  return <View style={map[pos]} />;
}
