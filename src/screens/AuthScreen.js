import { useContext, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getApiErrorMessage, getApiFieldErrors } from '../lib/errors';
import {
  addressValidator,
  emailValidator,
  nameValidator,
  passwordValidator,
  phoneValidator,
  validate,
} from '../lib/validators';
import {
  BrandWordmark,
  Button,
  Card,
  Field,
  Pill,
  Screen,
  SegmentedControl,
  theme,
} from '../ui/components';

export default function AuthScreen() {
  const { signIn, register } = useContext(AuthContext);

  const [role, setRole] = useState('client');
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [loyaltyType, setLoyaltyType] = useState('points');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  function clearError(field) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function clientValidate() {
    if (mode === 'login') {
      return validate(
        { email, password },
        {
          email: emailValidator,
          password: (v) => passwordValidator(v, { min: 1 }),
        }
      );
    }
    const validators = {
      email: emailValidator,
      password: passwordValidator,
      phone: phoneValidator,
    };
    if (role === 'shop') {
      validators.ownerName = (v) => nameValidator(v, 'Owner name');
      validators.shopName = (v) => nameValidator(v, 'Shop name');
      validators.address = addressValidator;
    } else {
      validators.displayName = (v) => nameValidator(v, 'Name');
    }
    return validate(
      { email, password, phone, ownerName, shopName, address, displayName },
      validators
    );
  }

  async function onSubmit() {
    setGeneralError('');
    const v = clientValidate();
    setErrors(v.errors);
    if (v.hasError) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await register({
          role,
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          shopName: role === 'shop' ? shopName.trim() : undefined,
          ownerName: role === 'shop' ? ownerName.trim() : undefined,
          address: role === 'shop' ? address.trim() : undefined,
          loyaltyType: role === 'shop' ? loyaltyType : undefined,
          displayName: role === 'client' ? displayName.trim() : undefined,
        });
      }
    } catch (e) {
      const fieldErrs = getApiFieldErrors(e);
      if (Object.keys(fieldErrs).length) {
        setErrors(fieldErrs);
      } else {
        setGeneralError(getApiErrorMessage(e));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentAlign="top">
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 10 }}
          resizeMode="contain"
        />
        <BrandWordmark size={22} />
        <Text style={{ marginTop: 8, color: theme.muted, fontSize: 13, textAlign: 'center', paddingHorizontal: 12 }}>
          Loyalty cards, points and rewards — in one tap.
        </Text>
      </View>

      <Card>
        <SegmentedControl
          value={mode}
          onChange={(next) => {
            setMode(next);
            setErrors({});
            setGeneralError('');
          }}
          options={[
            { value: 'login', label: 'Sign in' },
            { value: 'register', label: 'Create account' },
          ]}
        />

        <Field
          label="Email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            clearError('email');
          }}
          placeholder="you@email.com"
          keyboardType="email-address"
          leftIcon="@"
          error={errors.email}
          onBlur={() => {
            const msg = emailValidator(email);
            if (msg) setErrors((p) => ({ ...p, email: msg }));
          }}
        />
        <Field
          label="Password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            clearError('password');
          }}
          placeholder={mode === 'login' ? 'Your password' : 'At least 6 characters'}
          secureTextEntry
          leftIcon="•"
          error={errors.password}
          onBlur={() => {
            if (mode === 'register') {
              const msg = passwordValidator(password);
              if (msg) setErrors((p) => ({ ...p, password: msg }));
            }
          }}
        />

        {mode === 'register' ? (
          <>
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
              onBlur={() => {
                const msg = phoneValidator(phone);
                if (msg) setErrors((p) => ({ ...p, phone: msg }));
              }}
            />

            {role === 'client' ? (
              <Field
                label="Your name"
                value={displayName}
                onChangeText={(v) => {
                  setDisplayName(v);
                  clearError('displayName');
                }}
                placeholder="Adam"
                autoCapitalize="words"
                leftIcon="A"
                error={errors.displayName}
              />
            ) : null}

            {role === 'shop' ? (
              <>
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
                  label="Shop address"
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

                <View style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      color: theme.muted,
                      fontSize: 12,
                      fontWeight: '800',
                      letterSpacing: 0.4,
                      marginBottom: 6,
                    }}
                  >
                    LOYALTY SYSTEM
                  </Text>
                  <SegmentedControl
                    value={loyaltyType}
                    onChange={setLoyaltyType}
                    options={[
                      { value: 'points', label: 'Points' },
                      { value: 'stamps', label: 'Stamps' },
                    ]}
                  />
                  <Text
                    style={{
                      marginTop: 8,
                      color: theme.subtle,
                      fontSize: 11.5,
                      lineHeight: 16,
                    }}
                  >
                    {loyaltyType === 'points'
                      ? '+10 points per purchase. Free reward at 100 points.'
                      : 'One stamp per purchase. The 10th stamp is a free reward.'}
                  </Text>
                </View>
              </>
            ) : null}
          </>
        ) : null}

        {generalError ? (
          <View style={{ marginTop: 6, padding: 10, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.10)' }}>
            <Text style={{ color: theme.danger, lineHeight: 18, fontWeight: '700', fontSize: 13 }}>
              {generalError}
            </Text>
          </View>
        ) : null}

        <Button
          title={mode === 'login' ? 'Sign in' : 'Create account'}
          onPress={onSubmit}
          loading={loading}
          size="lg"
        />
      </Card>

      {mode === 'register' ? (
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: theme.muted, fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 0.4 }}>
            CREATE ACCOUNT AS
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <RolePill
              label="Client"
              active={role === 'client'}
              onPress={() => {
                setRole('client');
                setErrors({});
              }}
            />
            <RolePill
              label="Shop"
              active={role === 'shop'}
              onPress={() => {
                setRole('shop');
                setErrors({});
              }}
            />
          </View>
          <Text style={{ marginTop: 10, color: theme.subtle, fontSize: 11.5, textAlign: 'center', paddingHorizontal: 24, lineHeight: 16 }}>
            Clients collect points by showing their QR. Shops scan client QRs and add points.
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: theme.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
            Sign in works for both shops and clients with your email.
          </Text>
        </View>
      )}

      <View style={{ marginTop: 14, alignItems: 'center' }}>
        <Pill tone="brand">SECURED</Pill>
        <Text style={{ marginTop: 8, color: theme.subtle, fontSize: 11.5, textAlign: 'center', lineHeight: 16, paddingHorizontal: 24 }}>
          By continuing you agree to our terms. Your data stays inside your account.
        </Text>
      </View>
    </Screen>
  );
}

function RolePill({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? theme.ink : theme.surface2,
        borderWidth: 1,
        borderColor: active ? theme.ink : theme.border,
      }}
    >
      <Text style={{ color: active ? '#fff' : theme.text, fontWeight: '900', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}
