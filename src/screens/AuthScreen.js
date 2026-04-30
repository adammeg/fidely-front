import { useContext, useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getApiErrorMessage } from '../lib/errors';
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

export default function AuthScreen({ route, navigation }) {
  const role = route?.params?.role || 'client';
  const { signIn, register } = useContext(AuthContext);

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleLabel = useMemo(() => (role === 'shop' ? 'Shop' : 'Client'), [role]);
  const roleTone = role === 'shop' ? 'brand' : 'default';

  async function onSubmit() {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await register({
          role,
          email: email.trim(),
          password,
          shopName: role === 'shop' ? shopName.trim() : undefined,
          displayName: role === 'client' ? displayName.trim() : undefined,
        });
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentAlign="top">
      <View style={{ alignItems: 'center', marginBottom: 18 }}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 10 }}
          resizeMode="contain"
        />
        <BrandWordmark size={22} />
        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pill tone={roleTone}>{roleLabel.toUpperCase()}</Pill>
          <Pressable onPress={() => navigation?.goBack?.()}>
            <Text style={{ color: theme.muted, fontSize: 12, fontWeight: '800' }}>Switch role</Text>
          </Pressable>
        </View>
      </View>

      <Card>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'login', label: 'Sign in' },
            { value: 'register', label: 'Create account' },
          ]}
        />

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          keyboardType="email-address"
          leftIcon="@"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          leftIcon="•"
        />

        {mode === 'register' && role === 'shop' ? (
          <Field
            label="Shop name"
            value={shopName}
            onChangeText={setShopName}
            placeholder="My Coffee"
            autoCapitalize="words"
            leftIcon="S"
          />
        ) : null}
        {mode === 'register' && role === 'client' ? (
          <Field
            label="Your name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Adam"
            autoCapitalize="words"
            leftIcon="A"
          />
        ) : null}

        {error ? (
          <View style={{ marginTop: 6, padding: 10, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.10)' }}>
            <Text style={{ color: theme.danger, lineHeight: 18, fontWeight: '700', fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        <Button
          title={loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          onPress={onSubmit}
          disabled={loading}
          size="lg"
        />
      </Card>

      <View style={{ marginTop: 16, alignItems: 'center' }}>
        <Text style={{ color: theme.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
          By continuing you agree to our terms. {'\n'}Your data stays inside your account.
        </Text>
      </View>
    </Screen>
  );
}
