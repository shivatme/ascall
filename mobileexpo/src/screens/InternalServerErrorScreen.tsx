import React from "react";
import { View, Text, StyleSheet } from "react-native";

const InternalServerErrorScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>500 - Internal Server Error</Text>
      <Text style={styles.subtitle}>
        Our backend isn't responding right now.
      </Text>
      <Text style={styles.details}>Please try again later.</Text>
    </View>
  );
};

export default InternalServerErrorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#d32f2f",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 5,
    color: "#333",
  },
  details: {
    fontSize: 14,
    color: "#777",
  },
});
