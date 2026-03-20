import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_NOTIFICATION_ID = 'grocery-reminder-5h';

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00b295', // matched with global.css --primary
    });
  }
  
  return true;
}

export async function schedulePendingItemsReminder() {
  // Clear any previously scheduled reminder to reset the 5 hour timer
  await cancelPendingItemsReminder();
  
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_NOTIFICATION_ID,
    content: {
      title: 'Pending Groceries 🛒',
      body: 'Some of your items are still pending. You might want to buy them before you forget!',
      color: '#00b295', // matched with global.css --primary
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5 * 60 * 60, // 5 hours
    },
  });
}

export async function cancelPendingItemsReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_NOTIFICATION_ID);
  } catch (error) {
    // Ignore if no notification was scheduled
  }
}
