import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Checks if the goals should be reset based on the user's wake-up time.
 * The goals should be deleted 1 hour before the wake-up time.
 * 
 * @param lastSaveTime ISO string of when goals were last saved
 * @param wakeTime HH:MM string of when the user wakes up (e.g., "07:00")
 * @returns true if goals are stale and should be reset
 */
export const shouldResetGoals = (lastSaveTime: string | null, wakeTime: string): boolean => {
    if (!lastSaveTime) return false;

    const now = new Date();
    const saveDate = new Date(lastSaveTime);

    // Calculate the reset threshold (1 hour before wake time)
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    
    // Create the reset time for "today"
    const thresholdToday = new Date(now);
    thresholdToday.setHours(wakeH - 1, wakeM, 0, 0);

    // If current time is AFTER today's threshold, the valid window started at this threshold.
    // If current time is BEFORE today's threshold, the valid window started at YESTERDAY'S threshold.
    let currentCycleStart: Date;
    if (now >= thresholdToday) {
        currentCycleStart = thresholdToday;
    } else {
        currentCycleStart = new Date(thresholdToday);
        currentCycleStart.setDate(currentCycleStart.getDate() - 1);
    }

    // If the goals were saved BEFORE the start of the current cycle, they are stale.
    return saveDate < currentCycleStart;
};

/**
 * Helper to clear goals if they are stale.
 * @param wakeTime fallback wake time if profile is not available
 */
export const clearStaleGoals = async (wakeTime: string = "07:00") => {
    try {
        const lastSave = await AsyncStorage.getItem('last_goals_save_time');
        if (shouldResetGoals(lastSave, wakeTime)) {
            console.log("🕒 Goals are stale (resetting 1hr before wake time). Clearing today_goals.");
            await AsyncStorage.removeItem('today_goals');
            await AsyncStorage.removeItem('last_goals_save_time');
            return true;
        }
    } catch (e) {
        console.error("Error clearing stale goals:", e);
    }
    return false;
};
