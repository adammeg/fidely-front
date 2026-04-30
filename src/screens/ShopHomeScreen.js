import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import { Button, Card, LogoMark, Screen, theme } from '../ui/components';

export default function ShopHomeScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushSending, setPushSending] = useState(false);

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

  async function addPurchase(cardId) {
    await api.post(`/cards/${cardId}/purchase`);
    await load();
  }

  async function redeem(cardId) {
    try {
      await api.post(`/cards/${cardId}/redeem`);
      await load();
    } catch (e) {
      // MVP: ignore
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
      const { sent, failed, targetedDevices, message } = res.data;
      Alert.alert(
        'Push',
        message ||
          `Sent: ${sent}${typeof failed === 'number' && failed > 0 ? `, failed: ${failed}` : ''} (devices targeted: ${targetedDevices ?? '—'})`
      );
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Request failed';
      Alert.alert('Push', msg);
    } finally {
      setPushSending(false);
    }
  }

  const header = (
    <>
      <Card style={{ marginBottom: 14 }}>
        <Button title="Scan client QR" onPress={() => navigation.navigate('Scan')} />
        <Button title="Card design (color / logo)" onPress={() => navigation.navigate('ShopSettings')} variant="secondary" />
      </Card>
      <Card style={{ marginBottom: 14 }}>
        <Text style={{ fontWeight: '900', color: theme.text, marginBottom: 8 }}>Push offers</Text>
        <Text style={{ color: theme.muted, fontSize: 12, marginBottom: 10, lineHeight: 16 }}>
          Sends an FCM notification to clients who registered a device token. Requires API Firebase credentials and client dev builds.
        </Text>
        <TextInput
          placeholder="Title"
          placeholderTextColor="rgba(15, 23, 42, 0.35)"
          value={pushTitle}
          onChangeText={setPushTitle}
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: theme.text,
            marginBottom: 8,
            backgroundColor: theme.surface2,
          }}
        />
        <TextInput
          placeholder="Message"
          placeholderTextColor="rgba(15, 23, 42, 0.35)"
          value={pushBody}
          onChangeText={setPushBody}
          multiline
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: theme.text,
            minHeight: 72,
            textAlignVertical: 'top',
            marginBottom: 10,
            backgroundColor: theme.surface2,
          }}
        />
        <Button title={pushSending ? 'Sending…' : 'Send push'} onPress={sendPushToClients} disabled={pushSending} />
      </Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontWeight: '900', color: theme.text, fontSize: 16 }}>Clients</Text>
        <TouchableOpacity onPress={load} disabled={loading}>
          <Text style={{ color: loading ? 'rgba(15, 23, 42, 0.25)' : theme.muted, fontWeight: '900' }}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const footer = (
    <>
      <View style={{ height: 8 }} />
      <Button title="Logout" onPress={signOut} variant="danger" />
    </>
  );

  return (
    <Screen
      scroll={false}
      title={`Good morning, ${user?.shopName || 'Shop'}`}
      subtitle="Scan a client QR to open their card, then add points (+10) per purchase. Redeem at 100 points."
      right={<LogoMark size={48} />}
    >
      <FlatList
        style={{ flex: 1 }}
        data={cards}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: cards.length === 0 && !loading ? 'center' : 'flex-start',
          paddingBottom: 8,
        }}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: '900', color: theme.text, fontSize: 16 }}>{item.client?.displayName || 'Client'}</Text>
            <Text style={{ color: theme.muted, marginTop: 6, marginBottom: 10 }}>{item.points} pts</Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Button title="+10 purchase" onPress={() => addPurchase(item.id)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Redeem 100" onPress={() => redeem(item.id)} variant="secondary" />
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginVertical: 18 }} />
          ) : (
            <Text style={{ color: theme.muted, lineHeight: 18, textAlign: 'center', paddingVertical: 10 }}>
              No clients yet. Tap “Scan client QR”.
            </Text>
          )
        }
      />
    </Screen>
  );
}
