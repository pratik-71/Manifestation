import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BottomBar } from '../components/BottomBar';
import { BreathingBackground } from '../components/BreathingBackground';

const { width } = Dimensions.get('window');

export default function Home() {
    const router = useRouter();

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

                            <Text style={styles.appName}>Hello Pratik</Text>
                        </View>

                        <TouchableOpacity style={styles.streakBadge} activeOpacity={0.7}>
                            <Ionicons name="flame" size={18} color="#f97316" />
                            <Text style={styles.streakText}>3</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Hero Section: Quote of the Day */}
                        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.heroCard}>
                            <Text style={styles.heroQuote}>
                                The universe doesn't give you what you want. It gives you who you are so live like you already have it.
                            </Text>
                        </Animated.View>

                        {/* Grid of Action Cards */}
                        <View style={styles.actionsGrid}>
                            <View style={styles.actionsRow}>
                                {/* Primary CTA: Manifest */}
                                <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.halfWidthCard}>
                                    <TouchableOpacity
                                        onPress={() => router.push('/manifest_hub')}
                                        activeOpacity={0.9}
                                        style={[styles.actionCard, styles.cardBorderOrange]}
                                    >
                                        <View style={styles.iconCircle}>
                                            <Ionicons name="sparkles" size={22} color="#f97316" />
                                        </View>
                                        <Text style={styles.cardTitle}>Manifest</Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                {/* Secondary CTA: Universe Chat */}
                                <Animated.View entering={FadeInUp.delay(500).duration(800)} style={styles.halfWidthCard}>
                                    <TouchableOpacity
                                        onPress={() => router.push('/universe_chat')}
                                        activeOpacity={0.9}
                                        style={[styles.actionCard, styles.cardBorderOrange]}
                                    >
                                        <View style={styles.iconCircle}>
                                            <Ionicons name="planet" size={22} color="#f97316" />
                                        </View>
                                        <Text style={styles.cardTitle}>Universe</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>

                            <View style={styles.actionsRow}>
                                {/* Affirmations */}
                                <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.halfWidthCard}>
                                    <TouchableOpacity
                                        onPress={() => router.push('/affirmation')}
                                        activeOpacity={0.9}
                                        style={[styles.actionCard, styles.cardBorderOrange]}
                                    >
                                        <View style={styles.iconCircle}>
                                            <Ionicons name="chatbubble-ellipses" size={22} color="#f97316" />
                                        </View>
                                        <Text style={styles.cardTitle}>Affirmations</Text>
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
                                            <Ionicons name="heart" size={22} color="#f97316" />
                                        </View>
                                        <Text style={styles.cardTitle}>Feeling Low?</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        </View>

                        {/* More Options / Explore */}
                        <Animated.View entering={FadeIn.delay(1000)} style={styles.exploreContainer}>
                            <TouchableOpacity style={styles.exploreButton}>
                                <Text style={styles.exploreText}>View More Rituals</Text>
                                <Ionicons name="arrow-down" size={16} color="rgba(255,255,255,0.4)" />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Spacer for bottom bar */}
                        <View style={{ height: 120 }} />
                    </ScrollView>

                    <BottomBar />
                </SafeAreaView>
            </View>
        </View>
    );
}

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
        paddingTop: 60,
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
        fontSize: 20,
        color: '#f8fafc',
        letterSpacing: -0.5,
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
        color: '#f97316',
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
        borderColor: 'rgba(249, 115, 22, 0.4)',
    },
    cardBorderSubtle: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
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
        alignItems: 'center',
        marginTop: 10,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
    },
    exploreText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
    },
});

