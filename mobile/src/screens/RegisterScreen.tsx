import React, { useState } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
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
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const handleSubmit = async ({
    name,
    email,
    password,
  }: RegisterFormValues) => {
    setError(undefined);
    setLoading(true);
    try {
      const user = await auth.register(email, password, name);
      console.log("Registration successful");
      login(user);
    } catch (err: any) {
      console.log("Registration failed", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          onChangeText={setName}
        />
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

        <Button
          title="Login"
          onPress={() => handleSubmit({ email, password, name })}
        />

        <Pressable onPress={() => navigation.goBack()}>
          <Text>login</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {},
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    margin: 10,
    padding: 10,
  },
});

export default RegisterScreen;
