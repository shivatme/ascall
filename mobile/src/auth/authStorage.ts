import * as SecureStore from "expo-secure-store";

const key = "user";

type User = Record<string, any>;

const storeUser = async (user: User): Promise<void> => {
  try {
    const json = JSON.stringify(user);
    await SecureStore.setItemAsync(key, json);
    console.log("User stored");
  } catch (error) {
    console.log("Error storing user", error);
  }
};

const getUser = async (): Promise<User | null> => {
  try {
    const json = await SecureStore.getItemAsync(key);
    if (json) {
      return JSON.parse(json);
    }
    return null;
  } catch (error) {
    console.log("Error getting user", error);
    return null;
  }
};

const removeUser = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
    console.log("User removed");
  } catch (error) {
    console.log("Error removing user", error);
  }
};

export default {
  storeUser,
  getUser,
  removeUser,
};
