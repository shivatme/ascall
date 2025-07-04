import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SocketProvider } from "./src/context/SocketContext";
import InternalServerErrorScreen from "./src/screens/InternalServerErrorScreen";
import { BACKEND_URL } from "./src/api/config";
import AuthNavigator from "./src/navigation/AuthNavigator";
import AuthContext from "./src/auth/authContext";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import appAuth from "./src/api/auth";
import { WebRTCProvider } from "./src/context/WebRTCContext";
// index.js
import { getMessaging } from "@react-native-firebase/messaging";
import AppNavigator from "./src/navigation/AppNavigator";
import { getApp } from "@react-native-firebase/app";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const App = (): JSX.Element => {
  const firebaseApp = getApp();
  const auth = getAuth(firebaseApp);
  const messaging = getMessaging(firebaseApp);
  messaging.setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("🔕 Background message:", remoteMessage);
    // Show call UI or store notification locally
  });
  const [isBackendUp, setIsBackendUp] = useState<boolean | null>(null); // null = loading
  const [user, setUser] = useState<any | null>(null);
  const [initializing, setInitializing] = useState(true);

  async function handleAuthStateChanged(user: any) {
    await handleLogin();
    if (initializing) setInitializing(false);
  }

  async function handleLogin() {
    const idToken = await auth.currentUser?.getIdToken();
    try {
      if (!idToken) throw new Error("No id token found");
      const { user: use1r } = await appAuth.login(idToken);
      setUser(use1r);
    } catch (err: any) {
      console.log(err);
    }
  }
  const checkBackend = async () => {
    try {
      const res = await fetch(BACKEND_URL + "/api/ping"); // Replace <YOUR_IP>
      const data = await res.json();
      setIsBackendUp(data.message === "pong");
    } catch (err) {
      console.error("Ping failed:", err);
      setIsBackendUp(false);
    }
  };

  useEffect(() => {
    const subscriber = onAuthStateChanged(
      getAuth(firebaseApp),
      handleAuthStateChanged
    );
    // checkBackend();
    return subscriber; // unsubscribe on unmount
  }, []);

  // if (!isBackendUp) {
  //   return <InternalServerErrorScreen />;
  // }
  //   if (isBackendUp === null) {
  //   // Loading spinner
  //   return (
  //     <View style={styles.centered}>
  //       <ActivityIndicator size="large" color="#000" />
  //       <StatusBar style="auto" />
  //     </View>
  //   );
  // }
  if (initializing) return <></>;

  return (
    <GestureHandlerRootView>
      <AuthContext.Provider value={{ user, setUser }}>
        <NavigationContainer>
          <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor="#000" />
            {user ? (
              <SocketProvider>
                <WebRTCProvider>
                  <AppNavigator />
                </WebRTCProvider>
              </SocketProvider>
            ) : (
              <AuthNavigator />
            )}
          </SafeAreaView>
        </NavigationContainer>
      </AuthContext.Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
