import { useRef, useState } from "react";
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
} from "react-native";
import TextInputContainer from "../components/AppTextInput";

interface MakeCallScreenProps {}

function MakeCallScreen({}: MakeCallScreenProps): JSX.Element {
  const [calleeId, setCalleeId] = useState<string>("");
  const [callerId] = useState(
    Math.floor(100000 + Math.random() * 900000).toString()
  );

  function makeCall(calleeId: string) {
    console.log(calleeId);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: "#050A0E",
        justifyContent: "center",
        paddingHorizontal: 42,
      }}
    >
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
                  fontSize: 32,
                  color: "#ffff",
                  letterSpacing: 6,
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
                backgroundColor: "#5568FE",
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
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default MakeCallScreen;
