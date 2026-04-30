import { Image, Text, View } from 'react-native';
import {
  BrandWordmark,
  Button,
  Card,
  IconBadge,
  Pill,
  Screen,
  theme,
} from '../ui/components';

export default function RoleScreen({ navigation }) {
  return (
    <Screen
      title=""
      subtitle=""
      contentAlign="top"
    >
      <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 24 }}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 96, height: 96, borderRadius: 24, marginBottom: 14 }}
          resizeMode="contain"
        />
        <BrandWordmark size={28} />
        <Text style={{ marginTop: 10, color: theme.muted, fontSize: 14, lineHeight: 20, textAlign: 'center', paddingHorizontal: 18 }}>
          Build customer loyalty with QR cards, points and rewards. Pick how you want to start.
        </Text>
      </View>

      <Card delay={120} onPress={() => navigation.navigate('Auth', { role: 'shop' })}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconBadge label="S" color={theme.brandSoft} textColor={theme.brand2} size={52} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontWeight: '900', color: theme.text, fontSize: 17 }}>I’m a Shop</Text>
              <Pill tone="brand">EARN MORE</Pill>
            </View>
            <Text style={{ color: theme.muted, marginTop: 4, lineHeight: 18, fontSize: 13 }}>
              Scan client QR codes, give points and design your card.
            </Text>
          </View>
          <Text style={{ fontSize: 22, color: theme.subtle, fontWeight: '900', marginLeft: 6 }}>›</Text>
        </View>
      </Card>

      <View style={{ height: 12 }} />

      <Card delay={220} onPress={() => navigation.navigate('Auth', { role: 'client' })}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconBadge label="C" color="rgba(29, 78, 216, 0.10)" textColor="#1D4ED8" size={52} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontWeight: '900', color: theme.text, fontSize: 17 }}>I’m a Client</Text>
              <Pill>FREE</Pill>
            </View>
            <Text style={{ color: theme.muted, marginTop: 4, lineHeight: 18, fontSize: 13 }}>
              Show your QR to collect points and unlock rewards.
            </Text>
          </View>
          <Text style={{ fontSize: 22, color: theme.subtle, fontWeight: '900', marginLeft: 6 }}>›</Text>
        </View>
      </Card>

      <View style={{ marginTop: 24, paddingHorizontal: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Stat label="+10 pts" caption="per purchase" />
          <Stat label="100" caption="for a reward" />
          <Stat label="QR" caption="contactless" />
        </View>
      </View>
    </Screen>
  );
}

function Stat({ label, caption }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text, letterSpacing: -0.3 }}>{label}</Text>
      <Text style={{ marginTop: 2, fontSize: 11.5, color: theme.muted, fontWeight: '700' }}>{caption}</Text>
    </View>
  );
}
