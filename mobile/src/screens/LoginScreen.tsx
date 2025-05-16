import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Pressable,
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
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginFailed, setLoginFailed] = useState(false);
  async function handleSubmit({ email, password }: LoginFormValues) {
    try {
      const user: User = await auth.login(email, password);
      login(user);
    } catch (error) {
      console.log(error);
      setLoginFailed(true);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={() => handleSubmit({ email, password })} />

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text>Signup</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    margin: 10,
    padding: 10,
  },
});

export default LoginScreen;
