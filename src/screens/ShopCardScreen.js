import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { api } from '../lib/api';
import { Button, Card, Screen, theme } from '../ui/components';

export default function ShopCardScreen({ route, navigation }) {
  const cardId = route?.params?.cardId;
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

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
    await api.post(`/cards/${cardId}/purchase`);
    await load();
  }

  async function redeem() {
    try {
      await api.post(`/cards/${cardId}/redeem`);
      await load();
    } catch (e) {
      Alert.alert('Cannot redeem', e?.response?.data?.message || 'Not enough points');
    }
  }

  return (
    <Screen title="Card" subtitle="Quick actions for this client." right={<LogoMark size={44} />}>
      {loading && !card ? <ActivityIndicator /> : null}
      {card ? (
        <Card>
          <Text style={{ fontWeight: '900', fontSize: 18, color: theme.text }}>
            {card.client?.displayName || 'Client'}
          </Text>
          <Text style={{ marginTop: 8, color: theme.muted }}>{card.points} pts</Text>
          <View style={{ height: 12 }} />
          <Button title="+10 purchase" onPress={addPurchase} />
          <Button title="Redeem 100" onPress={redeem} variant="secondary" />
        </Card>
      ) : null}
      <Button title="Back" onPress={() => navigation.goBack()} variant="secondary" />
    </Screen>
  );
}

