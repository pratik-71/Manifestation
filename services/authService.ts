import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import { supabase } from './supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// Complete the auth session if we're in a web environment or redirecting
export const signInWithGoogle = async (): Promise<any> => {
    try {
        // Only call this once we are actually starting a web-based auth flow.
        // Doing this at the top level can sometimes trigger native bridge issues during startup.
        WebBrowser.maybeCompleteAuthSession();
        
        const redirectUrl = Linking.createURL('', { scheme: 'manifestation' });
        
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

export const signInWithApple = async (): Promise<any> => {
    try {
        if (Platform.OS === 'ios') {
            const rawNonce = await Crypto.getRandomBytesAsync(32);
            const nonce = Array.from(rawNonce).map((b: number) => b.toString(16).padStart(2, '0')).join('');
            const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);

            const appleCredential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce: hashedNonce,
            });

            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'apple',
                token: appleCredential.identityToken!,
                nonce,
            });

            if (error) throw error;
            return { data };
        } else {
            // Android/Web flow: Use Supabase OAuth (Web Browser flow)
            const redirectUrl = Linking.createURL('', { scheme: 'manifestation' });
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: false, // For Apple on Android, it's often smoother to let Supabase handle redirect
                },
            });

            if (error) throw error;
            return { data };
        }
    } catch (error: any) {
        if (error.code === 'ERR_CANCELED' || error.message?.includes('cancel')) {
            return null;
        }
        console.error('Apple Sign-in Error:', error);
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

export const deleteAccount = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        
        // Call the secure Edge Function to delete the user
        const { data, error } = await supabase.functions.invoke('delete-user', {
            headers: {
                'x-client-info': 'supabase-js-react-native',
            }
        });

        if (error) throw error;
        
        // After successful deletion on server, sign out locally
        await supabase.auth.signOut();
    } catch (error: any) {
        console.error('Delete-account Error:', error);
        
        // Try to extract the detailed message from the function response
        if (error.context && typeof error.context.json === 'function') {
            try {
                const body = await error.context.json();
                if (body.message) throw new Error(body.message);
            } catch (jsonErr) {
                // Ignore JSON parsing errors
            }
        }
        
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
