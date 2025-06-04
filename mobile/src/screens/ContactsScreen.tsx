import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import * as Contacts from "expo-contacts";
import { RouteProp } from "@react-navigation/native";

type Contact = Contacts.Contact;

type RootStackParamList = {
  "Select Contact": undefined;
  // Add more screens like:
  // CallScreen: { name: string; phone: string };
};

type Props = {
  navigation: any;
  route: any;
};

const ContactsScreen: React.FC<Props> = ({ navigation }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        const filtered = data.filter(
          (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0
        );
        setContacts(filtered);
      } else {
        Alert.alert(
          "Permission Denied",
          "Please allow contact access to continue."
        );
      }
    })();
  }, []);

  const handleSelect = (contact: Contact) => {
    const phoneNumber = contact.phoneNumbers?.[0]?.number;
    if (phoneNumber) {
      Alert.alert(`Calling ${contact.name}`, phoneNumber);
      // navigation.navigate('CallScreen', { name: contact.name, phone: phoneNumber });
    } else {
      Alert.alert("No Phone Number", `${contact.name} has no phone number.`);
    }
  };

  const renderItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
      }}
    >
      <Text style={{ fontSize: 16 }}>{item.name}</Text>
      <Text style={{ color: "#888" }}>
        {item.phoneNumbers?.[0]?.number || "No number"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ margin: 20 }}>No contacts found</Text>
        }
      />
    </View>
  );
};

export default ContactsScreen;
