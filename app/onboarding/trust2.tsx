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

const MILESTONE_CARDS = [
    {
        emoji: '👁️',
        tag: 'SEEING IS BELIEVING',
        title: 'Your brain practices while you dream',
        desc: 'Thinking about your goals is like a practice run. It makes the real thing feel natural and easy.',
    },
    {
        emoji: '🎯',
        tag: 'THE POWER OF A PLAN',
        title: 'Simple plans make success easy',
        desc: 'Deciding exactly when and where you will act makes you much more likely to actually do it.',
    },
    {
        emoji: '🧠',
        tag: 'DAILY WINS',
        title: 'Small wins keep you going',
        desc: 'Every time you finish a daily goal, your brain gets a boost that makes you want to do even more.',
    },
    {
        emoji: '📈',
        tag: 'THE 1% RULE',
        title: 'Small steps lead to big changes',
        desc: 'Improving just a little bit every day adds up to a massive transformation over a year.',
    },
];

const CARD_WIDTH = width - 48;

function RotatingBorderCard({ card }: { card: typeof MILESTONE_CARDS[0] }) {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3200,
                useNativeDriver: true,
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
            <Animated.View style={[styles.spinnerSquare, { transform: [{ rotate }] }]}>
                <View style={[styles.spinnerQuadrant, { backgroundColor: '#fbbf24' }]} />
                <View style={[styles.spinnerQuadrant, { backgroundColor: '#f59e0b' }]} />
                <View style={[styles.spinnerQuadrant, { backgroundColor: '#ffffff' }]} />
                <View style={[styles.spinnerQuadrant, { backgroundColor: '#fbbf24' }]} />
            </Animated.View>

            <View style={styles.cardInner}>
                <Text style={styles.cardEmoji}>{card.emoji}</Text>
                <Text style={styles.cardTag}>{card.tag}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc}>{card.desc}</Text>
            </View>
        </View>
    );
}

export default function Trust2() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const pageOpacity = useRef(new Animated.Value(0)).current;
    const ctaScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(pageOpacity, { toValue: 1, duration: 550, useNativeDriver: true }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(ctaScale, { toValue: 1.03, duration: 950, useNativeDriver: true }),
                Animated.timing(ctaScale, { toValue: 1, duration: 950, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                setActiveIndex(prev => (prev + 1) % MILESTONE_CARDS.length);
                Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#02010a', '#0f0501', '#1a0d01']}
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.orbTR} />
            <View style={styles.orbLeft} />

            <SafeAreaView style={styles.safe}>
                <Animated.View style={[styles.container, { opacity: pageOpacity }]}>

                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>

                    <View style={styles.topLabel}>
                        <Text style={styles.topLabelText}>YOUR EVOLUTION</Text>
                    </View>

                    <View style={styles.headlineBlock}>
                        <Text style={styles.headline}>
                            Stay Focused. {'\n'}
                            <Text style={styles.headlineAccent}>Your future{'\n'}</Text>
                            starts now.
                        </Text>
                        <Text style={styles.sub}>
                            Success isn't about luck.{' '}
                            <Text style={styles.subAccent}>It's about doing the small things every day.</Text>
                        </Text>
                    </View>

                    <View style={styles.carouselWrap}>
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <RotatingBorderCard card={MILESTONE_CARDS[activeIndex]} />
                        </Animated.View>

                        <View style={styles.dotsRow}>
                            {MILESTONE_CARDS.map((_, i) => (
                                <View
                                    key={i}
                                    style={[styles.dot, i === activeIndex && styles.dotActive]}
                                />
                            ))}
                        </View>
                    </View>

                    <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
                        <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={() => router.push('/home')}
                            style={styles.ctaButton}
                        >
                            <LinearGradient
                                colors={['#fbbf24', '#f59e0b', '#d97706']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.ctaGrad}
                            >
                                <Text style={styles.ctaText}>Start Manifesting</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    <Text style={styles.footerNote}>Private · Secure · Results-Driven</Text>

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
    orbTR: {
        position: 'absolute', top: -30, right: -60,
        width: 260, height: 260, borderRadius: 130,
        backgroundColor: 'rgba(245,158,11,0.08)',
    },
    orbLeft: {
        position: 'absolute', top: height * 0.4, left: -90,
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(6,182,212,0.07)',
    },
    topLabel: {
        alignSelf: 'flex-start',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    },
    topLabelText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.2,
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
    headlineBlock: { gap: 6 },
    headline: {
        fontFamily: 'CormorantGaramond_600SemiBold_Italic',
        fontSize: height < 700 ? 26 : 28,
        color: '#fff',
        lineHeight: height < 700 ? 30 : 34,
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
    carouselWrap: { alignItems: 'center', gap: 12 },
    cardOuter: {
        width: width - 48,
        height: 240,
        borderRadius: 18,
        overflow: 'hidden',
        padding: 1.5,
    },
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
    cardInner: {
        flex: 1, // Fill fixed height
        flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', // Center content vertically
        backgroundColor: '#0a0a0a',
        borderRadius: 16.5,
        paddingHorizontal: 20, paddingVertical: 28,
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
    dotsRow: { flexDirection: 'row', gap: 6 },
    dot: {
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    dotActive: {
        width: 18, backgroundColor: '#f59e0b',
    },
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
