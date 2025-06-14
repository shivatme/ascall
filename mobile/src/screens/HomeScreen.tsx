import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  Text,
  TouchableOpacity,
} from "react-native";
import TextInputContainer from "../components/AppTextInput";
import { useSocket } from "../context/SocketContext";
import useAuth from "../auth/useAuth";
import { initializeNotifications } from "../services/NotificationService";
import { MaterialIcons } from "@expo/vector-icons";

interface HomeScreenProps {
  navigation: any;
}

function HomeScreen({ navigation }: HomeScreenProps): JSX.Element {
  const { user } = useAuth();
  const [calleeId, setCalleeId] = useState<string>("");
  const [callerId] = useState(user.phone?.slice(3));
  const { socket, callState } = useSocket();

  // Register socket
  useEffect(() => {
    if (socket) {
      socket.emit("register-user", callerId);
    }
  }, [socket, callerId]);

  // Handle call
  function makeCall(calleeId: string) {
    if (calleeId.trim().length === 0) return;
    const roomId = Math.random().toString();
    navigation.navigate("CallNavigator", {
      screen: "MakeCallScreen",
      params: { calleeId, roomId },
    });
  }

  // Incoming call handler
  useEffect(() => {
    if (callState.state === "incomingCall" && callState.incomingCall) {
      navigation.navigate("IncomingCallScreen", {
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
      style={styles.container}
    >
      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          // backgroundColor: "red",
          marginTop: 60,
          alignItems: "center",
        }}
      >
        <Pressable
          style={styles.searchInput}
          onPress={() => navigation.navigate("ContactsScreen")}
        >
          <Text style={styles.searchInputText}>Search contacts</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("SettingScreen")}
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ef6c00",
            // padding: 10,
            height: 35,
            width: 35,
            borderRadius: 100,
            // marginLeft: 20,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "500",
              fontSize: 16,
            }}
          >
            {user.name[0] || "U"}
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <View style={styles.callBox}>
          <Text style={styles.label}>Enter number manually</Text>

          <TextInputContainer
            placeholder={"Enter Caller ID"}
            value={calleeId}
            setValue={(text: string) => setCalleeId(text)}
            keyboardType={"tel"}
          />

          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => makeCall(calleeId)}
          >
            <Text style={styles.callBtnText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
      <Pressable
        style={{
          position: "absolute",
          bottom: 20,
          right: 30,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: "#0277BD",
          padding: 10,
          borderRadius: 10,
        }}
        onPress={() => navigation.navigate("ContactsScreen")}
      >
        <MaterialIcons name="contacts" size={30} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 16 }}>Contacts</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050A0E",
    paddingHorizontal: 42,
  },
  searchInput: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 20,
    backgroundColor: "#1A1C22",
    justifyContent: "center",
    flex: 1,
  },
  searchInputText: {
    color: "#cccccc",
    fontSize: 16,
  },
  floatingList: {
    position: "absolute",
    top: 110,
    left: 42,
    right: 42,
    backgroundColor: "#3e3e3e",
    borderRadius: 8,
    zIndex: 999,
    maxHeight: 200,
  },
  contactItem: {
    padding: 12,
    color: "#fff",
    borderBottomWidth: 0.5,
    borderColor: "#333",
  },
  card: {
    padding: 35,
    backgroundColor: "#1A1C22",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    marginTop: 20,
  },
  callBox: {
    backgroundColor: "#1A1C22",
    padding: 40,
    marginTop: 25,
    justifyContent: "center",
    borderRadius: 14,
  },
  label: {
    fontSize: 18,
    color: "#D0D4DD",
  },
  phoneText: {
    fontSize: 22,
    color: "#ffff",
    marginTop: 12,
  },
  callBtn: {
    height: 50,
    backgroundColor: "#1E88E5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: 16,
  },
  callBtnText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
});

export default HomeScreen;
