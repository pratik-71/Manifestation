import * as Notifications from 'expo-notifications';

// Configure how notifications are handled when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const checkNotificationStatus = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

interface MultiTimeConfig {
  wakeTime: { hour: number; minute: number }; // 24h format
  sleepTime: { hour: number; minute: number }; // 24h format
  manifestTime: { hour: number; minute: number }; // 24h format
}

export const scheduleManifestationNotifications = async (config: MultiTimeConfig) => {
  // Clear existing notifications to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 1. Wake up Affirmation (5 mins after wake_time)
  let wakeTimeModified = new Date();
  wakeTimeModified.setHours(config.wakeTime.hour);
  wakeTimeModified.setMinutes(config.wakeTime.minute + 5);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Good Morning, Soul",
      body: "Start your day with your morning affirmations. The universe is waiting.",
      data: { url: '/affirmation' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: wakeTimeModified.getHours(),
      minute: wakeTimeModified.getMinutes(),
    },
  });

  // 2. Bedtime Reflection (5 mins before sleep_time)
  let sleepTimeModified = new Date();
  sleepTimeModified.setHours(config.sleepTime.hour);
  sleepTimeModified.setMinutes(config.sleepTime.minute - 5);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Evening Reflection",
      body: "Prepare your mind for rest. 5 minutes until your bedtime ritual.",
      data: { url: '/affirmation' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: sleepTimeModified.getHours(),
      minute: sleepTimeModified.getMinutes(),
    },
  });

  // 3. Exact Manifestation Time
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "It's Manifestation Time!",
      body: "Your portal is open. Focus on your goals now.",
      data: { url: '/manifest_hub' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: config.manifestTime.hour,
      minute: config.manifestTime.minute,
    },
  });

  console.log('Notifications scheduled successfully');
};
