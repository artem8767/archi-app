import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Platform } from "react-native";
import { WebView } from "react-native-webview";

/**
 * URL бойового сайту Next.js. Задайте в .env: EXPO_PUBLIC_SITE_URL=https://ваш-домен.com
 * (без слеша в кінці; для локальних тестів на Android 9+ може знадобитись HTTPS або налаштування cleartext).
 */
const SITE_URL =
  process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:3000";

const START_PATH = process.env.EXPO_PUBLIC_SITE_PATH || "/uk";
const uri = `${SITE_URL}${START_PATH.startsWith("/") ? "" : "/"}${START_PATH}`;

export default function App() {
  if (__DEV__ && SITE_URL.startsWith("http://")) {
    console.log("[ARCHI WebView]", uri);
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <WebView
        source={{ uri }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled={Platform.OS === "android"}
        allowsBackForwardNavigationGestures
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        originWhitelist={["*"]}
        setSupportMultipleWindows={false}
        startInLoadingState
        renderError={() => (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Не вдалося завантажити сторінку. Перевірте EXPO_PUBLIC_SITE_URL і
              інтернет.
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0c0f12",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0c0f12",
  },
  errorBox: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0c0f12",
  },
  errorText: {
    color: "#c4d4e0",
    textAlign: "center",
    fontSize: 15,
  },
});
