import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Linking, FlatList, Animated } from 'react-native';
import { BreathingBackground } from '../../components/BreathingBackground';
import { AppColors } from '../../constants/Colors';
import { getCurrentUser, signInWithGoogle, signInWithApple } from '../../services/authService';
import { hasCompletedOnboarding } from '../../services/profileService';
import { identifyUser } from '../../services/purchaseService';

const { width, height } = Dimensions.get('window');

const PROOF_POINTS = [
    { id: '1', icon: 'sparkles' as const, text: '96% see life improvement within 15 days' },
    { id: '2', icon: 'flash' as const, text: 'Only Proven Manifestation Techniques' },
    { id: '3', icon: 'infinite' as const, text: 'Quantum Alignment Neural Re-wiring' },
    { id: '4', icon: 'medal' as const, text: 'Ancient Wisdom + Modern Science' },
    { id: '5', icon: 'trending-up' as const, text: 'AI-Powered Personal Daily Roadmap' },
];

// Triple the items to allow smooth infinite loop experience
const INFINITE_PROOF = [...PROOF_POINTS, ...PROOF_POINTS, ...PROOF_POINTS];

export default function GoogleSignIn() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(PROOF_POINTS.length);
    
    // Explicit sizing for absolute centering
    const ITEM_WIDTH = width; // Fill width for paging effect
    const CARD_WIDTH = width - 60; // Inner card width
    
    // Initial position for infinite scroll
    useEffect(() => {
        const centerIndex = PROOF_POINTS.length;
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({
                offset: centerIndex * ITEM_WIDTH,
                animated: false
            });
        }
    }, []);

    // Super zippy auto-scroll loop
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isLoading && flatListRef.current) {
                const nextIndex = currentIndex + 1;
                flatListRef.current.scrollToIndex({
                    index: nextIndex,
                    animated: true
                });
                setCurrentIndex(nextIndex);
            }
        }, 2200); // Faster zippy interval

        return () => clearInterval(timer);
    }, [currentIndex, isLoading]);

    const handleMomentumScrollEnd = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / ITEM_WIDTH);
        
        const bufferSize = PROOF_POINTS.length;

        // Invisible reset when landing on buffers
        if (index <= bufferSize - 1) {
            flatListRef.current?.scrollToIndex({
                index: index + bufferSize,
                animated: false
            });
            setCurrentIndex(index + bufferSize);
        } else if (index >= bufferSize * 2 + 1) {
            flatListRef.current?.scrollToIndex({
                index: index - bufferSize,
                animated: false
            });
            setCurrentIndex(index - bufferSize);
        } else {
            setCurrentIndex(index);
        }
    };

    const getItemLayout = (_: any, index: number) => ({
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
    });

    // Authentication and state check
    useEffect(() => {
        const checkExisting = async () => {
            setIsLoading(true);
            try {
                const user = await getCurrentUser();
                if (user) {
                    await identifyUser(user.id);
                    const complete = await hasCompletedOnboarding(user.id);
                    if (complete) {
                        router.replace('/home');
                    } else {
                        router.replace('/onboarding/questionnaire');
                    }
                }
            } catch (err) {
                console.error("Initial check fail:", err);
            } finally {
                setIsLoading(false);
            }
        };
        checkExisting();
    }, []);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithGoogle();
            const userId = result?.data?.user?.id;

            if (userId) {
                await identifyUser(userId);
                const complete = await hasCompletedOnboarding(userId);
                if (complete) {
                    router.replace('/home');
                    return;
                }
                router.replace('/onboarding/questionnaire');
            }
        } catch (error: any) {
            console.error('Login failed', error);
            if (error.code !== 'SIGN_IN_CANCELLED') {
                Alert.alert("Connection Failed", "The Universe couldn't verify your signal. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithApple();
            const userId = result?.data?.user?.id;

            if (userId) {
                await identifyUser(userId);
                const complete = await hasCompletedOnboarding(userId);
                if (complete) {
                    router.replace('/home');
                    return;
                }
                router.replace('/onboarding/questionnaire');
            }
        } catch (error: any) {
            console.error('Apple login failed', error);
            if (error.code !== 'ERR_CANCELED') {
                Alert.alert("Connection Failed", "The Universe couldn't verify your Apple ID. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={['#02010a', '#1e1b4b', '#4c1d95', '#831843']}
                opacity={0.9}
            />

            <View style={styles.vignette} pointerEvents="none" />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.contentContainer}>
                    {/* Brand Identity */}
                    <View style={styles.header}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.brandTitle}>Manifestation</Text>
                    </View>

                    {/* Infinite Carousel Section */}
                    <View style={styles.centerSection}>
                        <View style={styles.heroContent}>
                            <Image
                                source={require('../../assets/Onboarding/trust_google_sign_in.png')}
                                style={styles.heroImage}
                                resizeMode="contain"
                            />

                            <View style={styles.carouselWrapper}>
                                <FlatList
                                    ref={flatListRef}
                                    data={INFINITE_PROOF}
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    getItemLayout={getItemLayout}
                                    onMomentumScrollEnd={handleMomentumScrollEnd}
                                    onScroll={Animated.event(
                                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                                        { useNativeDriver: false }
                                    )}
                                    scrollEventThrottle={16}
                                    keyExtractor={(_, index) => `proof-${index}`}
                                    renderItem={({ item }) => (
                                        <View style={[styles.carouselItem, { width: ITEM_WIDTH }]}>
                                            <BlurView intensity={35} tint="light" style={styles.glassCard}>
                                                <Ionicons name={item.icon} size={28} color="#f59e0b" style={styles.proofIcon} />
                                                <Text style={styles.proofText}>{item.text}</Text>
                                            </BlurView>
                                        </View>
                                    )}
                                />
                                
                                <View style={styles.pagination}>
                                    {PROOF_POINTS.map((_, i) => {
                                        const actualIndex = currentIndex % PROOF_POINTS.length;
                                        return (
                                            <View 
                                                key={i} 
                                                style={[
                                                    styles.dot, 
                                                    actualIndex === i ? styles.activeDot : styles.inactiveDot
                                                ]} 
                                            />
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Action Area */}
                    <View style={styles.bottomSection}>
                        <Text style={styles.actionSubtitle}>START YOUR JOURNEY</Text>
                        

                        <View style={styles.buttonStack}>
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity
                                    style={[styles.appleButton, isLoading && styles.buttonDisabled]}
                                    onPress={() => !isLoading && handleAppleSignIn()}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="logo-apple" size={20} color="#ffffff" style={styles.buttonIcon} />
                                        <Text style={styles.appleButtonText}>Continue with Apple</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.googleButton, isLoading && styles.buttonDisabled]}
                                onPress={() => !isLoading && handleGoogleSignIn()}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <View style={styles.buttonContent}>
                                    <Image
                                        source={require('../../assets/Onboarding/google_icon.png')}
                                        style={[styles.buttonIcon, { width: 18, height: 18 }]}
                                    />
                                    <Text style={styles.googleButtonText}>
                                        {isLoading ? 'Aligning Resonance...' : 'Continue with Google'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerContainer}>
                            <Text style={styles.footerNote}>
                                By continuing, you agree to our{' '}
                                <Text style={styles.linkText} onPress={() => Linking.openURL('https://zenvy-venture.vercel.app/manifest/terms-conditions')}>Terms and Conditions</Text>
                                {' & '}
                                <Text style={styles.linkText} onPress={() => Linking.openURL('https://zenvy-venture.vercel.app/manifest/privacy-policy')}>Privacy Policy</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView >
            
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#f59e0b" />
                    <Text style={styles.loadingText}>Connecting to Universal Intelligence...</Text>
                </View>
            )}
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#02010a',
    },
    vignette: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 0,
        justifyContent: 'space-between',
        paddingVertical: height * 0.045,
    },
    header: {
        alignItems: 'center',
        marginTop: height * 0.01,
    },
    logoImage: {
        width: 72,
        height: 72,
        marginBottom: 8,
    },
    brandTitle: {
        fontFamily: 'DancingScript_700Bold',
        fontSize: 44,
        color: '#fff',
        letterSpacing: 2,
        textShadowColor: 'rgba(139, 92, 246, 0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 15,
    },
    centerSection: {
        flex: 1,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // Hides the peek of other carousel items
    },
    heroContent: {
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
        gap: height * 0.035,
    },
    heroImage: {
        width: width * 0.88,
        height: height * 0.35,
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 25,
    },
    carouselWrapper: {
        width: width,
        height: 110,
        alignItems: 'center',
    },
    carouselItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    glassCard: {
        width: '100%',
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        // Glow effect
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    proofIcon: {
        marginRight: 14,
    },
    proofText: {
        flex: 1,
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 20,
    },
    pagination: {
        flexDirection: 'row',
        marginTop: 14,
        gap: 6,
    },
    dot: {
        height: 4,
        borderRadius: 2,
    },
    activeDot: {
        width: 18,
        backgroundColor: '#f59e0b',
    },
    inactiveDot: {
        width: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    bottomSection: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 35,
    },
    actionSubtitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 9,
        color: '#f59e0b',
        letterSpacing: 4,
        marginBottom: 10,
    },
    actionTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#fff',
        marginBottom: 28,
        textAlign: 'center',
    },
    buttonStack: {
        width: '100%',
        gap: 14,
        marginBottom: 25,
    },
    googleButton: {
        backgroundColor: '#ffffff',
        width: '100%',
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    appleButton: {
        backgroundColor: '#000000',
        width: '100%',
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonIcon: {
        marginRight: 10,
    },
    googleButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#02010a',
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
        color: 'rgba(255, 255, 255, 0.45)',
        textAlign: 'center',
        lineHeight: 18,
    },
    linkText: {
        color: '#f59e0b',
        textDecorationLine: 'underline',
        fontFamily: 'Comfortaa_700Bold',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(2, 1, 10, 0.96)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 18,
        color: '#f59e0b',
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 15,
        letterSpacing: 0.5,
    },
});
