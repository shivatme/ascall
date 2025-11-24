/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AuthContext from './auth/authContext';
import { NavigationContainer } from '@react-navigation/native';
import { SocketProvider } from './context/SocketContext';
import { WebRTCProvider } from './context/WebRTCContext';
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getApp } from '@react-native-firebase/app';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { getMessaging } from '@react-native-firebase/messaging';
import { login } from './api/auth';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [user, setUser] = useState<any | null>(null);

  const firebaseApp = getApp();
  const auth = getAuth(firebaseApp);

  const messaging = getMessaging(firebaseApp);
  messaging.setBackgroundMessageHandler(async remoteMessage => {
    console.log('🔕 Background message:', remoteMessage);
  });
  const [initializing, setInitializing] = useState(true);

  async function handleAuthStateChanged(user: any) {
    await handleLogin();
    if (initializing) setInitializing(false);
  }
  async function handleLogin() {
    const idToken = await auth.currentUser?.getIdToken();
    try {
      if (!idToken) throw new Error('No id token found');
      const { user: use1r } = await login(idToken);
      setUser(use1r);
    } catch (err: any) {
      console.log(err);
    }
  }

  useEffect(() => {
    const subscriber = onAuthStateChanged(
      getAuth(firebaseApp),
      handleAuthStateChanged,
    );
    // checkBackend();
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return <></>;

  return (
    <GestureHandlerRootView>
      <AuthContext.Provider value={{ user, setUser }}>
        <NavigationContainer>
          <SafeAreaProvider>
            {user ? (
              <SocketProvider>
                <WebRTCProvider>
                  <AppNavigator />
                </WebRTCProvider>
              </SocketProvider>
            ) : (
              <AuthNavigator />
            )}
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />
            <AppContent />
          </SafeAreaProvider>
        </NavigationContainer>
      </AuthContext.Provider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
