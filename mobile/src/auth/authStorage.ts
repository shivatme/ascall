import * as Keychain from "react-native-keychain";

const SERVICE = "ascall_user";

type User = Record<string, any>;

const storeUser = async (user: User): Promise<void> => {
  try {
    const json = JSON.stringify(user);
    await Keychain.setGenericPassword("user", json, { service: SERVICE });
    console.log("User stored");
  } catch (error) {
    console.log("Error storing user", error);
  }
};

const getUser = async (): Promise<User | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE });
    if (credentials) {
      return JSON.parse(credentials.password);
    }
    return null;
  } catch (error) {
    console.log("Error getting user", error);
    return null;
  }
};

const removeUser = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
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
