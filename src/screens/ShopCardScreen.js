import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { api } from '../lib/api';
import {
  AnimatedNumber,
  Avatar,
  Button,
  Card,
  Pill,
  ProgressBar,
  Screen,
  theme,
} from '../ui/components';

const REWARD_AT = 100;

export default function ShopCardScreen({ route, navigation }) {
  const cardId = route?.params?.cardId;
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!cardId) return;
    setLoading(true);
    try {
      const res = await api.get(`/cards/${cardId}`);
      setCard(res.data.card);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  async function addPurchase() {
    if (busy) return;
    setBusy(true);
    try {
      await api.post(`/cards/${cardId}/purchase`);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function redeem() {
    if (busy) return;
    setBusy(true);
    try {
      await api.post(`/cards/${cardId}/redeem`);
      await load();
    } catch (e) {
      Alert.alert('Cannot redeem', e?.response?.data?.message || 'Not enough points');
    } finally {
      setBusy(false);
    }
  }

  const points = card?.points || 0;
  const ready = points >= REWARD_AT;
  const mod = points % REWARD_AT;
  const progress = ready && mod === 0 ? 1 : mod / REWARD_AT;
  const ptsToNext = mod === 0 && points === 0 ? REWARD_AT : mod === 0 && points > 0 ? 0 : REWARD_AT - mod;

  return (
    <Screen title="Card" subtitle="Quick actions for this client." contentAlign="top">
      {loading && !card ? (
        <ActivityIndicator color={theme.brand} style={{ marginTop: 16 }} />
      ) : null}

      {card ? (
        <Card style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={card.client?.displayName || '·'} color={ready ? theme.brand : theme.ink} size={48} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '900', fontSize: 18, color: theme.text }}>
                {card.client?.displayName || 'Client'}
              </Text>
              <Text style={{ marginTop: 2, color: theme.muted, fontSize: 12.5 }}>
                Joined {new Date(card.createdAt || Date.now()).toLocaleDateString()}
              </Text>
            </View>
            {ready ? <Pill tone="brand">REWARD READY</Pill> : null}
          </View>

          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 12 }}>
            <AnimatedNumber
              value={points}
              style={{ fontSize: 64, fontWeight: '900', color: theme.text, letterSpacing: -1.5 }}
            />
            <Text style={{ marginTop: -4, color: theme.muted, fontWeight: '800', letterSpacing: 1.4, fontSize: 11 }}>
              POINTS
            </Text>
          </View>

          <ProgressBar progress={progress} />
          <Text style={{ marginTop: 10, color: theme.muted, fontSize: 12.5, textAlign: 'center' }}>
            {ready && mod === 0
              ? '🎉 Free reward unlocked'
              : `${ptsToNext} pts until next free reward (${REWARD_AT})`}
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <View style={{ flex: 1 }}>
              <Button title="+10 purchase" onPress={addPurchase} disabled={busy} leftIcon="+" />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Redeem 100" onPress={redeem} variant="secondary" disabled={busy || points < REWARD_AT} />
            </View>
          </View>
        </Card>
      ) : null}

      <View style={{ height: 12 }} />
      <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" />
    </Screen>
  );
}
