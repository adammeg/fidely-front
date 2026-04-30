import { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, useWindowDimensions, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import { registerFcmTokenWithBackend } from '../lib/registerFcmToken';
import { Button, Card, LogoMark, Screen, SCREEN_GUTTER, theme } from '../ui/components';

const REWARD_AT = 100;

function CardSlide({ item, pageWidth }) {
  const points = item.points ?? 0;
  const mod = points % REWARD_AT;
  const eligible = points >= REWARD_AT;
  const progress = eligible && mod === 0 ? 1 : mod / REWARD_AT;
  const ptsToNext =
    mod === 0 && points === 0 ? REWARD_AT : mod === 0 && points > 0 ? 0 : REWARD_AT - mod;

  const innerWidth = Math.max(0, Math.min(340, pageWidth - SCREEN_GUTTER * 2));

  return (
    <View style={{ width: pageWidth, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: innerWidth,
          borderRadius: 16,
          padding: 20,
          backgroundColor: item.shop?.cardColor || '#111827',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flex: 1, paddingRight: item.shop?.logoUrl ? 12 : 0 }}>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 20, fontWeight: '700' }}>
              Loyalty card
            </Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>{item.shop?.shopName || 'Shop'}</Text>
          </View>
          {item.shop?.logoUrl ? (
            <Image
              source={{ uri: item.shop.logoUrl }}
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
              resizeMode="contain"
            />
          ) : null}
        </View>
        <Text style={{ color: '#e5e7eb', fontSize: 42, fontWeight: '800' }}>{points}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 14 }}>points</Text>
        <View style={{ height: 9, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.25)', overflow: 'hidden' }}>
          <View style={{ width: `${Math.min(progress, 1) * 100}%`, height: '100%', backgroundColor: '#34d399' }} />
        </View>
        <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 10 }}>
          {eligible && mod === 0
            ? 'You can redeem a free meal (100 pts) at this shop.'
            : `${ptsToNext} pts until your next free meal (100 pts)`}
        </Text>
      </View>
    </View>
  );
}

export default function ClientHomeScreen() {
  const { user, signOut } = useContext(AuthContext);
  const { width: windowWidth } = useWindowDimensions();
  const [pagerWidth, setPagerWidth] = useState(windowWidth);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setPagerWidth(windowWidth);
  }, [windowWidth]);

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
    load();
  }, []);

  useEffect(() => {
    registerFcmTokenWithBackend(api);
  }, []);

  useEffect(() => {
    if (activeIndex >= cards.length) setActiveIndex(Math.max(0, cards.length - 1));
  }, [cards.length, activeIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <Screen
      title={`Good morning, ${user?.displayName || 'Client'}`}
      subtitle="Show your QR to join a shop’s loyalty program. Tap Refresh to update your points."
      contentAlign="center"
      right={<LogoMark size={48} />}
    >
      <Card style={{ alignItems: 'center' }}>
        <QRCode value={JSON.stringify({ clientId: user?.id })} size={170} />
        <Text style={{ color: theme.muted, fontSize: 12, marginTop: 10 }}>
          Shops scan this QR to open your card.
        </Text>
      </Card>

      <Button title={loading ? 'Refreshing…' : 'Refresh now'} onPress={load} variant="secondary" disabled={loading} />

      <Text style={{ fontWeight: '900', color: theme.text, fontSize: 16, marginTop: 18, marginBottom: 8 }}>My cards</Text>

      {loading && cards.length === 0 ? (
        <ActivityIndicator style={{ marginVertical: 24 }} />
      ) : cards.length === 0 ? (
        <Text style={{ color: theme.muted, marginVertical: 16, lineHeight: 18 }}>
          No cards yet. When a shop scans your QR, a card appears here for that shop.
        </Text>
      ) : (
        <>
          <View
            style={{ marginHorizontal: -SCREEN_GUTTER, minHeight: 430 }}
            onLayout={(e) => {
              const w = Math.round(e.nativeEvent.layout.width);
              if (w > 0 && w !== pagerWidth) setPagerWidth(w);
            }}
          >
            <FlatList
              data={cards}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={pagerWidth}
              snapToAlignment="start"
              getItemLayout={(_, index) => ({ length: pagerWidth, offset: pagerWidth * index, index })}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
              renderItem={({ item }) => <CardSlide item={item} pageWidth={pagerWidth} />}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 8 }}>
            {cards.map((_, i) => (
              <View
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor: i === activeIndex ? '#e5e7eb' : 'rgba(229,231,235,0.25)',
                }}
              />
            ))}
          </View>
          <Text style={{ textAlign: 'center', color: theme.muted, fontSize: 12, marginBottom: 8 }}>
            Swipe left / right to see each shop card
          </Text>
        </>
      )}

      <Button title="Logout" onPress={signOut} variant="danger" />
    </Screen>
  );
}
