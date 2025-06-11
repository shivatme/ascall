import React, { useRef, useState } from "react";
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
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [verificationInProgress, setVerificationInProgress] =
    useState<boolean>(false);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      setError("Phone number is required.");
      return;
    }
    const fullPhoneNumber = `+91${phoneNumber}`;

    setLoading(true);
    setError(null);
    try {
      const response = await signInWithPhoneNumber(getAuth(), fullPhoneNumber);
      setConfirmResult(response);
      setVerificationInProgress(true);
    } catch (err: any) {
      console.log(err.message);
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmResult) return;
    setLoading(true);
    setError(null);
    setCodeSubmitted(true);
    try {
      const result = await confirmResult.confirm(code);
      handleLogin();
    } catch (err: any) {
      setError("Invalid code. Please try again.");
      setCodeSubmitted(false);
      setLoading(false);
    }
  };

  async function handleLogin() {
    const idToken = await firebase.auth().currentUser?.getIdToken();
    try {
      if (!idToken) {
        throw new Error("No id token found");
      }
      const { token, user, isNewUser } = await appAuth.login(idToken);
      login(user);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function changePhoneNumber() {
    setVerificationInProgress(false);
    setConfirmResult(null);
    setTimeout(() => {
      phoneRef.current?.focus();
    }, 100);
  }

  const phoneRef = useRef<TextInput>(null);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login with Phone</Text>

      {/* Phone input with +91 */}
      <View style={styles.phoneRow}>
        <Text style={styles.phonePrefix}>+91</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
          maxLength={10}
          ref={phoneRef}
          editable={!verificationInProgress}
        />
      </View>

      {/* OTP Input */}
      {verificationInProgress && (
        <View style={styles.phoneRow}>
          <TextInput
            style={[styles.input, codeSubmitted && styles.disabledInput]}
            placeholder="Enter OTP"
            placeholderTextColor="#888"
            keyboardType="number-pad"
            value={code}
            onChangeText={(text) => !codeSubmitted && setCode(text)}
            editable={!codeSubmitted}
          />
        </View>
      )}

      {/* Error Message */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Send or Verify Button */}
      <Pressable
        onPress={verificationInProgress ? handleVerifyCode : handleSendCode}
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
            {verificationInProgress ? "Verify OTP" : "Send OTP"}
          </Text>
        )}
      </Pressable>

      {verificationInProgress && (
        <Pressable
          onPress={changePhoneNumber}
          hitSlop={10}
          style={{
            width: "80%",
            alignSelf: "center",
            justifyContent: "flex-end",
            flexDirection: "row",
          }}
        >
          <Text style={styles.link}>Edit Phone Number</Text>
        </Pressable>
      )}
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
  phoneRow: {
    flexDirection: "row",
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 10,
  },
  phonePrefix: {
    color: "#fff",
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#fff",
    backgroundColor: "transparent",
    fontSize: 18,
  },
  disabledInput: {
    opacity: 0.5,
  },
  button: {
    backgroundColor: "#1E88E5",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    width: "60%",
    marginTop: 15,
    alignSelf: "center",
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
