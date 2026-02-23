import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

// Configure Google Sign-in
// Your Web Client ID: 989014890712-abl1i5lr67egfssram32of5ude7psjqa.apps.googleusercontent.com
GoogleSignin.configure({
    webClientId: '989014890712-abl1i5lr67egfssram32of5ude7psjqa.apps.googleusercontent.com',
    offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
});

export const signInWithGoogle = async (): Promise<any> => {
    try {
        // Ensure configuration is set
        GoogleSignin.configure({
            webClientId: '989014890712-abl1i5lr67egfssram32of5ude7psjqa.apps.googleusercontent.com',
            offlineAccess: true,
        });

        // Small delay to ensure Android Activity is attached and stable
        // This is a common fix for "Current activity is null" on Android
        await new Promise(resolve => setTimeout(resolve, 200));

        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        if (userInfo.data?.idToken) {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: userInfo.data.idToken,
            });

            if (error) throw error;
            return { data, userInfo };
        } else {
            throw new Error('No ID Token found');
        }
    } catch (error: any) {
        // If it still fails with "activity is null", try one last time after a longer delay
        if (error.message?.includes('activity is null')) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return await signInWithGoogle();
        }
        console.error('Google Sign-in Error:', error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        await GoogleSignin.signOut();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error) {
        console.error('Sign-out Error:', error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error getting session:', error);
        return null;
    }
    return session?.user || null;
};
