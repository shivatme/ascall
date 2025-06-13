import { useEffect, useState } from "react";
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
  FlatList,
} from "react-native";
import * as Contacts from "expo-contacts";
import TextInputContainer from "../components/AppTextInput";
import { useSocket } from "../context/SocketContext";
import useAuth from "../auth/useAuth";
import { initializeNotifications } from "../services/NotificationService";

interface HomeScreenProps {
  navigation: any;
}

function HomeScreen({ navigation }: HomeScreenProps): JSX.Element {
  const { user } = useAuth();
  const [calleeId, setCalleeId] = useState<string>("");
  const [callerId] = useState(user.phone?.slice(3));
  const { socket, callState } = useSocket();

  const [searchQuery, setSearchQuery] = useState("");
  const [allContacts, setAllContacts] = useState<Contacts.Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contacts.Contact[]>(
    []
  );

  // Request permission and load contacts
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        const contactsWithPhone = data.filter(
          (c) => c.phoneNumbers && c.phoneNumbers.length > 0
        );
        setAllContacts(contactsWithPhone);
      }
    })();
  }, []);

  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredContacts([]);
    } else {
      const filtered = allContacts.filter((contact) =>
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered.slice(0, 5)); // Show top 5 results
    }
  }, [searchQuery, allContacts]);

  // Register socket
  useEffect(() => {
    if (socket) {
      socket.emit("register-user", callerId);
    }
  }, [socket, callerId]);

  // Handle call
  function makeCall(calleeId: string) {
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
      <TextInput
        style={styles.searchInput}
        placeholder="Search contact"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Floating Contact Suggestions */}
      {filteredContacts.length > 0 && (
        <View style={styles.floatingList}>
          <FlatList
            data={filteredContacts}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  const phone = item.phoneNumbers?.[0]?.number?.replace(
                    /\D/g,
                    ""
                  );
                  if (phone) setCalleeId(phone);
                  setSearchQuery("");
                  setFilteredContacts([]);
                }}
              >
                <Text style={styles.contactItem}>
                  {item.name} - {item.phoneNumbers?.[0]?.number}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <View style={styles.callBox}>
          <Text style={styles.label}>Or enter number manually</Text>

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

        <TouchableOpacity onPress={() => navigation.navigate("ContactsScreen")}>
          <Text
            style={{ color: "#1E88E5", textAlign: "center", marginTop: 16 }}
          >
            Open Full Contacts
          </Text>
        </TouchableOpacity>
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
    marginTop: 60,
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: "#1A1C22",
    color: "#FFFFFF",
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
