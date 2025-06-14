import { getApp } from "@react-native-firebase/app";
import {
  AuthorizationStatus,
  getMessaging,
} from "@react-native-firebase/messaging";
import { Alert, Platform, PermissionsAndroid } from "react-native";
import { BACKEND_URL } from "../api/config";
import notifee, {
  AndroidCategory,
  AndroidImportance,
  EventType,
} from "@notifee/react-native";

export async function initializeNotifications(userId: string) {
  const firebaseApp = getApp();
  const messaging = getMessaging(firebaseApp);
  messaging.requestPermission;
  const permissionGranted = await requestPermissionAndGetToken(userId);
  if (permissionGranted) {
    setupListeners();
  }
}

// Handles permission + token generation
async function requestPermissionAndGetToken(userId: string) {
  try {
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
    const messagingInstance = getMessaging(app);
    messagingInstance;
    const authStatus = await messagingInstance.requestPermission();
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn("🔕 FCM permission not granted");
      return false;
    }

    const token = await messagingInstance.getToken();

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
  const messagingInstance = getMessaging(app);

  // Foreground messages
  messagingInstance.onMessage(async (remoteMessage) => {
    console.log("📥 Foreground FCM:", remoteMessage);
    await onDisplayNotification(remoteMessage);
  });

  // Background message handler
  messagingInstance.setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("📥 Background FCM:", remoteMessage);
    await onDisplayNotification(remoteMessage);
  });

  // setInterval(() => {
  //   onDisplayNotification({
  //     data: {
  //       title: "test",
  //       body: "test",
  //       calleeId: "123",
  //       callerId: "456",
  //       roomId: "789",
  //     },
  //   });
  // }, 30000);
  // Button press handling
  notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      const actionId = detail.pressAction?.id;
      const { roomId } = detail.notification?.data || {};

      if (actionId === "accept") {
        console.log("✅ Call accepted");
        // navigation.navigate("CallScreen", { roomId, callerId });
      }

      if (actionId === "reject") {
        console.log("❌ Call rejected");
        // Notify server or clean up
      }
    }
  });
}

async function onDisplayNotification(remoteMessage: any) {
  const { title, body, calleeId, roomId } = remoteMessage.data || {};

  try {
    await notifee.deleteChannel("default"); // For dev only; remove in prod
  } catch {}

  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    importance: AndroidImportance.HIGH,
    vibration: true,
    vibrationPattern: [300, 500],
  });

  await notifee.displayNotification({
    title: `Incoming Call from`,
    body: "Tap to answer or reject",

    android: {
      channelId,
      smallIcon: "ic_launcher",
      category: AndroidCategory.CALL,
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: "default",
      },
      loopSound: true,

      actions: [
        {
          title: "Accept",
          pressAction: {
            id: "accept",
          },
        },
        {
          title: "Reject",
          pressAction: {
            id: "reject",
          },
          // destructive: true,
        },
      ],
      ongoing: true,
      autoCancel: false, // 🔒 Prevents it from auto-dismiss
    },
    data: {
      roomId,
      calleeId,
    },
  });
}
