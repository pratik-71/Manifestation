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
      title: "Rise and Shine!",
      body: "A new day to reach your dreams. Let's start with a positive thought.",
      data: { url: '/affirmation' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: wakeTimeModified.getHours(),
      minute: wakeTimeModified.getMinutes(),
    },
  });

  // 2. Daily Checklist Reminder (1 hour before sleep_time)
  let checklistTime = new Date();
  checklistTime.setHours(config.sleepTime.hour);
  checklistTime.setMinutes(config.sleepTime.minute);
  checklistTime.setHours(checklistTime.getHours() - 1);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Almost There!",
      body: "Did you finish your tasks for today? Open your checklist now.",
      data: { url: '/manifestation' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: checklistTime.getHours(),
      minute: checklistTime.getMinutes(),
    },
  });

  // 3. Bedtime Reflection (5 mins before sleep_time)
  let sleepTimeModified = new Date();
  sleepTimeModified.setHours(config.sleepTime.hour);
  sleepTimeModified.setMinutes(config.sleepTime.minute - 5);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to Rest",
      body: "You did great today. Let's settle your mind for a deep sleep.",
      data: { url: '/affirmation' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: sleepTimeModified.getHours(),
      minute: sleepTimeModified.getMinutes(),
    },
  });

  // 4. Exact Manifestation Time
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "It's Power Time!",
      body: "Your future self is waiting. Step into your manifestation ritual.",
      data: { url: '/Manifestation/mani_home' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: config.manifestTime.hour,
      minute: config.manifestTime.minute,
    },
  });

  console.log('Notifications scheduled successfully');
};
