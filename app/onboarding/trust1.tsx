import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height, width } = Dimensions.get('window');

const PROOF_CARDS = [
    {
        emoji: '🧠',
        tag: 'MIND POWER',
        title: 'You find what you focus on',
        desc: 'Your brain filters out the noise. When you set a daily goal, you start seeing the right opportunities everywhere.',
    },
    {
        emoji: '👑',
        tag: 'SUCCESS STORIES',
        title: 'Used by the world’s best',
        desc: 'Top athletes and leaders use daily rituals to stay at the top. This app gives you the same simple system.',
    },
    {
        emoji: '📊',
        tag: 'IT IS PROVEN',
        title: 'Writing it down works',
        desc: 'You are much more likely to reach your goals if you write them down daily. It turns a dream into a real plan.',
    },
    {
        emoji: '⚡',
        tag: 'STAYING ON TRACK',
        title: 'Consistency builds a new you',
        desc: 'Doing this every day builds a strong habit. Our 7-day challenge is the perfect way to get you started.',
    },
];

// Card width is set to a percentage to keep it centered and consistent
const CARD_WIDTH = width - 48;

// ── Rotating border card ──────────────────────────────────────────────────────
// Trick: a square Animated.View (native rotate) sits behind the card.
// It's colored half-purple / half-orange. Spinning it creates a conic-gradient-like border.
function RotatingBorderCard({ card }: { card: typeof PROOF_CARDS[0] }) {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3200,
                useNativeDriver: true, // ✅ only transform, safe
            })
        ).start();
        return () => rotateAnim.setValue(0);
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.cardOuter}>
            {/* Spinning border */}
            <Animated.View style={[styles.spinnerSquare, { transform: [{ rotate }] }]}>
                <View style={[styles.spinnerQuadrant, { backgroundColor: '#7c3aed' }]} />
                <View style={[styles.spinnerQuadrant, { backgroundColor: '#f97316' }]} />
                <View style={[styles.spinnerQuadrant, { backgroundColor: '#db2777' }]} />
                <View style={[styles.spinnerQuadrant, { backgroundColor: '#6d28d9' }]} />
            </Animated.View>

            {/* Vertical card content */}
            <View style={styles.cardInner}>
                <Text style={styles.cardEmoji}>{card.emoji}</Text>
                <Text style={styles.cardTag}>{card.tag}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc}>{card.desc}</Text>
            </View>
        </View>
    );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function Trust1() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);

    // Fade between cards using native driver
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const pageOpacity = useRef(new Animated.Value(0)).current;
    const ctaScale = useRef(new Animated.Value(1)).current;

    // Page fade-in & CTA pulse
    useEffect(() => {
        Animated.timing(pageOpacity, { toValue: 1, duration: 550, useNativeDriver: true }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(ctaScale, { toValue: 1.03, duration: 950, useNativeDriver: true }),
                Animated.timing(ctaScale, { toValue: 1, duration: 950, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // Auto-advance carousel with cross-fade
    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out current card
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                // Switch card then fade back in
                setActiveIndex(prev => (prev + 1) % PROOF_CARDS.length);
                Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#04000e', '#0d0527', '#160440']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.orbTL} />
            <View style={styles.orbBR} />

            <SafeAreaView style={styles.safe}>
                <Animated.View style={[styles.container, { opacity: pageOpacity }]}>

                    {/* ── BACK BUTTON ── */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>

                    {/* ── LABEL ── */}
                    <View style={styles.topLabel}>
                        <Text style={styles.topLabelText}>WHY IT WORKS</Text>
                    </View>

                    {/* ── HEADLINE ── */}
                    <View style={styles.headlineBlock}>
                        <Text style={styles.headline}>
                            The secret of{'\n'}
                            <Text style={styles.headlineAccent}>successful people{'\n'}</Text>
                            is their daily routine.
                        </Text>
                        <Text style={styles.sub}>
                            Most people try to find a shortcut.{' '}
                            <Text style={styles.subAccent}>Successful people find a system. Yours starts now.</Text>
                        </Text>
                    </View>

                    {/* ── AUTO CAROUSEL ── */}
                    <View style={styles.carouselWrap}>
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <RotatingBorderCard card={PROOF_CARDS[activeIndex]} />
                        </Animated.View>

                        {/* Dot indicators */}
                        <View style={styles.dotsRow}>
                            {PROOF_CARDS.map((_, i) => (
                                <View
                                    key={i}
                                    style={[styles.dot, i === activeIndex && styles.dotActive]}
                                />
                            ))}
                        </View>
                    </View>

                    {/* ── CTA ── */}
                    <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
                        <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={() => router.push('/onboarding/trust2')}
                            style={styles.ctaButton}
                        >
                            <LinearGradient
                                colors={['#f97316', '#dc2626', '#9333ea']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.ctaGrad}
                            >
                                <Text style={styles.ctaText}>⚡  Start My 7-Day Challenge</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    <Text style={styles.footerNote}>Free to try · Cancel anytime</Text>

                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#04000e' },
    safe: { flex: 1 },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: height * 0.03,
        paddingBottom: 16,
        justifyContent: 'space-between',
    },

    orbTL: {
        position: 'absolute', top: -70, left: -60,
        width: 230, height: 230, borderRadius: 115,
        backgroundColor: 'rgba(124,58,237,0.12)',
    },
    orbBR: {
        position: 'absolute', bottom: -50, right: -40,
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: 'rgba(249,115,22,0.09)',
    },

    // Top label
    topLabel: {
        alignSelf: 'flex-start',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    },
    topLabelText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.2,
    },

    // Headline
    headlineBlock: { gap: 6 },
    headline: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: height < 700 ? 20 : 22,
        color: '#fff',
        lineHeight: height < 700 ? 28 : 32,
    },
    headlineAccent: { color: '#f59e0b' },
    sub: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 18,
    },
    subAccent: {
        fontFamily: 'Comfortaa_600SemiBold',
        color: '#f59e0b',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },

    // Carousel
    carouselWrap: { alignItems: 'center', gap: 12 },

    // Rotating border card
    cardOuter: {
        width: width - 48,
        height: 240,
        borderRadius: 18,
        overflow: 'hidden',
        padding: 1.5,
    },
    // Large square that spins behind the card (native driver rotate ✅)
    spinnerSquare: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        top: -(width * 1.5 - 240) / 2,
        left: -(width * 1.5 - (width - 48)) / 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    spinnerQuadrant: {
        width: '50%', height: '50%',
    },
    // The actual card content over the rotating spinner
    cardInner: {
        flex: 1, // Fill fixed height
        flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', // Center content vertically
        backgroundColor: '#0d0527',
        borderRadius: 16.5,
        paddingHorizontal: 20, paddingVertical: 22,
        gap: 8,
    },
    cardEmoji: { fontSize: 36 },
    cardTag: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 8, color: '#f59e0b', letterSpacing: 1.3,
        textAlign: 'center',
    },
    cardTitle: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14, color: '#fff', lineHeight: 20,
        textAlign: 'center',
    },
    cardDesc: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 18,
        textAlign: 'center',
    },

    // Dots
    dotsRow: { flexDirection: 'row', gap: 6 },
    dot: {
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    dotActive: {
        width: 18, backgroundColor: '#f59e0b',
    },

    // CTA
    ctaButton: { borderRadius: 30, overflow: 'hidden', elevation: 10 },
    ctaGrad: { paddingVertical: 18, alignItems: 'center' },
    ctaText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16, color: '#fff', letterSpacing: 0.4,
    },

    footerNote: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11, color: 'rgba(255,255,255,0.2)',
        textAlign: 'center',
    },
});
