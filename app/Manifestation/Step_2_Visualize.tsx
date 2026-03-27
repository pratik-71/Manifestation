import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeIn, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

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


                <View style={styles.timerContainer}>
                    {/* Inspired by Step 1: Layered Ethereal Rings */}
                    <Animated.View style={[styles.outerRing1, animatedGlow]} />
                    <Animated.View style={[styles.outerRing2, innerGlowAnimStyle]} />

                    {/* Orbiting Elements - Clockwise */}
                    <Animated.View style={[styles.orbitRing, orbitStyle]}>
                        <View style={styles.orbitDot} />
                        <View style={[styles.orbitDot, { bottom: -4, top: undefined, left: undefined, right: width * 0.3 }]} />
                    </Animated.View>

                    {/* Orbiting Elements - Anti-Clockwise */}
                    <Animated.View style={[styles.counterOrbitRing, counterOrbitStyle]}>
                        <View style={styles.counterOrbitDot} />
                    </Animated.View>

                    {/* Main Hollow Portal Core */}
                    <Animated.View style={[styles.mainCircle, portalStyle]}>
                        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill}>
                            <View style={styles.portalContent}>
                                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                                <Text style={styles.timerLabel}>{isActive ? 'Visualizing' : 'Focus'}</Text>
                            </View>
                            <View style={styles.innerSharpRing} />
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
        width: height < 700 ? width * 0.65 : width * 0.8,
        height: height < 700 ? width * 0.65 : width * 0.8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: height < 700 ? 5 : 30,
    },
    outerRing1: {
        position: 'absolute',
        width: width * 0.78,
        height: width * 0.78,
        borderRadius: (width * 0.78) / 2,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.1)',
    },
    outerRing2: {
        position: 'absolute',
        width: width * 0.68,
        height: width * 0.68,
        borderRadius: (width * 0.68) / 2,
        borderWidth: 1.5,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    orbitRing: {
        position: 'absolute',
        width: width * 0.72,
        height: width * 0.72,
        borderRadius: (width * 0.72) / 2,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        borderStyle: 'dashed',
    },
    orbitDot: {
        position: 'absolute',
        top: -4,
        left: (width * 0.72) / 2 - 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FCD34D',
        shadowColor: '#FCD34D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
    },
    counterOrbitRing: {
        position: 'absolute',
        width: width * 0.62,
        height: width * 0.62,
        borderRadius: (width * 0.62) / 2,
        borderWidth: 1,
        borderColor: 'rgba(252, 211, 77, 0.15)',
    },
    counterOrbitDot: {
        position: 'absolute',
        bottom: -3,
        left: (height < 700 ? width * 0.5 : width * 0.62) / 2 - 3,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F59E0B',
    },
    sacredGlow: {
        position: 'absolute',
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: (width * 0.5) / 2,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
        elevation: 20,
    },
    mainCircle: {
        width: height < 700 ? width * 0.45 : width * 0.52,
        height: height < 700 ? width * 0.45 : width * 0.52,
        borderRadius: (height < 700 ? width * 0.45 : width * 0.52) / 2,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerSharpRing: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
        borderRadius: width * 0.3,
        margin: 6,
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
