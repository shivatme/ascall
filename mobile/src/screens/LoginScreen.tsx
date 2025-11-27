import React, { JSX, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import useAuth from "../auth/useAuth";
import { login as loginApi } from "../api/auth";

interface LoginScreenProps {
  navigation: any;
}

function LoginScreen({ navigation }: LoginScreenProps): JSX.Element {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { user } = await loginApi(email, password);
      login(user);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again.",
      );
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        onPress={handleLogin}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>

      <Pressable onPress={() => navigation.navigate("RegisterScreen")}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
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
  input: {
    height: 50,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "#fff",
    backgroundColor: "#1E1E1E",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1E88E5",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    color: "#90CAF9",
    textAlign: "center",
    fontSize: 14,
  },
  error: {
    color: "#FF5252",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
  },
});

export default LoginScreen;
