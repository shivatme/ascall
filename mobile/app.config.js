const APP_VARIANT = process.env.APP_VARIANT;
const IS_DEV = APP_VARIANT === "development";
const IS_PREVIEW = APP_VARIANT === "preview";
const IS_PROD = APP_VARIANT === "production";

const version = "0.1.0"; // Displayed app version (user-facing)
const versionCode = 1; //Android Version Code
const buildNumber = versionCode.toString(); //iOS Build Number

export default {
  expo: {
    name: getAppName(),
    slug: "mobile",
    version,
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      url: "https://u.expo.dev/5a66cac7-4e43-4d95-8545-92dd2b081304",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    ios: {
      supportsTablet: true,
      bitcode: false,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.CAMERA",
        "android.permission.INTERNET",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.WAKE_LOCK",
        "android.permission.BLUETOOTH",
      ],
      googleServicesFile: "./google-services.json",
      package: getUniqueIdentifier(),
      versionCode,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "@config-plugins/react-native-webrtc",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
        },
      ],
      "expo-secure-store",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/crashlytics",
      "@react-native-firebase/messaging",
      "expo-build-properties",
      [
        "expo-build-properties",
        {
          android: {
            extraMavenRepos: [
              "../../node_modules/@notifee/react-native/android/libs",
            ],
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "5a66cac7-4e43-4d95-8545-92dd2b081304",
      },
    },
  },
};

function getAppName() {
  if (IS_DEV) {
    return "Synq (Dev)";
  }

  if (IS_PREVIEW) {
    return "Synq (Preview)";
  }

  if (IS_PROD) {
    return "Synq";
  }
  return "Synq (Dev)";
}

function getUniqueIdentifier() {
  if (IS_DEV) {
    return "com.astch.synq.dev";
  }

  if (IS_PREVIEW) {
    return "com.astch.synq.preview";
  }
  if (IS_PROD) {
    return "com.astch.synq";
  }
  return "com.astch.synq.dev";
}
