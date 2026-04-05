import { create } from 'zustand';
import { supabase } from '../services/supabase';

interface ManifestTasks {
    tookAction: boolean;
    watchedContent: boolean;
    connectedWithPeople: boolean;
}

interface UserProfile {
    id: string;
    username: string;
    wake_time: string;
    sleep_time: string;
    manifest_time: string;
    goals: string[];          // Stored as JSONB in profiles table
    streak_count: number;
    last_manifest_date: string | null;
    daily_message_count: number;
    challenge_day: number;
    challenge_duration: number;
    is_challenge_complete: boolean;
    onboarding_complete: boolean;
    about: string | null;
    ai_roadmap: {
        goal: string;
        content: string[];
        network: string[];
    }[] | null;
}

interface UserState {
    profile: UserProfile | null;
    manifestTasks: ManifestTasks;
    isLoading: boolean;
    
    // Actions
    setProfile: (profile: UserProfile) => void;
    fetchProfile: (userId: string) => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    incrementMessageCount: () => Promise<void>;
    canSendMessage: () => boolean;
    toggleManifestTask: (task: keyof ManifestTasks) => void;
    startChallenge: (duration: number) => Promise<void>;
    completeTaskDay: () => Promise<void>;
    resetChallenge: () => Promise<void>;
    clearProfile: () => void;
    clearManifestTasks: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    profile: null,
    isLoading: false,
    manifestTasks: {
        tookAction: false,
        watchedContent: false,
        connectedWithPeople: false,
    },

    setProfile: (profile) => set({ profile }),

    fetchProfile: async (userId) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Profile not found, create a default one
                    const { data: userData } = await supabase.auth.getUser();
                    const email = userData?.user?.email || '';
                    const username = email.split('@')[0] || 'Seeker';

                    const newProfile = {
                        id: userId,
                        username: username,
                        wake_time: '07:00',
                        sleep_time: '23:00',
                        manifest_time: '10:00',
                        goals: [],
                        streak_count: 0,
                        last_manifest_date: null,
                        daily_message_count: 0,
                        challenge_day: 1,
                        challenge_duration: 7,
                        is_challenge_complete: false,
                        onboarding_complete: false,
                        about: "I am on a journey to align with my highest self and manifest my deepest desires.",
                    };

                    const { data: createdProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert([newProfile])
                        .select()
                        .single();

                    if (createError) throw createError;
                    set({ profile: createdProfile });
                } else {
                    throw error;
                }
            } else {
                set({ profile: data });
            }
        } catch (error) {
            console.warn('Error fetching/creating profile: [Safe String]');
        } finally {
            set({ isLoading: false });
        }
    },

    updateProfile: async (updates) => {
        const profile = get().profile;
        if (!profile) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', profile.id);

            if (error) throw error;
            set({ profile: { ...profile, ...updates } });
        } catch (error) {
            console.warn('Error updating profile: [Safe String]');
            throw error;
        }
    },

    incrementMessageCount: async () => {
        const profile = get().profile;
        if (!profile) return;

        const getLocalDateString = (date: Date = new Date()) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const today = getLocalDateString();
        const isNewDay = profile.last_manifest_date !== today;
        
        const newCount = isNewDay ? 1 : profile.daily_message_count + 1;
        
        await get().updateProfile({
            daily_message_count: newCount,
            last_manifest_date: today
        });
    },

    canSendMessage: () => {
        const profile = get().profile;
        if (!profile) return true;

        const today = new Date().toISOString().split('T')[0];
        if (profile.last_manifest_date !== today) return true;
        
        return profile.daily_message_count < 12;
    },

    toggleManifestTask: (task) => {
        set((state) => ({
            manifestTasks: {
                ...state.manifestTasks,
                [task]: !state.manifestTasks[task]
            }
        }));
    },

    startChallenge: async (duration) => {
        const profile = get().profile;
        if (!profile) return;

        await get().updateProfile({
            challenge_day: 1,
            challenge_duration: duration,
            is_challenge_complete: false
        });
        
        set({
            manifestTasks: {
                tookAction: false,
                watchedContent: false,
                connectedWithPeople: false,
            }
        });
    },

    completeTaskDay: async () => {
        const state = get();
        const profile = state.profile;
        if (!profile) return;

        const allTasksDone = state.manifestTasks.tookAction && 
                           state.manifestTasks.watchedContent && 
                           state.manifestTasks.connectedWithPeople;

        if (!allTasksDone) return;

        let nextDay = profile.challenge_day;
        let complete = profile.is_challenge_complete;
        let streak = profile.streak_count;

        const getLocalDateString = (date: Date = new Date()) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Update streak
        const todayStr = getLocalDateString();
        if (profile.last_manifest_date === todayStr) {
            // Already completed today, don't increment day or streak again
            return;
        }

        const today = new Date();
        const lastDate = profile.last_manifest_date ? new Date(profile.last_manifest_date) : null;
        
        if (lastDate) {
            const diffInDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
            if (diffInDays === 1) {
                streak += 1;
            } else {
                streak = 1; // Reset streak if missed a day or more
            }
        } else {
            streak = 1;
        }

        // Update challenge day
        if (profile.challenge_day < profile.challenge_duration) {
            nextDay = profile.challenge_day + 1;
        } else {
            complete = true;
        }

        await get().updateProfile({
            challenge_day: nextDay,
            is_challenge_complete: complete,
            streak_count: streak,
            last_manifest_date: getLocalDateString(today)
        });

        set({
            manifestTasks: {
                tookAction: false,
                watchedContent: false,
                connectedWithPeople: false,
            }
        });
    },

    resetChallenge: async () => {
        const profile = get().profile;
        if (!profile) return;

        await get().updateProfile({
            challenge_day: 1,
            is_challenge_complete: false,
            streak_count: 0,
            last_manifest_date: null,
        });

        set({
            manifestTasks: {
                tookAction: false,
                watchedContent: false,
                connectedWithPeople: false,
            }
        });
    },

    clearProfile: () => {
        set({
            profile: null,
            manifestTasks: {
                tookAction: false,
                watchedContent: false,
                connectedWithPeople: false,
            }
        });
    },

    clearManifestTasks: () => {
        set({
            manifestTasks: {
                tookAction: false,
                watchedContent: false,
                connectedWithPeople: false,
            }
        });
    }
}));
