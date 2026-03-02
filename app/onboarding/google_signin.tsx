import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BreathingBackground } from '../../components/BreathingBackground';
import { AppColors } from '../../constants/Colors';
import { signInWithGoogle } from '../../services/authService';
import { saveOnboardingProfile } from '../../services/profileService';
import { useOnboardingStore } from '../../store/onboardingStore';

const { width, height } = Dimensions.get('window');

export default function GoogleSignIn() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // ⚠️ IMPORTANT: Select each value individually with separate calls.
    // Using (s) => ({ key: s.key }) creates a NEW object on every render,
    // which breaks useSyncExternalStore and causes an infinite loop.
    const ob_username = useOnboardingStore((s) => s.username);
    const ob_wakeTime = useOnboardingStore((s) => s.wakeTime);
    const ob_sleepTime = useOnboardingStore((s) => s.sleepTime);
    const ob_manifestTime = useOnboardingStore((s) => s.manifestTime);
    const ob_goals = useOnboardingStore((s) => s.goals);
    const ob_aiRoadmap = useOnboardingStore((s) => s.aiRoadmap);
    const resetOnboarding = useOnboardingStore((s) => s.reset);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithGoogle();
            const userId = result?.data?.user?.id;

            if (userId) {
                // Save all onboarding data to Supabase
                try {
                    await saveOnboardingProfile({
                        userId,
                        username: ob_username || result?.data?.user?.email?.split('@')[0] || 'Seeker',
                        wakeTime: ob_wakeTime || '07:00',
                        sleepTime: ob_sleepTime || '23:00',
                        manifestTime: ob_manifestTime || '10:00',
                        goals: ob_goals,
                        aiRoadmap: ob_aiRoadmap,
                    });
                    console.log('✅ Onboarding profile saved to Supabase');
                    resetOnboarding();
                } catch (saveErr) {
                    console.error('⚠️ Failed to save onboarding profile:', saveErr);
                    // Non-fatal — user still proceeds to trust screens
                }
            }

            router.replace('/onboarding/trust1');
        } catch (error: any) {
            console.error('Login failed', error);
            if (error.code !== 'SIGN_IN_CANCELLED') {
                Alert.alert("Connection Failed", "The Universe couldn't verify your signal. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppleSignIn = () => {
        Alert.alert("Apple Sign In", "This feature is coming soon to your iOS experience.");
    };

    const openLink = (title: string) => {
        Alert.alert(title, "Link functionality will be integrated with your legal documentation soon.");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Ultra-HD Cosmic Background */}
            <BreathingBackground
                colors={['#02010a', '#1e40af', '#be123c']}
                opacity={0.8}
            />
            <View style={styles.overlay} pointerEvents="none" />

            <SafeAreaView style={styles.safeArea}>
                <TouchableOpacity
                    style={styles.floatingBackButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>

                <View style={styles.contentContainer}>

                    {/* Top Branding */}
                    <View style={styles.header}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.brandTitle}>Manifest</Text>
                    </View>

                    {/* Central Visual */}
                    <View style={styles.centerSection}>
                        <View style={styles.heroContent}>
                            <Image
                                source={require('../../assets/Onboarding/trust_google_sign_in.png')}
                                style={styles.heroImage}
                                resizeMode="contain"
                            />

                            {/* Social Proof Card */}
                            <View style={styles.trustContainer}>
                                <View style={styles.trustItem}>
                                    <Ionicons name="sparkles" size={14} color="rgba(255, 255, 255, 0.6)" />
                                    <Text style={styles.trustText}>95% users started getting results in 15 days</Text>
                                </View>
                                <View style={styles.trustItem}>
                                    <Ionicons name="flash" size={14} color="rgba(255, 255, 255, 0.6)" />
                                    <Text style={styles.trustText}>Only Proven Manifestation Techniques</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Interaction Area */}
                    <View style={styles.bottomSection}>
                        <Text style={styles.intentText}>Now Its Your Turn</Text>

                        <View style={styles.buttonStack}>
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity
                                    style={[styles.appleButton, isLoading && styles.buttonDisabled]}
                                    onPress={() => {
                                        if (isLoading) return;
                                        handleAppleSignIn();
                                    }}
                                    disabled={isLoading}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="logo-apple" size={22} color="#ffffff" style={styles.appleIcon} />
                                        <Text style={styles.appleButtonText}>Continue with Apple</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.googleButton, isLoading && styles.buttonDisabled]}
                                onPress={() => {
                                    if (isLoading) return;
                                    handleGoogleSignIn();
                                }}
                                disabled={isLoading}
                                activeOpacity={0.9}
                            >
                                <View style={styles.buttonContent}>
                                    <Image
                                        source={require('../../assets/Onboarding/google_icon.png')}
                                        style={styles.googleIcon}
                                    />
                                    <Text style={styles.googleButtonText}>
                                        {isLoading ? 'Aligning...' : 'Continue with Google'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerContainer}>
                            <Text style={styles.footerNote}>
                                By continuing, you agree to our{' '}
                                <Text style={styles.linkText} onPress={() => openLink("Terms of Service")}>Terms of Service</Text>
                                {' and '}
                                <Text style={styles.linkText} onPress={() => openLink("Privacy Policy")}>Privacy Policy</Text>.
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView >
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.black,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    safeArea: {
        flex: 1,
    },
    floatingBackButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 100,
        width: 44,
        height: 44,

        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',

    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'space-between',
        paddingVertical: 30,
    },
    header: {
        alignItems: 'center',
        marginTop: 10,
    },
    logoRing: {
        marginBottom: 8,
    },
    logoImage: {
        width: 64,
        height: 64,
        tintColor: '#fff',
    },
    brandTitle: {
        fontFamily: 'DancingScript_400Regular',
        fontSize: 38,
        color: '#fff',
        letterSpacing: 1,
        textShadowColor: 'rgba(30, 64, 175, 0.4)', // Subtle Royal Blue glow
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
        marginTop: 0,
    },
    centerSection: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroContent: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    heroImage: {
        width: width * 0.8,
        height: height * 0.3,
    },
    trustContainer: {
        width: '100%',
        alignItems: 'flex-start',
        paddingVertical: 18,
        paddingHorizontal: 28,
        borderRadius: 24,
        gap: 14,
        // Added subtle glow to replace the lost borders
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(190, 18, 60, 0.1)',
        shadowColor: '#be123c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 0.3,
        lineHeight: 16,
    },
    dividerDots: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 12,
    },
    bottomSection: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    intentText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 17,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: 25,
        letterSpacing: 0.8,
    },
    buttonStack: {
        width: '100%',
        gap: 12,
        marginBottom: 25,
    },
    googleButton: {
        backgroundColor: '#ffffff',
        width: '100%',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1e40af', // Royal Blue shadow
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    appleButton: {
        backgroundColor: '#000000',
        width: '100%',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonDisabled: {
        opacity: 0.85,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    appleIcon: {
        marginRight: 10,
    },
    googleButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#0f172a',
    },
    appleButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#ffffff',
    },
    footerContainer: {
        alignItems: 'center',
    },
    footerNote: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 8,
    },
    linkText: {
        color: '#be123c', // Ruby Crimson for links
        textDecorationLine: 'underline',
        fontFamily: 'Comfortaa_600SemiBold',
    },
    securityNote: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(190, 18, 60, 0.6)', // Muted Ruby
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});
