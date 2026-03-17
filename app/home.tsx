import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated as RNAnimated, AppState, Dimensions, Easing, Image, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomBar } from '../components/BottomBar';
import { BreathingBackground } from '../components/BreathingBackground';
import { NotificationPermissionModal } from '../components/NotificationPermissionModal';
import { checkNotificationStatus } from '../services/notificationService';

import { getCurrentUser } from '../services/authService';
import { useUserStore } from '../store/userStore';


export default function Home() {
    const router = useRouter();
    const { profile, fetchProfile } = useUserStore();
    const [showNotifModal, setShowNotifModal] = useState(false);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [showVideoModal, setShowVideoModal] = useState(false);

    const handleWatchFuture = async () => {
        try {
            const videoPath = `${FileSystem.documentDirectory}future_messages/latest_message.mp4`;
            const fileInfo = await FileSystem.getInfoAsync(videoPath);

            if (!fileInfo.exists) {
                Alert.alert("No Messages Yet", "You haven't recorded any digital records yet. You can do this in your Profile.");
                return;
            }

            // Play in-app — avoids Android FileProvider/Intent restriction
            setVideoUri(videoPath);
            setShowVideoModal(true);
        } catch (error) {
            console.error("Watch Future Error:", error);
            Alert.alert("Error", "Something went wrong while trying to play your message.");
        }
    };
    const [displayedStreak, setDisplayedStreak] = useState(0);
    const flamePulse = useRef(new RNAnimated.Value(1)).current;
    const streakAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Animate streak count up when profile loads / streak changes
    useEffect(() => {
        const target = profile?.streak_count ?? 0;
        if (target === 0) { setDisplayedStreak(0); return; }

        let current = 0;
        if (streakAnimRef.current) clearInterval(streakAnimRef.current);

        const step = Math.ceil(target / 20); // reach target in ~20 steps
        streakAnimRef.current = setInterval(() => {
            current = Math.min(current + step, target);
            setDisplayedStreak(current);
            if (current >= target) {
                clearInterval(streakAnimRef.current!);
                streakAnimRef.current = null;
            }
        }, 40);

        return () => {
            if (streakAnimRef.current) clearInterval(streakAnimRef.current);
        };
    }, [profile?.streak_count]);

    // Flame pulse animation when streak > 0
    useEffect(() => {
        if ((profile?.streak_count ?? 0) > 0) {
            RNAnimated.loop(
                RNAnimated.sequence([
                    RNAnimated.timing(flamePulse, { toValue: 1.3, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    RNAnimated.timing(flamePulse, { toValue: 1.0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            ).start();
        } else {
            flamePulse.setValue(1);
        }
    }, [profile?.streak_count]);

    useEffect(() => {
        const init = async () => {
            const user = await getCurrentUser();
            if (user) {
                if (!profile) {
                    await fetchProfile(user.id);
                }
            } else {
                router.replace('/onboarding/google_signin');
            }
        };
        init();

        const checkPerms = async () => {
            const status = await checkNotificationStatus();
            if (status !== 'granted') {
                // Delay slightly to not overwhelm on mount
                setTimeout(() => setShowNotifModal(true), 2000);
            }
        };

        checkPerms();

        // Also check when app comes back to foreground (e.g., from settings)
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                checkPerms();
            }
        });

        return () => subscription.remove();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Breathing Background - Keeping existing colors as requested */}
            <BreathingBackground
                colors={['#0f172a', '#1c1917', '#451a03']} // Deep Navy -> Dark Brown -> Mocha
                opacity={0.8}
            />

            <View style={styles.contentContainer}>
                <SafeAreaView style={styles.safeArea}>

                    {/* Header: Logo & Streak */}
                    <View style={styles.header}>
                        <View style={styles.brandingContainer}>
                            <Image
                                source={require('../assets/logo.png')}
                                style={styles.headerLogo}
                                resizeMode="contain"
                            />
                            <Text style={styles.appName}>Hello {profile?.username || 'Seeker'}</Text>
                        </View>

                        <TouchableOpacity style={styles.streakBadge} activeOpacity={0.7}>
                            <RNAnimated.View style={{ transform: [{ scale: flamePulse }] }}>
                                <Ionicons name="flame" size={18} color={displayedStreak > 0 ? '#f97316' : '#B45309'} />
                            </RNAnimated.View>
                            <Text style={styles.streakText}>{displayedStreak}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Hero Section: Quote of the Day */}
                        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.heroCard}>
                            <Text style={styles.heroQuote}>
                                You don't get what you want, you get who you are. Live as if you already have it.
                            </Text>
                        </Animated.View>

                        <View style={styles.actionsGrid}>
                            <View style={styles.actionsRow}>
                                {/* Primary CTA: Manifest */}
                                <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.halfWidthCard}>
                                    <TouchableOpacity
                                        onPress={() => router.push('/Manifestation/mani_home')}
                                        activeOpacity={0.9}
                                        style={[styles.actionCard, styles.cardBorderOrange]}
                                    >
                                        <View style={styles.iconCircle}>
                                            <Ionicons name="sparkles" size={22} color="#B45309" />
                                        </View>
                                        <Text style={styles.cardTitle}>Manifest</Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                {/* Affirmations */}
                                <Animated.View entering={FadeInUp.delay(500).duration(800)} style={styles.halfWidthCard}>
                                    <TouchableOpacity
                                        onPress={() => router.push('/affirmation')}
                                        activeOpacity={0.9}
                                        style={[styles.actionCard, styles.cardBorderOrange]}
                                    >
                                        <View style={styles.iconCircle}>
                                            <Ionicons name="chatbubble-ellipses" size={22} color="#B45309" />
                                        </View>
                                        <Text style={styles.cardTitle}>Affirmations</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>

                            <View style={styles.actionsRow}>
                                {/* Raise Frequency */}
                                <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.halfWidthCard}>
                                    <TouchableOpacity
                                        onPress={() => router.push('/raise_frequency')}
                                        activeOpacity={0.9}
                                        style={[styles.actionCard, styles.cardBorderOrange]}
                                    >
                                        <View style={styles.iconCircle}>
                                            <Ionicons name="flash" size={22} color="#B45309" />
                                        </View>
                                        <Text style={styles.cardTitle}>Frequency</Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                {/* Feeling Low */}
                                <Animated.View entering={FadeInUp.delay(700).duration(800)} style={styles.halfWidthCard}>
                                    <TouchableOpacity
                                        onPress={() => router.push('/feeling_low')}
                                        activeOpacity={0.9}
                                        style={[styles.actionCard, styles.cardBorderOrange]}
                                    >
                                        <View style={styles.iconCircle}>
                                            <Ionicons name="heart" size={22} color="#B45309" />
                                        </View>
                                        <Text style={styles.cardTitle}>Feeling Low</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        </View>

                        {/* Explore Links */}
                        <Animated.View entering={FadeIn.delay(1000)} style={styles.exploreContainer}>
                            <TouchableOpacity
                                onPress={() => router.push('/guide' as any)}
                                style={styles.exploreButton}
                            >
                                <Ionicons name="book-outline" size={18} color="#fb923c" style={{ marginRight: 8 }} />
                                <Text style={styles.exploreText}>View Guide</Text>
                            </TouchableOpacity>

                            <View style={styles.exploreDivider} />

                            <TouchableOpacity
                                onPress={handleWatchFuture}
                                style={styles.exploreButton}
                            >
                                <Ionicons name="play-circle-outline" size={20} color="#fb923c" style={{ marginRight: 8 }} />
                                <Text style={styles.exploreText}>Watch Future</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Spacer for bottom bar */}
                        <View style={{ height: 120 }} />
                    </ScrollView>

                    <BottomBar />
                </SafeAreaView>
            </View>

            <NotificationPermissionModal
                isVisible={showNotifModal}
                onClose={() => setShowNotifModal(false)}
            />

            {/* In-App Video Player Modal */}
            {showVideoModal && videoUri ? (
                <VideoPlayerModal
                    uri={videoUri}
                    onClose={() => {
                        setShowVideoModal(false);
                        setVideoUri(null);
                    }}
                />
            ) : null}
        </View>
    );
}

