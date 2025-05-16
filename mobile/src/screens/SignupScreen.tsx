import React from "react";
import { View, StyleSheet, Text } from "react-native";

interface SignupScreenProps {}

function SignupScreen(props: SignupScreenProps): JSX.Element {
  return (
    <View style={styles.container}>
      <Text>Signup Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default SignupScreen;
