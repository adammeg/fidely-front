import { useContext, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import { getApiErrorMessage } from '../lib/errors';
import { Button, Card, Field, LogoMark, Screen, theme } from '../ui/components';

export default function ShopSettingsScreen({ navigation }) {
  const { user, refreshMe } = useContext(AuthContext);
  const [shopName, setShopName] = useState(user?.shopName || '');
  const [cardColor, setCardColor] = useState(user?.cardColor || '#111827');
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
    <Screen title="Design" subtitle="Customize what clients see on your loyalty card." right={<LogoMark size={44} />}>
      <Card>
        <Field label="Shop name" value={shopName} onChangeText={setShopName} placeholder="My Coffee" autoCapitalize="words" />
        <Field
          label="Card color"
          value={cardColor}
          onChangeText={setCardColor}
          placeholder="#111827"
          autoCapitalize="none"
          helperText="Use a hex color like #111827 or #22c55e."
        />
        <Field
          label="Logo URL"
          value={logoUrl}
          onChangeText={setLogoUrl}
          placeholder="https://..."
          autoCapitalize="none"
          helperText="Optional. Use a public https image URL."
        />
      </Card>

      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: '900', marginBottom: 8, color: theme.text }}>Preview</Text>
        <View style={{ borderRadius: 18, padding: 16, backgroundColor: cardColor || '#111827' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: logoUrl ? 12 : 0 }}>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 6, fontWeight: '700' }}>
                Loyalty card
              </Text>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{shopName || 'Shop'}</Text>
            </View>
            {logoUrl ? (
              <Image
                source={{ uri: logoUrl }}
                style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)' }}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </View>
      </View>

      {error ? (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: theme.danger, lineHeight: 18, fontWeight: '700' }}>{error}</Text>
        </View>
      ) : null}

      <Button title={saving ? 'Saving…' : 'Save'} onPress={save} disabled={saving} />
      <Button title="Cancel" onPress={() => navigation.goBack()} variant="secondary" disabled={saving} />
    </Screen>
  );
}

