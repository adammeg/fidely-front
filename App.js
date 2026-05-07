import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, Text, View } from 'react-native';
import { Spinner, BrandWordmark } from './src/ui/components';
import { useContext } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import ClientHomeScreen from './src/screens/ClientHomeScreen';
import ShopHomeScreen from './src/screens/ShopHomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ShopCardScreen from './src/screens/ShopCardScreen';
import ShopSettingsScreen from './src/screens/ShopSettingsScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import AdminUserScreen from './src/screens/AdminUserScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { booting, user } = useContext(AuthContext);

  if (booting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F6FB' }} edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Image
            source={require('./assets/logo.png')}
            style={{ width: 88, height: 88, marginBottom: 16, borderRadius: 22 }}
            resizeMode="contain"
          />
          <BrandWordmark size={22} />
          <Text style={{ marginTop: 6, color: 'rgba(11,18,32,0.55)', fontSize: 12.5, fontWeight: '600' }}>
            Loyalty, simplified.
          </Text>
          <View style={{ marginTop: 22 }}>
            <Spinner size={22} thickness={3} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      {user.role === 'admin' ? (
        <>
          <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AdminUser" component={AdminUserScreen} options={{ title: 'User' }} />
        </>
      ) : user.role === 'shop' ? (
        <>
          <Stack.Screen name="ShopHome" component={ShopHomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Scan" component={ScanScreen} options={{ title: 'Scan QR' }} />
          <Stack.Screen name="ShopCard" component={ShopCardScreen} options={{ title: 'Card' }} />
          <Stack.Screen name="ShopSettings" component={ShopSettingsScreen} options={{ title: 'Settings' }} />
        </>
      ) : (
        <Stack.Screen name="ClientHome" component={ClientHomeScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
