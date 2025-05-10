import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

interface ButtonProps {
  onPress?: any;
  title: string;
}

function Button({ onPress, title }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
  },
});

export default Button;
