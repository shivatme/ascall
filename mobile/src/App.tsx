import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthContext from "./auth/authContext";
import { NavigationContainer } from "@react-navigation/native";
import { SocketProvider } from "./context/SocketContext";
import { WebRTCProvider } from "./context/WebRTCContext";
import AppNavigator from "./navigation/AppNavigator";
import AuthNavigator from "./navigation/AuthNavigator";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getApp } from "@react-native-firebase/app";
import { getMessaging } from "@react-native-firebase/messaging";
import authStorage from "./auth/authStorage";

function App() {
  const isDarkMode = useColorScheme() === "dark";
  const [user, setUser] = useState<any | null>(null);

  const firebaseApp = getApp();

  const messaging = getMessaging(firebaseApp);
  messaging.setBackgroundMessageHandler(async remoteMessage => {
    console.log("🔕 Background message:", remoteMessage);
  });
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        const storedUser = await authStorage.getUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (err) {
        console.log("Error retrieving stored user:", err);
      } finally {
        setInitializing(false);
      }
    };

    checkStoredUser();
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
              barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
          </SafeAreaProvider>
        </NavigationContainer>
      </AuthContext.Provider>
    </GestureHandlerRootView>
  );
}

export default App;
