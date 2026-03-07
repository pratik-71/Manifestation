import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Step_2_Visualize = ({ onComplete }: { onComplete?: () => void }) => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

    const glowScale = useSharedValue(1);
    const rot = useSharedValue(0);
    const counterRot = useSharedValue(0);
    const innerPulse = useSharedValue(0.6);

    useEffect(() => {
        let timer: any;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (onComplete) onComplete();
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft]);

    useEffect(() => {
        glowScale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 4000 }),
                withTiming(1, { duration: 4000 })
            ),
            -1,
            true
        );
        // Main orbit - slow clockwise
        rot.value = withRepeat(withTiming(360, { duration: 25000, easing: Easing.linear }), -1);
        // Counter orbit - faster anti-clockwise
        counterRot.value = withRepeat(withTiming(-360, { duration: 15000, easing: Easing.linear }), -1);
        // Inner glow pulse
        innerPulse.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
        // Outer glow pulse removed per user request
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const animatedGlow = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value }],
        opacity: interpolate(glowScale.value, [1, 1.2], [0.1, 0.4]),
    }));

    const portalStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withTiming(isActive ? 1.1 : 1, { duration: 1000 }) }],
        borderColor: interpolateColor(
            glowScale.value,
            [1, 1.2],
            ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.5)']
        )
    }));

    const orbitStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rot.value}deg` }]
    }));

    const counterOrbitStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${counterRot.value}deg` }]
    }));

    const innerGlowAnimStyle = useAnimatedStyle(() => ({
        opacity: innerPulse.value,
        transform: [{ scale: interpolate(innerPulse.value, [0.4, 1], [0.95, 1.05]) }],
    }));

    const outerGlowAnimStyle = useAnimatedStyle(() => ({
        opacity: 0, // removed
        transform: [{ scale: 1 }],
    }));

    return (
        <View style={styles.container}>
            <View style={styles.centerArea}>
                <Animated.View entering={FadeInDown.duration(800)} style={styles.headerArea}>

                    <Text style={styles.subtitle}>Close your eyes and visualize your goals as if they have already happened.</Text>
                </Animated.View>

                <View style={styles.timerContainer}>

                    {/* Outer Awareness Ring - pulsing */}
                    <Animated.View style={[styles.glowCircle, animatedGlow]}>
                        <View style={styles.ringBorder} />
                    </Animated.View>

                    {/* Main orbit ring - clockwise */}
                    <Animated.View style={[styles.orbitRing, orbitStyle]}>
                        <View style={styles.orbitOrb} />
                        <View style={[styles.orbitOrb, { bottom: 0, top: undefined, width: 4, height: 4, right: 20 }]} />
                    </Animated.View>

                    {/* Counter-orbit ring - anti-clockwise, different radius */}
                    <Animated.View style={[styles.counterOrbitRing, counterOrbitStyle]}>
                        <View style={styles.counterOrbitOrb} />
                        <View style={[styles.counterOrbitOrb, { left: undefined, right: -3, top: (width * 0.68) / 2 - 3 }]} />
                    </Animated.View>

                    {/* Inner pulsing glow layer behind circle */}
                    <Animated.View style={[styles.innerGlowRing, innerGlowAnimStyle]} />

                    {/* Dimensional Portal */}
                    <Animated.View style={[styles.mainCircle, portalStyle]}>
                        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill}>
                            <LinearGradient
                                colors={['rgba(15, 23, 42, 0.6)', 'rgba(245, 158, 11, 0.1)']}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={styles.portalContent}>
                                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                                <Text style={styles.timerLabel}>{isActive ? 'Visualizing...' : 'Time Remaining'}</Text>
                            </View>
                        </BlurView>
                    </Animated.View>
                </View>

                <View style={styles.guidanceContainer}>
                    <Animated.View entering={FadeIn.delay(500)} style={styles.instructionCard}>
                        <View style={styles.guidanceLine} />
                        <Text style={styles.instructionText}>
                            Try to feel the emotions and sensations of your goals as if they have already happened.
                        </Text>
                        <View style={styles.guidanceLine} />
                    </Animated.View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setIsActive(!isActive)}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#F59E0B', '#D97706']}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.buttonText}>{isActive ? 'Visualizing...' : 'Start Visualizing'}</Text>
                        <Ionicons name={isActive ? "moon" : "eye"} size={20} color="white" />
                    </LinearGradient>
                </TouchableOpacity>

                {timeLeft < 600 && !isActive && (
                    <TouchableOpacity onPress={() => onComplete?.()} style={styles.finishLink}>
                        <Text style={styles.finishText}>Finish Early</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.skipStepBtn}
                    onPress={onComplete}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipStepText}>Skip to Scripting</Text>
                    <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
        flexDirection: 'column',
    },
    centerArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        width: '100%',
        paddingBottom: 8,
    },
    headerArea: {
        alignItems: 'center',
        marginBottom: height < 700 ? 20 : 40,
    },
    title: {
        fontSize: 12,
        fontFamily: 'Comfortaa_700Bold',
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: width < 380 ? 16 : 20,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 10,
        fontFamily: 'Comfortaa_500Medium',
        lineHeight: width < 380 ? 24 : 30,
    },
    timerContainer: {
        width: width * 0.7,
        height: width * 0.7,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: height < 700 ? 10 : 20,
    },
    glowCircle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: width * 0.35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringBorder: {
        width: '100%',
        height: '100%',
        borderRadius: width * 0.35,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    orbitRing: {
        position: 'absolute',
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.15)',
        borderStyle: 'dashed',
    },
    orbitOrb: {
        position: 'absolute',
        top: -3,
        left: (width * 0.6) / 2 - 3,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FCD34D',
        shadowColor: '#FCD34D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 3,
    },
    counterOrbitRing: {
        position: 'absolute',
        width: width * 0.68,
        height: width * 0.68,
        borderRadius: width * 0.34,
        borderWidth: 1,
        borderColor: 'rgba(252, 211, 77, 0.12)',
        borderStyle: 'dashed',
    },
    counterOrbitOrb: {
        position: 'absolute',
        top: -4,
        left: (width * 0.68) / 2 - 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F59E0B',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    innerGlowRing: {
        position: 'absolute',
        width: width * 0.52,
        height: width * 0.52,
        borderRadius: width * 0.26,
        backgroundColor: '#F59E0B',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 40,
        elevation: 15,
        opacity: 0.12,
    },
    outerGlowBlob: {
        position: 'absolute',
        width: width * 0.85,
        height: width * 0.85,
        borderRadius: width * 0.425,
        backgroundColor: '#F59E0B',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 60,
        elevation: 5,
        opacity: 0.06,
    },
    mainCircle: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: width * 0.25,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    portalContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: width < 380 ? 44 : 56,
        fontFamily: 'Comfortaa_400Regular',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    timerLabel: {
        fontSize: 10,
        color: '#FCD34D',
        fontFamily: 'Comfortaa_700Bold',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    guidanceContainer: {
        width: '100%',
        marginBottom: height < 700 ? 20 : 40,
    },
    instructionCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    guidanceLine: {
        width: 30,
        height: 1,
        backgroundColor: 'rgba(245, 158, 11, 0.3)',
        marginVertical: 10,
    },
    instructionText: {
        fontSize: 14,
        color: '#FFFFFF',
        lineHeight: 22,
        fontFamily: 'Comfortaa_400Regular',
        textAlign: 'center',
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 28,

        overflow: 'hidden',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    gradientButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Comfortaa_700Bold',
        letterSpacing: 1,
    },
    finishLink: {
        marginTop: 15,
        padding: 5,
    },
    finishText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 10,
        fontFamily: 'Comfortaa_500Medium',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    skipStepBtn: {
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 10,
    },
    skipStepText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.2)',
        fontFamily: 'Comfortaa_500Medium',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

export default Step_2_Visualize;
