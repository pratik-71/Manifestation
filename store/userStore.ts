import { create } from 'zustand';

// Since we don't have AsyncStorage in package.json yet, 
// we'll use a simple store. For real persistence, 
// we would need @react-native-async-storage/async-storage.
interface ManifestTasks {
    tookAction: boolean;
    watchedContent: boolean;
    connectedWithPeople: boolean;
}

interface UserState {
    dailyMessageCount: number;
    lastMessageDate: string; // ISO date string
    challengeDay: number; 
    challengeDuration: number; // 7 or 30
    isChallengeComplete: boolean;
    manifestTasks: ManifestTasks;
    incrementMessageCount: () => void;
    canSendMessage: () => boolean;
    resetDailyCount: () => void;
    toggleManifestTask: (task: keyof ManifestTasks) => void;
    checkAndResetDaily: () => void;
    startChallenge: (duration: number) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    dailyMessageCount: 0,
    lastMessageDate: new Date().toISOString().split('T')[0],
    challengeDay: 1,
    challengeDuration: 7,
    isChallengeComplete: false,
    manifestTasks: {
        tookAction: false,
        watchedContent: false,
        connectedWithPeople: false,
    },

    incrementMessageCount: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        if (state.lastMessageDate !== today) {
            set({ dailyMessageCount: 1, lastMessageDate: today });
        } else {
            set({ dailyMessageCount: state.dailyMessageCount + 1 });
        }
    },

    canSendMessage: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        // Reset if it's a new day
        if (state.lastMessageDate !== today) {
            return true;
        }
        
        return state.dailyMessageCount < 12;
    },

    resetDailyCount: () => {
        set({ dailyMessageCount: 0, lastMessageDate: new Date().toISOString().split('T')[0] });
    },

    toggleManifestTask: (task) => {
        set((state) => {
            const newTasks = {
                ...state.manifestTasks,
                [task]: !state.manifestTasks[task]
            };
            
            const allTasksDone = newTasks.tookAction && 
                               newTasks.watchedContent && 
                               newTasks.connectedWithPeople;
            
            let complete = state.isChallengeComplete;
            if (allTasksDone && state.challengeDay === state.challengeDuration) {
                complete = true;
            }

            return {
                manifestTasks: newTasks,
                isChallengeComplete: complete
            };
        });
    },

    startChallenge: (duration: number) => {
        set({
            challengeDay: 1,
            challengeDuration: duration,
            isChallengeComplete: false,
            manifestTasks: {
                tookAction: false,
                watchedContent: false,
                connectedWithPeople: false,
            }
        });
    },

    checkAndResetDaily: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        if (state.lastMessageDate !== today) {
            const allTasksDone = state.manifestTasks.tookAction && 
                               state.manifestTasks.watchedContent && 
                               state.manifestTasks.connectedWithPeople;
            
            let nextDay = state.challengeDay;
            let complete = state.isChallengeComplete;

            if (allTasksDone) {
                if (state.challengeDay < state.challengeDuration) {
                    nextDay = state.challengeDay + 1;
                } else {
                    complete = true;
                }
            }

            set({
                dailyMessageCount: 0,
                lastMessageDate: today,
                challengeDay: nextDay,
                isChallengeComplete: complete,
                manifestTasks: {
                    tookAction: false,
                    watchedContent: false,
                    connectedWithPeople: false,
                }
            });
        }
    }
}));
