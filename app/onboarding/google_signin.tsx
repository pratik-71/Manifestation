import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BreathingBackground } from '../../components/BreathingBackground';

const { width, height } = Dimensions.get('window');

export default function GoogleSignIn() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        
        // Simulate Google Sign-In process
        setTimeout(() => {
            setIsLoading(false);
            // Navigate to questionnaire after successful sign-in
            router.replace('/onboarding/questionnaire');
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Layers */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0a0a0a' }]} />
            <BreathingBackground 
                colors={['#0a0a0a', '#1e3a8a', '#2563eb']} 
                opacity={0.4}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Content Container */}
                <View style={styles.contentContainer}>
                    
                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoWrapper}>
                            <Image 
                                source={require('../../assets/logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.brandName}>Manifest</Text>
                        </View>
                    </View>

                    {/* Main Content */}
                    <View style={styles.mainContent}>

                        <Text style={styles.unlockText}>Unlock Faster Result With Our App</Text>
                        {/* Trust Image Container */}
                        <View style={styles.imageContainer}>                        
                            <Image 
                                source={require('../../assets/Onboarding/trust_google_sign_in.png')}
                                style={styles.trustImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Sign-In Button */}
                        <TouchableOpacity
                            style={[styles.signInButton, isLoading && styles.buttonDisabled]}
                            onPress={handleGoogleSignIn}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <View style={styles.loadingContent}>
                                    <View style={styles.spinner} />
                                    <Text style={styles.buttonText}>Connecting...</Text>
                                </View>
                            ) : (
                                <View style={styles.buttonContent}>
                                    <View style={styles.googleIconContainer}>
                                        <Image 
                                            source={require('../../assets/Onboarding/google_icon.png')}
                                            style={styles.googleIconImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <Text style={styles.buttonText}>Continue with Google</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Terms with Links */}
                        <View style={styles.termsContainer}>
                            <Text style={styles.termsText}>
                                By continuing, you accept our{' '}
                                <Text style={styles.linkText}>Terms of Service</Text>
                                {' and '}
                                <Text style={styles.linkText}>Privacy Policy</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    
    // Logo Section
    logoSection: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
    },
    logoWrapper: {
        alignItems: 'center',
    },
    logoImage: {
        width: 64,
        height: 64,
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    brandName: {
        fontSize: 20,
        fontWeight: '600',
        fontFamily: 'Comfortaa_600SemiBold',
        color: '#94a3b8',
        letterSpacing: 1,
    },
    
    // Main Content
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Image Container
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        height: height * 0.45,
        position: 'relative',
    },
    trustImage: {
        width: width * 0.92,
        height: height * 0.40,
        maxWidth: 500,
        maxHeight: 320,
        zIndex: 10,
        position: 'relative',
    },
    
    // Wave/Aura Effects
    wave1: {
        position: 'absolute',
        width: width * 0.85,
        height: height * 0.32,
        maxWidth: 340,
        maxHeight: 250,
        borderRadius: 20,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(37, 99, 235, 0.3)',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
        zIndex: 1,
    },
    wave2: {
        position: 'absolute',
        width: width * 0.80,
        height: height * 0.30,
        maxWidth: 320,
        maxHeight: 235,
        borderRadius: 16,
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        borderWidth: 1.5,
        borderColor: 'rgba(37, 99, 235, 0.25)',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 6,
        zIndex: 2,
    },
    wave3: {
        position: 'absolute',
        width: width * 0.78,
        height: height * 0.29,
        maxWidth: 310,
        maxHeight: 228,
        borderRadius: 14,
        backgroundColor: 'rgba(37, 99, 235, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(37, 99, 235, 0.2)',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
        zIndex: 3,
    },
    
    // Value Proposition
    valueProp: {
        alignItems: 'center',
        marginBottom: 48,
        paddingHorizontal: 20,
    },
    mainTagline: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: 'Comfortaa_700Bold',
        color: '#f1f5f9',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0,
    },
    subTagline: {
        fontSize: 16,
        fontWeight: '400',
        fontFamily: 'Comfortaa_400Regular',
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        letterSpacing: 0,
    },
    
    unlockText: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Comfortaa_700Bold',
        color: '#f1f5f9',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0,
    },
    
    // Sign-In Button
    signInButton: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        paddingVertical: 14,
        paddingHorizontal: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 28,
        width: '100%',
        maxWidth: 340,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    buttonDisabled: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    googleIconContainer: {
        width: 28,
        height: 28,
        marginRight: 7,
     
        alignItems: 'center',
        justifyContent: 'center',
   
    },
    googleIconImage: {
        width: 20,
        height: 20,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '800',
        fontFamily: 'Comfortaa_600SemiBold',
        color: '#1e293b',
        letterSpacing: 0.2,
    },
    spinner: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2.5,
        borderColor: '#1e293b',
        borderTopColor: 'transparent',
        marginRight: 14,
    },
    
    // Terms
    termsContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    termsText: {
        fontSize: 13,
        fontWeight: '400',
        fontFamily: 'Comfortaa_400Regular',
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 18,
    },
    linkText: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Comfortaa_600SemiBold',
        color: '#4285f4',
        textDecorationLine: 'underline',
    },
});
