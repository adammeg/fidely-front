import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, View } from 'react-native';
import { useContext } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import RoleScreen from './src/screens/RoleScreen';
import AuthScreen from './src/screens/AuthScreen';
import ClientHomeScreen from './src/screens/ClientHomeScreen';
import ShopHomeScreen from './src/screens/ShopHomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ShopCardScreen from './src/screens/ShopCardScreen';
import ShopSettingsScreen from './src/screens/ShopSettingsScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { booting, user } = useContext(AuthContext);

  if (booting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7FB' }} edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            source={require('./assets/logo.png')}
            style={{ width: 96, height: 96, marginBottom: 18, borderRadius: 22 }}
            resizeMode="contain"
          />
          <ActivityIndicator color="#22C55E" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Role" component={RoleScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      {user.role === 'shop' ? (
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
