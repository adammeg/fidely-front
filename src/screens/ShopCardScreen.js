import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  AnimatedNumber,
  Avatar,
  Button,
  Card,
  LoadingOverlay,
  Pill,
  ProgressBar,
  Screen,
  Skeleton,
  StampGrid,
  theme,
} from '../ui/components';

export default function ShopCardScreen({ route, navigation }) {
  const cardId = route?.params?.cardId;
  const { user } = useContext(AuthContext);
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

  const cfg = useMemo(() => {
    const loyaltyType = card?.shop?.loyaltyType || user?.loyaltyType || 'points';
    if (loyaltyType === 'stamps') {
      const goal = Math.max(2, card?.shop?.stampGoal || user?.stampGoal || 10);
      return { loyaltyType, increment: 1, threshold: goal };
    }
    return {
      loyaltyType,
      increment: card?.shop?.pointsPerPurchase || user?.pointsPerPurchase || 10,
      threshold: card?.shop?.redeemThreshold || user?.redeemThreshold || 100,
    };
  }, [card, user]);

  const points = card?.points || 0;
  const ready = points >= cfg.threshold;
  const mod = points % cfg.threshold;
  const progress = ready && mod === 0 ? 1 : mod / cfg.threshold;
  const ptsToNext = mod === 0 && points === 0 ? cfg.threshold : mod === 0 && points > 0 ? 0 : cfg.threshold - mod;
  const isStamps = cfg.loyaltyType === 'stamps';

  return (
    <Screen title="Card" subtitle="Quick actions for this client." contentAlign="top">
      {loading && !card ? (
        <Card style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Skeleton width={48} height={48} radius={24} />
            <View style={{ flex: 1 }}>
              <Skeleton width="60%" height={16} />
              <View style={{ height: 6 }} />
              <Skeleton width="40%" height={12} />
            </View>
          </View>
          <View style={{ alignItems: 'center', marginTop: 22 }}>
            <Skeleton width={120} height={56} radius={14} />
          </View>
          <View style={{ height: 16 }} />
          <Skeleton height={9} radius={6} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <Skeleton width="48%" height={42} radius={14} />
            <Skeleton width="48%" height={42} radius={14} />
          </View>
        </Card>
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

          {isStamps ? (
            <StampGrid
              filled={mod === 0 && ready ? cfg.threshold : mod}
              goal={cfg.threshold}
              width={280}
              dark
            />
          ) : (
            <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 12 }}>
              <AnimatedNumber
                value={points}
                style={{ fontSize: 64, fontWeight: '900', color: theme.text, letterSpacing: -1.5 }}
              />
              <Text style={{ marginTop: -4, color: theme.muted, fontWeight: '800', letterSpacing: 1.4, fontSize: 11 }}>
                POINTS
              </Text>
            </View>
          )}

          {!isStamps ? <ProgressBar progress={progress} /> : null}
          <Text style={{ marginTop: 10, color: theme.muted, fontSize: 12.5, textAlign: 'center' }}>
            {ready && mod === 0
              ? '🎉 Free reward unlocked'
              : isStamps
              ? `${ptsToNext} stamp${ptsToNext === 1 ? '' : 's'} until next free reward (${cfg.threshold})`
              : `${ptsToNext} pts until next free reward (${cfg.threshold})`}
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <View style={{ flex: 1 }}>
              <Button
                title={isStamps ? '+1 stamp' : `+${cfg.increment} purchase`}
                onPress={addPurchase}
                loading={busy}
                leftIcon="+"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title={isStamps ? 'Redeem' : `Redeem ${cfg.threshold}`}
                onPress={redeem}
                variant="secondary"
                disabled={busy || points < cfg.threshold}
              />
            </View>
          </View>
        </Card>
      ) : null}

      <View style={{ height: 12 }} />
      <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" />
      <LoadingOverlay visible={busy && !!card} label="Saving…" />
    </Screen>
  );
}
