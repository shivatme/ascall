import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import CallNavigator from "./src/navigation/CallNavigator";
import { SocketProvider } from "./src/context/SocketContext";
import InternalServerErrorScreen from "./src/screens/InternalServerErrorScreen";
import { BACKEND_URL } from "./src/api/config";
import authStorage from "./src/auth/authStorage";
import AuthNavigator from "./src/navigation/AuthNavigator";
import AuthContext from "./src/auth/authContext";

const App = (): JSX.Element => {
  const [isBackendUp, setIsBackendUp] = useState<boolean | null>(null); // null = loading
  const [user, setUser] = useState<any>(null);

  const restoreUser = async () => {
    try {
      const user = await authStorage.getUser();
      if (user) {
        setUser(user);
      }
    } catch (error) {
      console.log("Error restoring user", error);
    }
  };
  useEffect(() => {
    restoreUser();
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

    checkBackend();
  }, []);

  if (isBackendUp === null) {
    // Loading spinner
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!isBackendUp) {
    return <InternalServerErrorScreen />;
  }

  return (
    <SocketProvider>
      <AuthContext.Provider value={{ user, setUser }}>
        <NavigationContainer>
          <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor="#000" />
            {user ? <CallNavigator /> : <AuthNavigator />}
          </SafeAreaView>
        </NavigationContainer>
      </AuthContext.Provider>
    </SocketProvider>
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
