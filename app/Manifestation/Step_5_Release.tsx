import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    FadeInUp,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const CENTER = width * 0.5; // rings fill the full width

const Step_5_Release = ({ onComplete }: { onComplete?: () => void }) => {
    const [isReleased, setIsReleased] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Shared values for 5 orbit rings at different speeds/directions
    const rot1 = useSharedValue(0);
    const rot2 = useSharedValue(0);
    const rot3 = useSharedValue(0);
    const rot4 = useSharedValue(0);
    const rot5 = useSharedValue(0);

    // Infinity glow pulse
    const infPulse = useSharedValue(1);

    // Release animation
    const releaseScale = useSharedValue(1);
    const releaseOpacity = useSharedValue(1);
    const successOpacity = useSharedValue(0);

    React.useEffect(() => {
        // 5 rings — different speeds and directions (like solar orbits)
        rot1.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1);
        rot2.value = withRepeat(withTiming(-360, { duration: 10000, easing: Easing.linear }), -1);
        rot3.value = withRepeat(withTiming(360, { duration: 16000, easing: Easing.linear }), -1);
        rot4.value = withRepeat(withTiming(-360, { duration: 26000, easing: Easing.linear }), -1);
        rot5.value = withRepeat(withTiming(360, { duration: 42000, easing: Easing.linear }), -1);

        // Infinity icon breathes
        infPulse.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
                withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
    }, []);

    const handleRelease = () => {
        setIsReleased(true);
        // Initial tactile feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        releaseScale.value = withSequence(
            withTiming(1.4, { duration: 600 }),
            withTiming(0, { duration: 1000 })
        );
        releaseOpacity.value = withDelay(400, withTiming(0, { duration: 1200 }));
        successOpacity.value = withDelay(1400, withTiming(1, { duration: 800 }));

        // Trigger confetti and success haptic after expansion
        setTimeout(() => {
            setShowConfetti(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 600);

        setTimeout(() => {
            if (onComplete) onComplete();
        }, 4500);
    };

    const ring1Style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot1.value}deg` }] }));
    const ring2Style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot2.value}deg` }] }));
    const ring3Style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot3.value}deg` }] }));
    const ring4Style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot4.value}deg` }] }));
    const ring5Style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot5.value}deg` }] }));

    const infStyle = useAnimatedStyle(() => ({
        transform: [{ scale: infPulse.value }],
        opacity: interpolate(infPulse.value, [1, 1.15], [0.85, 1]),
    }));

    const centerGroupStyle = useAnimatedStyle(() => ({
        transform: [{ scale: releaseScale.value }],
        opacity: releaseOpacity.value,
    }));

    const successStyle = useAnimatedStyle(() => ({
        opacity: successOpacity.value,
        transform: [{ scale: interpolate(successOpacity.value, [0, 1], [0.8, 1]) }]
    }));

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>

                <Text style={styles.subtitle}>Let go of exactly how it will happen. Trust the process.</Text>
            </Animated.View>

            <View style={styles.centerArea}>
                {/* 5 rings rotating at different speeds */}
                <Animated.View style={[styles.ring, styles.ring1, ring1Style]}>
                    <View style={styles.dot1} />
                    <View style={[styles.dot1, { bottom: -5, top: undefined }]} />
                </Animated.View>

                <Animated.View style={[styles.ring, styles.ring2, ring2Style]}>
                    <View style={styles.dot2} />
                    <View style={[styles.dot2, { left: undefined, right: CENTER * 1.05 / 2 - 5, top: CENTER * 1.05 / 2 - 5 }]} />
                </Animated.View>

                <Animated.View style={[styles.ring, styles.ring3, ring3Style]}>
                    <View style={styles.dot3} />
                    <View style={[styles.dot3, { bottom: -6, top: undefined }]} />
                </Animated.View>

                <Animated.View style={[styles.ring, styles.ring4, ring4Style]}>
                    <View style={styles.dot4} />
                    <View style={[styles.dot4, { left: undefined, right: CENTER * 1.88 / 2 - 4, top: CENTER * 1.88 / 2 - 4 }]} />
                </Animated.View>

                <Animated.View style={[styles.ring, styles.ring5, ring5Style]}>
                    <View style={styles.dot5} />
                    <View style={[styles.dot5, { bottom: -3, top: undefined }]} />
                </Animated.View>

                {/* Center: Infinity symbol */}
                <Animated.View style={[styles.centerCircle, centerGroupStyle]}>
                    <Animated.Text style={[styles.infinityText, infStyle]}>∞</Animated.Text>
                </Animated.View>

                {/* Success overlay */}
                {showConfetti && (
                    <ConfettiCannon 
                        count={60} 
                        origin={{ x: width / 2, y: height / 2 }} 
                        fadeOut={true}
                        fallSpeed={2500}
                    />
                )}
                {isReleased && (
                    <Animated.View style={[styles.successOverlay, successStyle]}>
                        <Text style={styles.successText}>You're all set.</Text>
                        <Text style={styles.subSuccessText}>Have a great day ahead.</Text>
                    </Animated.View>
                )}
            </View>

            <View style={styles.footer}>
                {!isReleased ? (
                    <TouchableOpacity
                        style={styles.releaseBtn}
                        onPress={handleRelease}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#F59E0B', '#D97706']}
                            style={styles.gradientBtn}
                        >
                            <Text style={styles.btnText}>Release and Trust</Text>
                            <Text style={styles.btnInfinity}>∞</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <Animated.View entering={FadeInUp.delay(2000).springify()} style={styles.doneMsg}>
                        <Text style={styles.doneSub}>Your intention has been set.</Text>
                    </Animated.View>
                )}
            </View>
        </View>
    );
};

const RING_BASE = CENTER;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 0,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        paddingTop: 8,
    },
    title: {
        fontSize: 10,
        fontFamily: 'Comfortaa_700Bold',
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 24,
        fontFamily: 'Comfortaa_400Regular',
    },
    centerArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    // ── Rings ──────────────────────────────────────────────
    ring: {
        position: 'absolute',
        borderRadius: 9999,
        borderStyle: 'dashed',
    },
    ring1: {
        width: CENTER * 0.7,
        height: CENTER * 0.7,
        borderWidth: 1.5,
        borderColor: 'rgba(252, 211, 77, 0.6)',
    },
    ring2: {
        width: CENTER * 1.05,
        height: CENTER * 1.05,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.45)',
        borderStyle: 'solid',
    },
    ring3: {
        width: CENTER * 1.45,
        height: CENTER * 1.45,
        borderWidth: 1,
        borderColor: 'rgba(252, 211, 77, 0.3)',
    },
    ring4: {
        width: CENTER * 1.88,
        height: CENTER * 1.88,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
        borderStyle: 'solid',
    },
    ring5: {
        width: CENTER * 2.35,
        height: CENTER * 2.35,
        borderWidth: 1,
        borderColor: 'rgba(252, 211, 77, 0.1)',
    },

    // ── Orbit dots ────────────────────────────────────────
    dot1: {
        position: 'absolute', top: -5,
        left: CENTER * 0.7 / 2 - 5,
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: '#FCD34D',
        shadowColor: '#FCD34D', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1, shadowRadius: 10, elevation: 6,
    },
    dot2: {
        position: 'absolute', top: -5,
        left: CENTER * 1.05 / 2 - 5,
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: '#F59E0B',
        shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1, shadowRadius: 8, elevation: 5,
    },
    dot3: {
        position: 'absolute', top: -6,
        left: CENTER * 1.45 / 2 - 6,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#FCD34D',
        shadowColor: '#FCD34D', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9, shadowRadius: 10, elevation: 4,
    },
    dot4: {
        position: 'absolute', top: -4,
        left: CENTER * 1.88 / 2 - 4,
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: 'rgba(245,158,11,0.8)',
        shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8, shadowRadius: 6, elevation: 3,
    },
    dot5: {
        position: 'absolute', top: -3,
        left: CENTER * 2.35 / 2 - 3,
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: 'rgba(252,211,77,0.6)',
        shadowColor: '#FCD34D', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6, shadowRadius: 5, elevation: 2,
    },

    // ── Center ────────────────────────────────────────────
    centerCircle: {
        width: RING_BASE * 0.58,
        height: RING_BASE * 0.58,
        borderRadius: RING_BASE * 0.29,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.06)',
        borderWidth: 1,


        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 10,
    },
    infinityText: {
        fontSize: 64,
        color: '#FCD34D',
        textShadowColor: 'rgba(252, 211, 77, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
        fontFamily: 'Comfortaa_700Bold',
        lineHeight: 80,
    },

    // ── Success state ─────────────────────────────────────
    successOverlay: {
        position: 'absolute',
        alignItems: 'center',
    },
    successText: {
        fontSize: 30,
        fontFamily: 'Comfortaa_700Bold',
        color: '#FFFFFF',
        letterSpacing: 1,
        textShadowColor: 'rgba(252, 211, 77, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    subSuccessText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 8,
        fontFamily: 'Comfortaa_400Regular',
        textAlign: 'center',
    },

    // ── Footer ────────────────────────────────────────────
    footer: {
        width: '100%',
        paddingBottom: 24,
    },
    releaseBtn: {
        width: '100%',
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
    },
    gradientBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
    },
    btnText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Comfortaa_700Bold',
        letterSpacing: 1,
    },
    btnInfinity: {
        color: 'white',
        fontSize: 22,
        lineHeight: 26,
        fontFamily: 'Comfortaa_700Bold',
    },
    doneMsg: {
        alignItems: 'center',
        paddingBottom: 10,
    },
    doneSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Comfortaa_400Regular',
        textAlign: 'center',
        letterSpacing: 1,
    }
});

export default Step_5_Release;
