import { create } from 'zustand';

export interface OnboardingTimes {
    wakeTime: string;   // e.g. "07:00"
    sleepTime: string;  // e.g. "23:00"
    manifestTime: string; // e.g. "10:00"
}

export interface AiRoadmapItem {
    goal: string;
    content: string[];
    network: string[];
}

interface OnboardingState {
    username: string;
    wakeTime: string;
    sleepTime: string;
    manifestTime: string;
    goals: string[];
    aiRoadmap: AiRoadmapItem[];

    // Actions
    setUserData: (data: { username: string; wakeTime: string; sleepTime: string; manifestTime: string }) => void;
    setGoals: (goals: string[]) => void;
    setAiRoadmap: (aiRoadmap: AiRoadmapItem[]) => void;
    reset: () => void;
}

const defaultState = {
    username: '',
    wakeTime: '07:00',
    sleepTime: '23:00',
    manifestTime: '10:00',
    goals: [] as string[],
    aiRoadmap: [] as AiRoadmapItem[],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
    ...defaultState,

    setUserData: (data) =>
        set({
            username: data.username,
            wakeTime: data.wakeTime,
            sleepTime: data.sleepTime,
            manifestTime: data.manifestTime,
        }),

    setGoals: (goals) => set({ goals }),
    
    setAiRoadmap: (aiRoadmap) => set({ aiRoadmap }),

    reset: () => set(defaultState),
}));
