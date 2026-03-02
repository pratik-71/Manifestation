import { AiRoadmapItem } from '../store/onboardingStore';
import { supabase } from './supabase';

export interface OnboardingProfileData {
    userId: string;
    username: string;
    wakeTime: string;       // "HH:MM" 24-hour format
    sleepTime: string;
    manifestTime: string;
    goals: string[];        // Saved directly in profiles.goals (JSONB)
    aiRoadmap: AiRoadmapItem[];
}

/**
 * Saves the complete onboarding profile to Supabase.
 * Goals are stored as a JSONB array inside the profiles row — no extra table needed.
 */
export const saveOnboardingProfile = async (data: OnboardingProfileData): Promise<void> => {
    const { userId, username, wakeTime, sleepTime, manifestTime, goals, aiRoadmap } = data;

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            username,
            wake_time: wakeTime,
            sleep_time: sleepTime,
            manifest_time: manifestTime,
            goals: goals,           // JSONB column — stored directly on the row
            ai_roadmap: aiRoadmap,
            streak_count: 0,
            last_manifest_date: null,
            daily_message_count: 0,
            challenge_day: 1,
            challenge_duration: 7,
            is_challenge_complete: false,
            onboarding_complete: true,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

    if (error) {
        console.error('Error saving onboarding profile:', error);
        throw error;
    }
};

/**
 * Helper to check if the user has already completed onboarding.
 */
export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', userId)
        .single();

    if (error || !data) return false;
    return data.onboarding_complete === true;
};
