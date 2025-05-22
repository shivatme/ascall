import { getApp } from "@react-native-firebase/app";
import messaging, {
  AuthorizationStatus,
  getMessaging,
  requestPermission,
} from "@react-native-firebase/messaging";
import { Alert, Platform, PermissionsAndroid } from "react-native";
import { BACKEND_URL } from "../api/config";
import RNCallKeep from "react-native-callkeep";

const options = {
  ios: {
    appName: "My app name",
  },
  android: {
    alertTitle: "Permissions required",
    alertDescription: "This application needs to access your phone accounts",
    cancelButton: "Cancel",
    okButton: "ok",
    imageName: "phone_account_icon",
    additionalPermissions: [PermissionsAndroid.PERMISSIONS.example],
    // Required to get audio in background when using Android 11
    foregroundService: {
      channelId: "com.company.my",
      channelName: "Foreground service for my app",
      notificationTitle: "My app is running on background",
      notificationIcon: "Path to the resource icon of the notification",
    },
  },
};

export async function initializeNotifications(userId: String) {
  const permissionGranted = await requestPermissionAndGetToken(userId);
  if (permissionGranted) {
    setupListeners();
  }
}

// Handles permission + token generation
async function requestPermissionAndGetToken(userId: String) {
  try {
    // On Android 13+, request POST_NOTIFICATIONS permission explicitly
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn("🔕 Notification permission not granted");
        return false;
      }
    }
    // RNCallKeep.setup(options).then((accepted) => {});
    // RNCallKeep.setAvailable(true);

    const app = getApp();
    const messaging = getMessaging(app);

    messaging.setBackgroundMessageHandler(async (remoteMessage) => {
      const callUUID = "sfdsdf";

      //   RNCallKeep.displayIncomingCall(callUUID, "true");

      const callerName = remoteMessage.data?.callerName || "Unknown Caller";
    });

    // Request FCM permission (iOS or Android unified API)
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn("🔕 FCM permission not granted");
      return false;
    }

    const token = await messaging.getToken();
    console.log("📲 FCM Token:", token);

    // Send token to your backend mapped to userId
    await fetch(BACKEND_URL + "/api/notification/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token }),
    });

    return true;
  } catch (error) {
    console.error("❌ Error requesting permission or getting token:", error);
    return false;
  }
}

// Foreground listener only — background handled separately at top-level
function setupListeners() {
  const app = getApp();
  const messaging = getMessaging(app);
  messaging.onMessage(async (remoteMessage) => {
    console.log(remoteMessage);
    Alert.alert("📞 Incoming Call", remoteMessage.notification?.body || "");
    // Optional: trigger native call UI like react-native-callkeep
  });
}
