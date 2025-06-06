import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
} from "react-native";
import TextInputContainer from "../components/AppTextInput";
import { useSocket } from "../context/SocketContext";
import useAuth from "../auth/useAuth";
import { initializeNotifications } from "../services/NotificationService";

interface MakeCallScreenProps {
  navigation: any;
}

function MakeCallScreen({ navigation }: MakeCallScreenProps): JSX.Element {
  const { user } = useAuth();
  // console.log(user.);
  const [calleeId, setCalleeId] = useState<string>("9320594759");
  const [callerId] = useState(user.phone?.slice(3));
  const { socket, callState } = useSocket();
  useEffect(() => {
    if (socket) {
      console.log("Registering user with socket ID");
      socket.emit("register-user", callerId); // Register user on backend with their unique ID
    } else {
      console.log("Socket is not initialized yet.");
    }
  }, [socket, callerId]);
  function makeCall(calleeId: string) {
    const roomId = Math.random().toString();
    navigation.navigate("OutgoingCall", {
      calleeId,
      roomId,
    });
    // callUser(calleeId, roomId);
  }

  useEffect(() => {
    if (callState.state === "incomingCall" && callState.incomingCall) {
      // console.log("Incoming call", callState.incomingCall);
      navigation.navigate("IncomingCall", {
        callerId: callState.incomingCall.from,
        roomId: callState.incomingCall.roomId,
      });
    }
  }, [callState]);

  useEffect(() => {
    if (callerId) {
      initializeNotifications(callerId);
    }
  }, [callerId]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{
        flex: 1,
        backgroundColor: "#050A0E",
        justifyContent: "center",
        paddingHorizontal: 42,
      }}
    >
      <Pressable onPress={() => navigation.navigate("Setting")}>
        <Text style={{ color: "#fff" }}>Settings</Text>
      </Pressable>
      <Pressable onPress={Keyboard.dismiss}>
        <>
          <View
            style={{
              padding: 35,
              backgroundColor: "#1A1C22",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: "#D0D4DD",
              }}
            >
              Your Caller ID
            </Text>
            <View
              style={{
                flexDirection: "row",
                marginTop: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  color: "#ffff",
                }}
              >
                {callerId}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#1A1C22",
              padding: 40,
              marginTop: 25,
              justifyContent: "center",
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: "#D0D4DD",
              }}
            >
              Enter call id of another user
            </Text>

            <TextInputContainer
              placeholder={"Enter Caller ID"}
              value={calleeId}
              setValue={(text: string) => {
                setCalleeId(text);
              }}
              keyboardType={"tel"}
            />

            <TouchableOpacity
              onPress={() => {
                makeCall(calleeId);
              }}
              style={{
                height: 50,
                backgroundColor: "#1E88E5",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 12,
                marginTop: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                Call Now
              </Text>
            </TouchableOpacity>
          </View>
        </>

        <Button
          title="Contacts"
          onPress={() => navigation.navigate("ContactsScreen")}
        />
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default MakeCallScreen;
