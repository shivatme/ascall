import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import CallNavigator from "./src/navigation/CallNavigator";
import { SocketProvider } from "./src/context/SocketContext";

const App = (): JSX.Element => {
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
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});

export default App;
