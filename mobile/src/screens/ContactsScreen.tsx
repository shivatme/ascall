import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import * as Contacts from "expo-contacts";

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
      Alert.alert(`Calling ${contact.name}`, phoneNumber);
      // Optionally call makeCall(phoneNumber) here
    } else {
      Alert.alert("No Number", `${contact.name} doesn't have a phone number.`);
    }
  };

  const renderItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.number}>
        {item.phoneNumbers?.[0]?.number || "No number"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No contacts found</Text>}
      />
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
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1C22",
  },
  name: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  number: {
    fontSize: 14,
    color: "#D0D4DD",
    marginTop: 4,
  },
  empty: {
    color: "#D0D4DD",
    textAlign: "center",
    marginTop: 50,
  },
});

export default ContactsScreen;
