import { useContext, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import { getApiErrorMessage } from '../lib/errors';
import {
  Button,
  Card,
  CARD_COLOR_PRESETS,
  Field,
  LoyaltyCardView,
  Screen,
  SectionTitle,
  theme,
} from '../ui/components';

export default function ShopSettingsScreen({ navigation }) {
  const { user, refreshMe } = useContext(AuthContext);
  const [shopName, setShopName] = useState(user?.shopName || '');
  const [cardColor, setCardColor] = useState(user?.cardColor || '#0B1220');
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setError('');
    setSaving(true);
    try {
      await api.put('/shop/profile', {
        shopName: shopName.trim(),
        cardColor: cardColor.trim(),
        logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
      });
      await refreshMe();
      navigation.goBack();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Card design" subtitle="Customize how your loyalty card looks to clients." contentAlign="top">
      <SectionTitle>Live preview</SectionTitle>
      <View style={{ alignItems: 'center', marginBottom: 6 }}>
        <LoyaltyCardView
          shopName={shopName || 'Your shop'}
          cardColor={cardColor}
          logoUrl={logoUrl}
          points={70}
          width={320}
        />
      </View>

      <SectionTitle>Identity</SectionTitle>
      <Card>
        <Field
          label="Shop name"
          value={shopName}
          onChangeText={setShopName}
          placeholder="My Coffee"
          autoCapitalize="words"
          leftIcon="S"
        />
        <Field
          label="Logo URL"
          value={logoUrl}
          onChangeText={setLogoUrl}
          placeholder="https://..."
          autoCapitalize="none"
          helperText="Optional. Public https image URL."
          leftIcon="◇"
        />
      </Card>

      <SectionTitle>Card color</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {CARD_COLOR_PRESETS.map((c) => {
            const active = c.toLowerCase() === cardColor.toLowerCase();
            return (
              <Pressable
                key={c}
                onPress={() => setCardColor(c)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: c,
                  borderWidth: active ? 3 : 1,
                  borderColor: active ? theme.brand : theme.border,
                }}
              />
            );
          })}
        </View>
        <View style={{ height: 8 }} />
        <Field
          label="Custom hex"
          value={cardColor}
          onChangeText={setCardColor}
          placeholder="#0B1220"
          autoCapitalize="none"
          helperText="Use a hex like #0B1220 or #22C55E."
          leftIcon="#"
        />
      </Card>

      {error ? (
        <View style={{ marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.10)' }}>
          <Text style={{ color: theme.danger, lineHeight: 18, fontWeight: '700', fontSize: 13 }}>{error}</Text>
        </View>
      ) : null}

      <View style={{ height: 6 }} />
      <Button title={saving ? 'Saving…' : 'Save changes'} onPress={save} disabled={saving} size="lg" />
      <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" disabled={saving} />
    </Screen>
  );
}
