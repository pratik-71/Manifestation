import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
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

const MILESTONES = [
    {
        day: 'Day 1',
        emoji: '🌱',
        title: 'You set your intention',
        desc: 'A 5-min morning ritual aligned to your goals',
    },
    {
        day: 'Day 7',
        emoji: '🔥',
        title: 'You feel the shift',
        desc: 'Energy, clarity, and momentum compound daily',
    },
    {
        day: 'Day 30',
        emoji: '✨',
        title: 'You become it',
        desc: 'Your identity aligns with who you\'re becoming',
    },
];

export default function Trust2() {
    const router = useRouter();

    const pageOpacity = useRef(new Animated.Value(0)).current;
    const heroScale = useRef(new Animated.Value(0.82)).current;
    const ctaScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(pageOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(heroScale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(ctaScale, { toValue: 1.03, duration: 950, useNativeDriver: true }),
                Animated.timing(ctaScale, { toValue: 1, duration: 950, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={['#03000c', '#0a0230', '#100335']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Ambient glow */}
            <View style={styles.glowTop} />
            <View style={styles.glowBR} />

            <SafeAreaView style={styles.safe}>
                <Animated.View style={[styles.container, { opacity: pageOpacity }]}>

                    {/* ── HERO GLOW CIRCLE ── */}
                    <Animated.View style={[styles.heroWrap, { transform: [{ scale: heroScale }] }]}>
                        {/* Rings */}
                        <View style={styles.ring3} />
                        <View style={styles.ring2} />
                        <View style={styles.ring1} />
                        {/* Core */}
                        <LinearGradient
                            colors={['#7c3aed', '#db2777', '#f97316']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.heroCore}
                        >
                            <Text style={styles.heroCoreEmoji}>✨</Text>
                        </LinearGradient>
                    </Animated.View>

                    {/* ── HEADLINE ── */}
                    <View style={styles.headlineBlock}>
                        <Text style={styles.headline}>
                            You're already{'\n'}
                            <Text style={styles.headlineAccent}>different.</Text>
                        </Text>
                        <Text style={styles.sub}>
                            The moment you decided is the moment{'\n'}
                            everything started to shift.
                        </Text>
                    </View>

                    {/* ── MILESTONE JOURNEY ── */}
                    <View style={styles.milestonesRow}>
                        {MILESTONES.map((m, i) => (
                            <React.Fragment key={i}>
                                <View style={[styles.milestoneCard, i === 1 && styles.milestoneCardCenter]}>
                                    <Text style={styles.milestoneEmoji}>{m.emoji}</Text>
                                    <Text style={[styles.milestoneDay, i === 1 && styles.milestoneDayActive]}>
                                        {m.day}
                                    </Text>
                                    <Text style={styles.milestoneTitle}>{m.title}</Text>
                                    <Text style={styles.milestoneDesc}>{m.desc}</Text>
                                </View>
                                {/* Connector arrow between cards */}
                                {i < MILESTONES.length - 1 && (
                                    <Text style={styles.connector}>›</Text>
                                )}
                            </React.Fragment>
                        ))}
                    </View>

                    {/* ── AFFIRMATION ── */}
                    <View style={styles.affirmationCard}>
                        <LinearGradient
                            colors={['rgba(124,58,237,0.15)', 'rgba(219,39,119,0.08)']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                        <Text style={styles.affirmationQuote}>"</Text>
                        <Text style={styles.affirmationText}>
                            The version of you who achieved everything —
                            they started <Text style={styles.affirmationAccent}>exactly like this.</Text>
                        </Text>
                    </View>

                    {/* ── CTA ── */}
                    <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
                        <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={() => router.replace('/home')}
                            style={styles.ctaButton}
                        >
                            <LinearGradient
                                colors={['#7c3aed', '#db2777', '#f97316']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.ctaGrad}
                            >
                                <Text style={styles.ctaText}>Enter My Universe  →</Text>
                                <Text style={styles.ctaSub}>Day 1 starts now</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    <Text style={styles.footer}>Secure · Private · You're in control</Text>

                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#03000c' },
    safe: { flex: 1 },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: height * 0.025,
        paddingBottom: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    glowTop: {
        position: 'absolute', top: -80,
        alignSelf: 'center',
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(124,58,237,0.1)',
    },
    glowBR: {
        position: 'absolute', bottom: -50, right: -50,
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(219,39,119,0.07)',
    },

    // Hero
    heroWrap: {
        alignItems: 'center', justifyContent: 'center',
        width: 130, height: 130,
    },
    ring3: {
        position: 'absolute',
        width: 130, height: 130, borderRadius: 65,
        borderWidth: 1, borderColor: 'rgba(124,58,237,0.12)',
    },
    ring2: {
        position: 'absolute',
        width: 106, height: 106, borderRadius: 53,
        borderWidth: 1, borderColor: 'rgba(219,39,119,0.18)',
    },
    ring1: {
        position: 'absolute',
        width: 84, height: 84, borderRadius: 42,
        borderWidth: 1, borderColor: 'rgba(249,115,22,0.2)',
    },
    heroCore: {
        width: 64, height: 64, borderRadius: 32,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8, shadowRadius: 20,
        elevation: 16,
    },
    heroCoreEmoji: { fontSize: 28 },

    // Headline
    headlineBlock: { alignItems: 'center', gap: 8 },
    headline: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: height < 700 ? 30 : 36,
        color: '#fff', textAlign: 'center',
        lineHeight: height < 700 ? 38 : 46,
    },
    headlineAccent: {
        color: '#f59e0b',
        textShadowColor: 'rgba(245,158,11,0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 14,
    },
    sub: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13, color: 'rgba(255,255,255,0.45)',
        textAlign: 'center', lineHeight: 20,
    },

    // Milestones
    milestonesRow: {
        flexDirection: 'row', alignItems: 'center',
        width: '100%', gap: 4,
    },
    milestoneCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        paddingVertical: 14, paddingHorizontal: 8,
        alignItems: 'center', gap: 4,
    },
    milestoneCardCenter: {
        backgroundColor: 'rgba(124,58,237,0.12)',
        borderColor: 'rgba(124,58,237,0.28)',
    },
    milestoneEmoji: { fontSize: 22 },
    milestoneDay: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 9, color: 'rgba(255,255,255,0.35)',
        letterSpacing: 0.8,
    },
    milestoneDayActive: { color: '#f59e0b' },
    milestoneTitle: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 10, color: '#fff', textAlign: 'center',
        lineHeight: 14,
    },
    milestoneDesc: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 9, color: 'rgba(255,255,255,0.38)',
        textAlign: 'center', lineHeight: 13,
    },
    connector: {
        fontSize: 18, color: 'rgba(255,255,255,0.15)',
        marginBottom: 8,
    },

    // Affirmation
    affirmationCard: {
        width: '100%', borderRadius: 18, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(124,58,237,0.22)',
        paddingHorizontal: 18, paddingTop: 10, paddingBottom: 16,
    },
    affirmationQuote: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 40, color: 'rgba(245,158,11,0.35)',
        lineHeight: 34, marginBottom: 0,
    },
    affirmationText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14, color: 'rgba(255,255,255,0.75)',
        lineHeight: 22,
    },
    affirmationAccent: {
        fontFamily: 'Comfortaa_600SemiBold',
        color: '#f59e0b',
    },

    // CTA
    ctaButton: { width: width - 48, borderRadius: 30, overflow: 'hidden', elevation: 14 },
    ctaGrad: { paddingVertical: 19, alignItems: 'center' },
    ctaText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 17, color: '#fff', letterSpacing: 0.4,
    },
    ctaSub: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 3,
    },

    footer: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11, color: 'rgba(255,255,255,0.18)',
    },
});
