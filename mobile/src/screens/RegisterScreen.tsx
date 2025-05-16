import React, { useState } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";

import useAuth from "../auth/useAuth";
import auth from "../api/auth";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

interface RegisterScreenProps {
  navigation: any;
}

function RegisterScreen({ navigation }: RegisterScreenProps): JSX.Element {
  const { login } = useAuth();

  const [form, setForm] = useState<RegisterFormValues>({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const validate = ({
    name,
    email,
    password,
  }: RegisterFormValues): string | null => {
    if (!name.trim()) return "Name is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async () => {
    setError(undefined);

    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const user = await auth.register(form.email, form.password, form.name);
      login(user);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#888"
        autoCapitalize="words"
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />
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
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </Pressable>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
    textAlign: "center",
    color: "#fff",
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

export default RegisterScreen;
