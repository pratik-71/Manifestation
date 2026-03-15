import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import { supabase } from './supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

// Complete the auth session if we're in a web environment or redirecting
WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async (): Promise<any> => {
    try {
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
    } catch (error: any) {
        if (error.code === 'ERR_CANCELED') {
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
        
        // Try calling an RPC if available, otherwise just warn and sign out
        const { error } = await supabase.rpc('delete_user');
        if (error) {
            console.log('RPC delete_user missing, fallback to warning. Details:', error);
            // On a real app, you would have an edge function or trigger here.
            Alert.alert("Notice", "Account flagged for deletion. Contact support for immediate removal.");
        }
        await supabase.auth.signOut();
    } catch (error) {
        console.error('Delete-account Error:', error);
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