// ─── In-App Video Player ─────────────────────────────────────────────────────
function VideoPlayerModal({ uri, onClose }: { uri: string; onClose: () => void }) {
    const player = useVideoPlayer(uri, p => {
        p.loop = false;
        p.play();
    });

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={videoStyles.backdrop}>
                <View style={videoStyles.playerWrapper}>
                    <VideoView
                        player={player}
                        style={videoStyles.video}
                        allowsFullscreen
                        allowsPictureInPicture
                        contentFit="contain"
                    />
                    <TouchableOpacity style={videoStyles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                        <Ionicons name="close" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const { width: SCREEN_W } = Dimensions.get('window');

const videoStyles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.96)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerWrapper: {
        width: SCREEN_W - 24,
        aspectRatio: 9 / 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
    },
    video: {
        flex: 1,
    },
    closeBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    contentContainer: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 20,
        paddingBottom: 30,
    },
    brandingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoBadge: {
        width: 38,
        height: 38,
        borderRadius: 14,
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(249, 115, 22, 0.4)',
    },
    logoText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 22,
        color: '#f97316',
        marginTop: -2, // Adjust for font centering
    },
    appName: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 18,
        color: '#f8fafc',
        letterSpacing: -0.2,
    },
    headerLogo: {
        width: 32,
        height: 32,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.2)',
        gap: 6,
    },
    streakText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 12,
        color: '#B45309',
    },

    // Hero Section
    heroCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 32,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 20,
        overflow: 'hidden',
    },
    heroQuote: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        color: '#f1f5f9',
        textAlign: 'center',
        lineHeight: 28,
    },
    actionsGrid: {
        gap: 12,
        marginBottom: 30,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidthCard: {
        flex: 1,
        aspectRatio: 1.3,
    },
    actionCard: {
        flex: 1,
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        borderRadius: 24,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    cardBorderOrange: {
        borderColor: 'rgba(180, 83, 9, 0.4)',
    },
    cardBorderPurple: {
        borderColor: 'rgba(139, 92, 246, 0.4)',
    },
    cardBorderSubtle: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    fullWidthCard: {
        flex: 1,
        height: 85,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(180, 83, 9, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 13,
        color: '#f8fafc',
        textAlign: 'center',
    },

    // Affirmation Section
    affirmationSection: {
        marginBottom: 30,
    },
    affirmationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 20,
        opacity: 0.4,
    },
    affirmationLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#fff',
    },
    affirmationLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
        color: '#fff',
        letterSpacing: 2,
    },
    affirmationCard: {
        paddingHorizontal: 10,
    },
    affirmationText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 22,
        color: 'rgba(240, 240, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 34,
    },

    // Explore Section
    exploreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        gap: 12,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    exploreDivider: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 4,
    },
    exploreText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
    },
});

