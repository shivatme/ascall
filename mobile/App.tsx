import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { socket } from "./src/socket";

export default function App() {
  useEffect(() => {
    console.log("Connecting to server...");
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
      socket.emit("join", "room-123");
    });

    socket.on("user-joined", (userId) => {
      console.log("Another user joined:", userId);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Video Call App</Text>
    </View>
  );
}
