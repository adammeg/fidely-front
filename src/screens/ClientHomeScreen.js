import { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, useWindowDimensions, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import { registerFcmTokenWithBackend } from '../lib/registerFcmToken';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  IconButton,
  LoyaltyCardView,
  Pill,
  Screen,
  SCREEN_GUTTER,
  SectionTitle,
  theme,
} from '../ui/components';

const REWARD_AT = 100;

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

  const totalPoints = cards.reduce((acc, c) => acc + (c.points || 0), 0);
  const readyCount = cards.filter((c) => (c.points || 0) >= REWARD_AT).length;

  const headerRight = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <IconButton label="↻" onPress={load} disabled={loading} />
      <Avatar name={user?.displayName || 'You'} color={theme.brand} />
    </View>
  );

  const cardWidth = Math.min(340, pagerWidth - SCREEN_GUTTER * 2);

  return (
    <Screen
      title={`Hi, ${user?.displayName || 'Client'}`}
      subtitle="Show your QR to a shop to start collecting points and rewards."
      contentAlign="top"
      right={headerRight}
    >
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <Card style={{ flex: 1, padding: 14 }} delay={60}>
          <Text style={{ color: theme.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>TOTAL POINTS</Text>
          <Text style={{ marginTop: 4, fontSize: 22, fontWeight: '900', color: theme.text }}>{totalPoints}</Text>
        </Card>
        <Card style={{ flex: 1, padding: 14 }} delay={120}>
          <Text style={{ color: theme.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>REWARDS READY</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: theme.text }}>{readyCount}</Text>
            {readyCount > 0 ? <Pill tone="brand">SHOW QR</Pill> : null}
          </View>
        </Card>
      </View>

      <Card style={{ alignItems: 'center', paddingVertical: 22 }} delay={180}>
        <View
          style={{
            padding: 12,
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: theme.border,
            backgroundColor: '#fff',
          }}
        >
          <QRCode value={JSON.stringify({ clientId: user?.id })} size={170} />
        </View>
        <Text style={{ color: theme.muted, fontSize: 12, marginTop: 12, fontWeight: '700' }}>
          Shops scan this QR to open your card
        </Text>
      </Card>

      <SectionTitle action={cards.length > 0 ? <Pill>{`${cards.length} CARDS`}</Pill> : null}>
        My cards
      </SectionTitle>

      {loading && cards.length === 0 ? (
        <ActivityIndicator color={theme.brand} style={{ marginVertical: 24 }} />
      ) : cards.length === 0 ? (
        <Card style={{ paddingVertical: 8 }}>
          <EmptyState
            icon="QR"
            title="No cards yet"
            subtitle="When a shop scans your QR, a beautiful loyalty card will appear here for that shop."
          />
        </Card>
      ) : (
        <>
          <View
            style={{ marginHorizontal: -SCREEN_GUTTER, minHeight: cardWidth + 40 }}
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
              renderItem={({ item }) => (
                <View style={{ width: pagerWidth, alignItems: 'center', paddingVertical: 14 }}>
                  <LoyaltyCardView
                    shopName={item.shop?.shopName || 'Shop'}
                    cardColor={item.shop?.cardColor || '#0B1220'}
                    logoUrl={item.shop?.logoUrl || ''}
                    points={item.points || 0}
                    rewardAt={REWARD_AT}
                    width={cardWidth}
                  />
                </View>
              )}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4, marginBottom: 8 }}>
            {cards.map((_, i) => {
              const active = i === activeIndex;
              return (
                <View
                  key={i}
                  style={{
                    width: active ? 22 : 8,
                    height: 8,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor: active ? theme.brand : theme.inkSoft,
                  }}
                />
              );
            })}
          </View>
        </>
      )}

      <View style={{ height: 8 }} />
      <Button title="Logout" onPress={signOut} variant="ghost" />
    </Screen>
  );
}
