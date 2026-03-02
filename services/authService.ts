import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

// Complete the auth session if we're in a web environment or redirecting
WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async (): Promise<any> => {
    try {
        const redirectUrl = Linking.createURL('onboarding/trust1', { scheme: 'manifesation' });
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
            },
        });

        if (error) throw error;
        if (!data?.url) throw new Error('No authentication URL returned');

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (result.type === 'success' && result.url) {
            const url = result.url;
            const params = Linking.parse(url);
            
            // Supabase returns access_token and refresh_token in the URL fragment
            const fragment = url.split('#')[1];
            if (fragment) {
                const fragmentParams = Object.fromEntries(new URLSearchParams(fragment));
                const accessToken = fragmentParams.access_token;
                const refreshToken = fragmentParams.refresh_token;

                if (accessToken && refreshToken) {
                    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    if (sessionError) throw sessionError;
                    return { data: sessionData };
                }
            }
        }
        
        return null;
    } catch (error: any) {
        console.error('Web-based Sign-in Error:', error);
        throw error;
    }
};

export const signOut = async () => {
    try {
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
