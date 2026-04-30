import { Text, View } from 'react-native';
import { Button, Card, LogoMark, Screen, theme } from '../ui/components';

export default function RoleScreen({ navigation }) {
  return (
    <Screen
      title="Fidely"
      subtitle="Create a loyalty program for your shop, or collect points as a client. Scan QR to connect—then earn 10 pts per purchase and redeem at 100."
      right={<LogoMark size={48} />}
    >
      <Card>
        <Text style={{ color: theme.muted, marginBottom: 10, lineHeight: 20 }}>
          Choose how you want to use the app.
        </Text>
        <Button title="Continue as Shop" onPress={() => navigation.navigate('Auth', { role: 'shop' })} />
        <Button title="Continue as Client" onPress={() => navigation.navigate('Auth', { role: 'client' })} variant="secondary" />
      </Card>

      <View style={{ height: 14 }} />
      <Text style={{ color: theme.muted, fontSize: 12, lineHeight: 16 }}>
        Tip: shops scan the client QR to open the correct card instantly.
      </Text>
    </Screen>
  );
}

