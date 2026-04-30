import { useContext, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getApiErrorMessage } from '../lib/errors';
import { Button, Card, Field, LogoMark, Screen, theme } from '../ui/components';

export default function AuthScreen({ route }) {
  const role = route?.params?.role || 'client';
  const { signIn, register } = useContext(AuthContext);

  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleLabel = useMemo(() => (role === 'shop' ? 'Shop' : 'Client'), [role]);

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
    <Screen
      title={`${roleLabel}`}
      subtitle={mode === 'login' ? 'Welcome back. Sign in to continue.' : 'Create an account in less than a minute.'}
      right={<LogoMark size={48} />}
    >
      <Card>
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />

        {mode === 'register' && role === 'shop' ? (
          <Field label="Shop name" value={shopName} onChangeText={setShopName} placeholder="My Coffee" autoCapitalize="words" />
        ) : null}
        {mode === 'register' && role === 'client' ? (
          <Field label="Your name" value={displayName} onChangeText={setDisplayName} placeholder="Adam" autoCapitalize="words" />
        ) : null}

        {error ? (
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: theme.danger, lineHeight: 18, fontWeight: '700' }}>{error}</Text>
          </View>
        ) : null}

        <Button title={loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'} onPress={onSubmit} disabled={loading} />
        <Button
          title={mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
          onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          variant="secondary"
          disabled={loading}
        />
      </Card>
    </Screen>
  );
}

