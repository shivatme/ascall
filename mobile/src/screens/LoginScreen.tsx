import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import auth, {
  firebase,
  getAuth,
  signInWithPhoneNumber,
} from "@react-native-firebase/auth";
import useAuth from "../auth/useAuth";
import appAuth from "../api/auth";

interface LoginScreenProps {
  navigation: any;
}

function LoginScreen({ navigation }: LoginScreenProps): JSX.Element {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirmResult, setConfirmResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPhoneNumber(getAuth(), phoneNumber);
      setConfirmResult(result);
      Alert.alert("OTP Sent", "Please check your phone.");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmResult) return;
    setLoading(true);
    setError(null);
    try {
      const result = await confirmResult.confirm(code);
      const user = result.user;
      console.log(await firebase.auth().currentUser?.getIdToken());
      handleLogin();
    } catch (err: any) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  async function handleLogin() {
    const idToken = await firebase.auth().currentUser?.getIdToken();
    try {
      if (!idToken) throw new Error("No id token found");
      const { token, user } = await appAuth.login(idToken);
      login(user);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login with Phone</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      {confirmResult && (
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor="#888"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
        />
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        onPress={confirmResult ? handleVerifyCode : handleSendCode}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {confirmResult ? "Verify OTP" : "Send OTP"}
          </Text>
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
