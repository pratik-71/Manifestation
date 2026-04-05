import { AiRoadmapItem } from '../store/onboardingStore';
import { supabase } from './supabase';

export interface OnboardingProfileData {
    userId: string;
    username: string;
    wakeTime: string;       // "HH:MM" 24-hour format
    sleepTime: string;
    manifestTime: string;
    goals: string[];        // Saved directly in profiles.goals (JSONB)
    aiRoadmap?: AiRoadmapItem[];
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
            ai_roadmap: aiRoadmap || null,
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
        console.warn('Error saving onboarding profile: [Safe String]');
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
export const updateGoals = async (userId: string, goals: string[], ai_roadmap?: AiRoadmapItem[]): Promise<void> => {
    const { error } = await supabase
        .from('profiles')
        .update({
            goals,
            ai_roadmap: ai_roadmap || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

    if (error) {
        console.warn('Error updating goals: [Safe String]');
        throw error;
    }
};

/**
 * Calls the secure Supabase Edge Function to generate an AI roadmap.
 */
export const generateAIRoadmap = async (goals: string[]): Promise<AiRoadmapItem[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('generate-roadmap', {
            body: { goals }
        });

        if (error) throw error;
        return data as AiRoadmapItem[];
    } catch (error) {
        console.warn('Error generating AI roadmap: [Safe String]');
        // Fallback to high-quality roadmap if function fails
        return goals.map(goal => ({
            goal,
            content: [
                "YouTube - Mindset & Discipline Masterclass",
                "Podcast - The Ultimate Goal Setting Series",
                "Documentary - The Path to High Performance"
            ],
            network: [
                "Reddit - r/SuccessStrategies",
                "Discord - Elite Manifestors Community",
                "Professional - The High Achievers Mastermind"
            ]
        }));
    }
};
