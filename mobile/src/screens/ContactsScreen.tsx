import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";
import * as Contacts from "expo-contacts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
type Contact = Contacts.Contact;

const ContactsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        const filtered = data.filter((contact) => contact.phoneNumbers?.length);
        setContacts(filtered);
        setFilteredContacts(filtered);
      } else {
        Alert.alert(
          "Permission Denied",
          "Enable contact access in settings to use this feature."
        );
      }
    })();
  }, []);

  const handleSelect = (contact: Contact) => {
    const phoneNumber = contact.phoneNumbers?.[0]?.number;
    if (phoneNumber) {
      navigation.navigate("CallNavigator", {
        screen: "MakeCallScreen",
        params: {
          calleeId: phoneNumber,
          roomId: Math.random().toString(),
          contact: contact,
        },
      });
      // Optionally call makeCall(phoneNumber) here
    } else {
      Alert.alert("No Number", `${contact.name} doesn't have a phone number.`);
    }
  };

  const renderItem = ({ item }: { item: Contact }) => {
    const name = item.name || "Unknown";
    const number = item.phoneNumbers?.[0]?.number || "No number";

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="account-circle"
          size={48}
          color="#ef6c00"
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.number} numberOfLines={1}>
            {number}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<Contacts.Contact[]>(
    []
  );
  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((contact) =>
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered.slice(0, 5)); // Show top 5 results
    }
  }, [searchQuery, contacts]);
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          // backgroundColor: "red",
          marginTop: 60,
          alignItems: "center",
        }}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Search contact or dial a number"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View
        style={{
          // padding: 5,
          marginTop: 10,
          marginHorizontal: 5,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <FlatList
          data={filteredContacts}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No contacts found</Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050A0E",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchInput: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 20,
    backgroundColor: "#1A1C22",
    justifyContent: "center",
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    // borderBottomWidth: 1,
    borderBottomColor: "#2C2E36",
    backgroundColor: "#121417",
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  number: {
    fontSize: 14,
    color: "#A0A4AE",
    marginTop: 2,
  },
  empty: {
    color: "#D0D4DD",
    textAlign: "center",
    marginTop: 50,
  },
});

export default ContactsScreen;
