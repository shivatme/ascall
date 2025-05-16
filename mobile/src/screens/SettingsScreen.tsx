import React from "react";
import { View, StyleSheet, Text, Pressable, Alert } from "react-native";
import useAuth from "../auth/useAuth";

interface SettingsScreenProps {}

function SettingsScreen(props: SettingsScreenProps): JSX.Element {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 30,
    color: "#fff",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#E53935",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default SettingsScreen;
