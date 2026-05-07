import { useContext, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import { getApiErrorMessage, getApiFieldErrors } from '../lib/errors';
import {
  addressValidator,
  hexColorValidator,
  intRangeValidator,
  nameValidator,
  phoneValidator,
  urlValidator,
  validate,
} from '../lib/validators';
import {
  Button,
  Card,
  CARD_COLOR_PRESETS,
  Field,
  LoyaltyCardView,
  Screen,
  SectionTitle,
  SegmentedControl,
  theme,
} from '../ui/components';

export default function ShopSettingsScreen({ navigation }) {
  const { user, refreshMe } = useContext(AuthContext);
  const [shopName, setShopName] = useState(user?.shopName || '');
  const [ownerName, setOwnerName] = useState(user?.ownerName || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [cardColor, setCardColor] = useState(user?.cardColor || '#0B1220');
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl || '');
  const [loyaltyType, setLoyaltyType] = useState(user?.loyaltyType || 'points');
  const [stampGoalStr, setStampGoalStr] = useState(String(user?.stampGoal || 10));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const stampGoal = Math.max(2, Math.min(30, parseInt(stampGoalStr, 10) || 10));

  function clearError(field) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function clientValidate() {
    const validators = {
      ownerName: (v) => nameValidator(v, 'Owner name'),
      shopName: (v) => nameValidator(v, 'Shop name'),
      address: addressValidator,
      phone: phoneValidator,
      cardColor: hexColorValidator,
      logoUrl: (v) => urlValidator(v, { optional: true }),
    };
    if (loyaltyType === 'stamps') {
      validators.stampGoal = (v) => intRangeValidator(v, { min: 2, max: 30, label: 'Stamp goal' });
    }
    return validate(
      {
        ownerName,
        shopName,
        address,
        phone,
        cardColor,
        logoUrl,
        stampGoal: stampGoalStr,
      },
      validators
    );
  }

  async function save() {
    setGeneralError('');
    const v = clientValidate();
    setErrors(v.errors);
    if (v.hasError) return;

    setSaving(true);
    try {
      await api.put('/shop/profile', {
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        cardColor: cardColor.trim(),
        logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
        loyaltyType,
        stampGoal,
      });
      await refreshMe();
      navigation.goBack();
    } catch (e) {
      const fieldErrs = getApiFieldErrors(e);
      if (Object.keys(fieldErrs).length) {
        setErrors(fieldErrs);
      } else {
        setGeneralError(getApiErrorMessage(e));
      }
    } finally {
      setSaving(false);
    }
  }

  const previewPoints = loyaltyType === 'stamps' ? Math.floor(stampGoal * 0.7) : 70;
  const previewRewardAt = loyaltyType === 'stamps' ? stampGoal : 100;

  return (
    <Screen title="Card design" subtitle="Customize how your loyalty card looks to clients." contentAlign="top">
      <SectionTitle>Live preview</SectionTitle>
      <View style={{ alignItems: 'center', marginBottom: 6 }}>
        <LoyaltyCardView
          shopName={shopName || 'Your shop'}
          cardColor={hexColorValidator(cardColor) ? '#0B1220' : cardColor}
          logoUrl={logoUrl}
          points={previewPoints}
          rewardAt={previewRewardAt}
          loyaltyType={loyaltyType}
          width={320}
        />
      </View>

      <SectionTitle>Loyalty system</SectionTitle>
      <Card>
        <SegmentedControl
          value={loyaltyType}
          onChange={(v) => {
            setLoyaltyType(v);
            clearError('stampGoal');
          }}
          options={[
            { value: 'points', label: 'Points' },
            { value: 'stamps', label: 'Stamps' },
          ]}
        />
        <Text style={{ marginTop: 8, color: theme.muted, fontSize: 12.5, lineHeight: 18 }}>
          {loyaltyType === 'points'
            ? '+10 points per purchase. Free reward when the client reaches 100 points.'
            : 'One stamp per purchase. The reward is unlocked at the goal stamp count.'}
        </Text>

        {loyaltyType === 'stamps' ? (
          <Field
            label="Stamp goal"
            value={stampGoalStr}
            onChangeText={(v) => {
              setStampGoalStr(v);
              clearError('stampGoal');
            }}
            placeholder="10"
            keyboardType="number-pad"
            helperText="Between 2 and 30. Common is 10 (9 stamps + 10th free)."
            leftIcon="#"
            error={errors.stampGoal}
          />
        ) : null}
      </Card>

      <SectionTitle>Identity</SectionTitle>
      <Card>
        <Field
          label="Owner name"
          value={ownerName}
          onChangeText={(v) => {
            setOwnerName(v);
            clearError('ownerName');
          }}
          placeholder="John Doe"
          autoCapitalize="words"
          leftIcon="O"
          error={errors.ownerName}
        />
        <Field
          label="Shop name"
          value={shopName}
          onChangeText={(v) => {
            setShopName(v);
            clearError('shopName');
          }}
          placeholder="My Coffee"
          autoCapitalize="words"
          leftIcon="S"
          error={errors.shopName}
        />
        <Field
          label="Phone number"
          value={phone}
          onChangeText={(v) => {
            setPhone(v);
            clearError('phone');
          }}
          placeholder="+33 6 12 34 56 78"
          keyboardType="phone-pad"
          leftIcon="☎"
          error={errors.phone}
        />
        <Field
          label="Address"
          value={address}
          onChangeText={(v) => {
            setAddress(v);
            clearError('address');
          }}
          placeholder="12 Main Street, Paris"
          autoCapitalize="words"
          leftIcon="◉"
          multiline
          error={errors.address}
        />
        <Field
          label="Logo URL"
          value={logoUrl}
          onChangeText={(v) => {
            setLogoUrl(v);
            clearError('logoUrl');
          }}
          placeholder="https://..."
          autoCapitalize="none"
          helperText="Optional. Public https image URL."
          leftIcon="◇"
          error={errors.logoUrl}
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
                onPress={() => {
                  setCardColor(c);
                  clearError('cardColor');
                }}
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
          onChangeText={(v) => {
            setCardColor(v);
            clearError('cardColor');
          }}
          placeholder="#0B1220"
          autoCapitalize="none"
          helperText="Use a hex like #0B1220 or #22C55E."
          leftIcon="#"
          error={errors.cardColor}
        />
      </Card>

      {generalError ? (
        <View style={{ marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.10)' }}>
          <Text style={{ color: theme.danger, lineHeight: 18, fontWeight: '700', fontSize: 13 }}>{generalError}</Text>
        </View>
      ) : null}

      <View style={{ height: 6 }} />
      <Button title="Save changes" onPress={save} loading={saving} size="lg" />
      <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" disabled={saving} />
    </Screen>
  );
}
