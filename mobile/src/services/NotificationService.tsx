import { getApp } from "@react-native-firebase/app";
import messaging, {
  AuthorizationStatus,
  getMessaging,
  requestPermission,
} from "@react-native-firebase/messaging";
import { Alert, Platform, PermissionsAndroid } from "react-native";
import { BACKEND_URL } from "../api/config";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";

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

    const app = getApp();
    const messaging = getMessaging(app);

    messaging.setBackgroundMessageHandler(async (remoteMessage) => {
      const { title, body } = remoteMessage.notification || {};
      onDisplayNotification(remoteMessage.notification);
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

function setupListeners() {
  const app = getApp();
  const messaging = getMessaging(app);

  messaging.onMessage(async (remoteMessage) => {
    console.log("📥 Foreground FCM:", remoteMessage);
    await onDisplayNotification(remoteMessage);
  });
}

async function onDisplayNotification(remoteMessage: any) {
  console.log(remoteMessage.data, "dxds");
  const { title, body, calleeId } = remoteMessage.data || {};
  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    importance: AndroidImportance.HIGH, // 🔥 Required for heads-up banner
  });
  console.log(calleeId);
  await notifee.displayNotification({
    title: "Call from " + calleeId,
    body: body,
    android: {
      channelId,
      smallIcon: "ic_launcher", // Ensure this icon exists in android/app/src/main/res
      pressAction: {
        id: "default",
      },
    },
  });
}
