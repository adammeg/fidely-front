import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import { registerFcmTokenWithBackend } from '../lib/registerFcmToken';
import { requestAndRegisterLocation } from '../lib/registerLocation';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Field,
  IconBadge,
  IconButton,
  LoadingOverlay,
  Pill,
  Screen,
  Skeleton,
  Spinner,
  theme,
} from '../ui/components';

function shopThreshold(user) {
  if (user?.loyaltyType === 'stamps') return Math.max(2, user?.stampGoal || 10);
  return Math.max(1, user?.redeemThreshold || 100);
}

export default function ShopHomeScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const isStamps = user?.loyaltyType === 'stamps';
  const threshold = shopThreshold(user);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushSending, setPushSending] = useState(false);
  const [filter, setFilter] = useState('all');

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/cards');
      setCards(res.data.cards || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    registerFcmTokenWithBackend(api);
    requestAndRegisterLocation(api);
  }, []);

  async function addPurchase(cardId) {
    await api.post(`/cards/${cardId}/purchase`);
    await load();
  }

  async function redeem(cardId) {
    try {
      await api.post(`/cards/${cardId}/redeem`);
      await load();
    } catch (e) {
      // ignore
    }
  }

  async function sendPushToClients() {
    const title = pushTitle.trim();
    const body = pushBody.trim();
    if (!title || !body) {
      Alert.alert('Push', 'Enter a title and message.');
      return;
    }
    setPushSending(true);
    try {
      const res = await api.post('/notifications/broadcast', { title, body });
      const { targetedDevices, message } = res.data;
      Alert.alert(
        'Push',
        message ||
          `Sent: GOOD notification sent to ${targetedDevices ?? '—'} clients)`
      );
      setPushTitle('');
      setPushBody('');
    } catch (e) {
      Alert.alert('Push', e?.response?.data?.message || e?.message || 'Request failed');
    }
  }

  const stats = useMemo(() => {
    const total = cards.length;
    const ready = cards.filter((c) => (c.points || 0) >= threshold).length;
    const totalPts = cards.reduce((acc, c) => acc + (c.points || 0), 0);
    return { total, ready, totalPts };
  }, [cards, threshold]);

  const filteredCards = useMemo(() => {
    if (filter === 'ready') return cards.filter((c) => (c.points || 0) >= threshold);
    return cards;
  }, [cards, filter, threshold]);

  const headerRight = (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {loading ? (
        <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size={20} />
        </View>
      ) : (
        <IconButton label="↻" onPress={load} disabled={loading} />
      )}
      <IconButton label="✎" onPress={() => navigation.navigate('ShopSettings')} tone="dark" />
    </View>
  );

  const header = (
    <>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <Card style={{ flex: 1, padding: 14 }} delay={40}>
          <Text style={{ color: theme.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>CLIENTS</Text>
          <Text style={{ marginTop: 4, fontSize: 22, fontWeight: '900', color: theme.text }}>{stats.total}</Text>
        </Card>
        <Card style={{ flex: 1, padding: 14 }} delay={100}>
          <Text style={{ color: theme.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>{isStamps ? 'STAMPS' : 'POINTS'} GIVEN</Text>
          <Text style={{ marginTop: 4, fontSize: 22, fontWeight: '900', color: theme.text }}>{stats.totalPts}</Text>
        </Card>
        <Card style={{ flex: 1, padding: 14 }} delay={160}>
          <Text style={{ color: theme.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>READY</Text>
          <Text style={{ marginTop: 4, fontSize: 22, fontWeight: '900', color: theme.brand2 }}>{stats.ready}</Text>
        </Card>
      </View>

      <Card delay={180} style={{ paddingVertical: 14 }}>
        <Text style={{ fontWeight: '900', color: theme.text, marginBottom: 12, fontSize: 14 }}>Quick actions</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <ActionTile
            label="Scan QR"
            icon="QR"
            tone="brand"
            onPress={() => navigation.navigate('Scan')}
          />
          <ActionTile
            label="Card design"
            icon="✎"
            onPress={() => navigation.navigate('ShopSettings')}
          />
          <ActionTile
            label="Send offer"
            icon="↗"
            onPress={() => null}
            disabled
            badge="below"
          />
        </View>
      </Card>

      <Card delay={240} style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: '900', color: theme.text, marginBottom: 4 }}>Push offer</Text>
        <Text style={{ color: theme.muted, fontSize: 12, marginBottom: 10, lineHeight: 16 }}>
          Send a notification to clients with one of your loyalty cards. Requires a built APK with FCM enabled.
        </Text>
        <Field placeholder="Title (e.g. -10% today)" value={pushTitle} onChangeText={setPushTitle} leftIcon="✦" />
        <Field placeholder="Message" value={pushBody} onChangeText={setPushBody} multiline leftIcon="·" />
        <Button title="Send push" onPress={sendPushToClients} loading={pushSending} variant="dark" />
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 8 }}>
        <Text style={{ fontWeight: '900', color: theme.text, fontSize: 16 }}>Clients</Text>
        <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterChip label="Reward ready" active={filter === 'ready'} onPress={() => setFilter('ready')} />
      </View>
    </>
  );

  const footer = (
    <>
      <View style={{ height: 8 }} />
      <Button title="Logout" onPress={signOut} variant="ghost" />
    </>
  );

  return (
    <Screen
      scroll={false}
      title={`Hi, ${user?.shopName || 'Shop'}`}
      subtitle={
        isStamps
          ? `Scan a client QR to open their card. +1 stamp per purchase — free reward at ${threshold}.`
          : `Scan a client QR to open their card. +${user?.pointsPerPurchase || 10} per purchase, redeem at ${threshold}.`
      }
      right={headerRight}
    >
      <FlatList
        style={{ flex: 1 }}
        data={filteredCards}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: filteredCards.length === 0 && !loading ? 'flex-start' : 'flex-start',
          paddingBottom: 8,
        }}
        renderItem={({ item, index }) => (
          <ClientRow
            item={item}
            index={index}
            isStamps={isStamps}
            threshold={threshold}
            increment={user?.pointsPerPurchase || 10}
            onPurchase={() => addPurchase(item.id)}
            onRedeem={() => redeem(item.id)}
            onOpen={() => navigation.navigate('ShopCard', { cardId: item.id })}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View>
              <Skeleton height={70} radius={18} style={{ marginBottom: 10 }} />
              <Skeleton height={70} radius={18} style={{ marginBottom: 10 }} />
              <Skeleton height={70} radius={18} />
            </View>
          ) : (
            <Card>
              <EmptyState
                icon="QR"
                title={filter === 'ready' ? 'No rewards yet' : 'No clients yet'}
                subtitle={
                  filter === 'ready'
                    ? `Clients will appear here when they reach ${threshold} ${isStamps ? 'stamps' : 'points'}.`
                    : 'Tap “Scan QR” above to register your first client.'
                }
              />
            </Card>
          )
        }
      />
      <LoadingOverlay visible={pushSending} label="Sending push…" />
    </Screen>
  );
}

