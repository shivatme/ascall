import React from "react";
import { View, TextInput, InputModeOptions } from "react-native";

interface TextInputContainerProps {
  placeholder: string;
  value: string;
  setValue: any;
  keyboardType: InputModeOptions;
}

function TextInputContainer({
  placeholder,
  value,
  setValue,
  keyboardType,
}: TextInputContainerProps): JSX.Element {
  return (
    <View
      style={{
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#202427",
        borderRadius: 12,
        marginVertical: 12,
      }}
    >
      <TextInput
        style={{
          margin: 8,
          padding: 8,
          width: "90%",
          textAlign: "center",
          fontSize: 16,
          color: "#FFFFFF",
        }}
        multiline={true}
        numberOfLines={1}
        cursorColor={"#5568FE"}
        placeholder={placeholder}
        placeholderTextColor={"#9A9FA5"}
        onChangeText={(text) => {
          setValue(text);
        }}
        value={value}
        inputMode={keyboardType}
      />
    </View>
  );
}

export default TextInputContainer;
