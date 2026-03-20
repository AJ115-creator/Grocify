import { Stack } from "expo-router";
import { ClerkProvider } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import "../../global.css"
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { requestNotificationPermissions } from "@/lib/notifications";
import { KeyboardProvider } from "react-native-keyboard-controller";
import CustomAlert from "@/components/CustomAlert";
import *  as Sentry from '@sentry/react-native';
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  integrations: [Sentry.feedbackIntegration()],
});
export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme()
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      if (status !== 'granted' && canAskAgain) {
        setShowSoftPrompt(true);
      }
    };
    checkPermissions();
  }, []);

  const handleAllowNotifications = async () => {
    setShowSoftPrompt(false);
    await requestNotificationPermissions();
  };

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <KeyboardProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }} />
          <CustomAlert
            visible={showSoftPrompt}
            title="Enable Reminders?"
            message="We'd love to send you a quick reminder if you leave groceries pending for too long."
            primaryButtonText="Yes, sounds good"
            onClose={handleAllowNotifications}
            secondaryButtonText="Not right now"
            onSecondaryAction={() => setShowSoftPrompt(false)}
          />
        </ThemeProvider>
      </KeyboardProvider>
    </ClerkProvider>

  );
});