function ActionTile({ label, icon, onPress, tone, disabled, badge }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: tone === 'brand' ? theme.brandSoft : theme.surface2,
        borderWidth: 1,
        borderColor: theme.border,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <IconBadge label={icon} size={36} color={tone === 'brand' ? theme.brand : '#fff'} textColor={tone === 'brand' ? '#fff' : theme.text} />
      <Text style={{ marginTop: 8, fontWeight: '800', fontSize: 12, color: theme.text }}>{label}</Text>
      {badge ? <Text style={{ fontSize: 10, color: theme.muted, marginTop: 2 }}>{badge}</Text> : null}
    </Pressable>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: active ? theme.ink : theme.surface2,
        borderWidth: 1,
        borderColor: active ? theme.ink : theme.border,
      }}
    >
      <Text style={{ color: active ? '#fff' : theme.text, fontWeight: '800', fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

function ClientRow({ item, index, isStamps, threshold, increment, onPurchase, onRedeem, onOpen }) {
  const points = item.points || 0;
  const ready = points >= threshold;
  const unitLabel = isStamps
    ? `${points} / ${threshold} stamps`
    : `${points} pts · ${threshold - (points % threshold)} to next reward`;
  return (
    <Card style={{ marginBottom: 10, padding: 14 }} delay={index * 60}>
      <Pressable onPress={onOpen} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={item.client?.displayName || '·'} color={ready ? theme.brand : theme.ink} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontWeight: '900', color: theme.text, fontSize: 15 }}>
              {item.client?.displayName || 'Client'}
            </Text>
            {ready ? <Pill tone="brand">REWARD READY</Pill> : null}
          </View>
          <Text style={{ color: theme.muted, marginTop: 2, fontSize: 12.5 }}>{unitLabel}</Text>
        </View>
        <Text style={{ fontSize: 22, color: theme.subtle, fontWeight: '900', marginLeft: 6 }}>›</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button title={isStamps ? '+1' : `+${increment}`} onPress={onPurchase} size="sm" leftIcon="+" />
        </View>
        <View style={{ flex: 1 }}>
          <Button title={isStamps ? 'Redeem' : `Redeem ${threshold}`} onPress={onRedeem} variant="secondary" size="sm" />
        </View>
      </View>
    </Card>
  );
}
