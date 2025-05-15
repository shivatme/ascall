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

const App = (): JSX.Element => {
  const [isBackendUp, setIsBackendUp] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
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
      <NavigationContainer>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" backgroundColor="#000" />
          <CallNavigator />
        </SafeAreaView>
      </NavigationContainer>
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
