import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import useAuth from "../auth/useAuth";
import auth from "../api/auth";

interface LoginScreenProps {
  navigation: any;
}

interface LoginFormValues {
  email: string;
  password: string;
}
type User = any;

function LoginScreen({ navigation }: LoginScreenProps): JSX.Element {
  const { login } = useAuth();

  const [form, setForm] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const validate = ({ email, password }: LoginFormValues): string | null => {
    if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  async function handleSubmit({ email, password }: LoginFormValues) {
    const validationError = validate({ email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user: User = await auth.login(email, password);
      login(user);
    } catch (err: any) {
      console.log(err);
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        autoCapitalize="none"
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        onPress={() => handleSubmit(form)}
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

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
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
    marginBottom: 20,
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
  },
  button: {
    backgroundColor: "#1E88E5",
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
  link: {
    color: "#90CAF9",
    textAlign: "center",
    fontSize: 14,
  },
  error: {
    color: "#FF5252",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default LoginScreen;
