import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Button from "./Button";
\

interface GettingCallProps {
    hangup: any;
    join: any;
}

function GettingCall(props: GettingCallProps): JSX.Element {
  return (
    <View style={styles.container}>
      <Text>GettingCall</Text>
      <Button title="Hang Up" onPress={props.hangup} />
      <Button title="Join" onPress={props.join} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GettingCall;
