import React from "react";
import { View, StyleSheet, Text, Pressable, Alert, Image } from "react-native";
import useAuth from "../auth/useAuth";
import { getAuth, signOut } from "@react-native-firebase/auth";
import { getApp } from "@react-native-firebase/app";

function SettingsScreen(): JSX.Element {
  const { logout, user } = useAuth();
  const firebaseApp = getApp();
  const auth = getAuth(firebaseApp);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: LogoutFirebase, style: "destructive" },
    ]);
  };

  const LogoutFirebase = () => {
    signOut(auth);
    logout();
  };
  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: `https://ui-avatars.com/api/?name=${
              user?.name.toLowerCase() || "User"
            }&background=random`,
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name || "Unnamed User"}</Text>
        <Text style={styles.email}>{user?.email || "No email"}</Text>
      </View>

      {/* Account Info Section */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Phone Number</Text>
        <Text style={styles.infoValue}>{user?.phone || "Not linked"}</Text>
      </View>

      {/* Logout Button */}
      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
    paddingTop: 60,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#333",
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  email: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  infoLabel: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 6,
  },
  infoValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#ff3b30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SettingsScreen;
