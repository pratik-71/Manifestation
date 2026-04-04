import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeIn, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Step_2_Visualize = ({ onComplete }: { onComplete?: () => void }) => {
    const [isActive, setIsActive] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

    const glowScale = useSharedValue(1);
    const innerPulse = useSharedValue(0.6);
    const ring1Scale = useSharedValue(1);
    const ring2Scale = useSharedValue(0.92);
    const ring3Scale = useSharedValue(0.85);
    const ring4Scale = useSharedValue(0.97);
    const ring5Scale = useSharedValue(1.05);

    // Load and play / pause 6hz binaural audio
    useEffect(() => {
        let mounted = true;
        const handleAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                });
                if (isActive) {
                    if (!soundRef.current) {
                        const { sound } = await Audio.Sound.createAsync(
                            require('../../assets/6hz.mp3'),
                            { isLooping: true, volume: 0.6 }
                        );
                        if (mounted) {
                            soundRef.current = sound;
                            await sound.playAsync();
                        } else {
                            await sound.unloadAsync();
                        }
                    } else {
                        await soundRef.current.playAsync();
                    }
                } else {
                    if (soundRef.current) {
                        await soundRef.current.pauseAsync();
                    }
                }
            } catch (e) {
                console.warn('Audio error:', e);
            }
        };
        handleAudio();
        return () => { mounted = false; };
    }, [isActive]);

    // Cleanup sound on unmount
    useEffect(() => {
        return () => {
            soundRef.current?.unloadAsync().catch(() => {});
        };
    }, []);

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
        // Outer halo pulse
        glowScale.value = withRepeat(
            withSequence(
                withTiming(1.22, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.95, { duration: 5000, easing: Easing.inOut(Easing.sin) })
            ),
            -1, true
        );
        // Inner glow opacity
        innerPulse.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.3, { duration: 2200, easing: Easing.inOut(Easing.sin) })
            ),
            -1, true
        );
        // Ring 1 — outermost, slow expand
        ring1Scale.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.90, { duration: 4200, easing: Easing.inOut(Easing.sin) })
            ),
            -1, true
        );
        // Ring 2 — contracting while ring1 expands
        ring2Scale.value = withRepeat(
            withSequence(
                withTiming(0.84, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
                withTiming(1.10, { duration: 3400, easing: Easing.inOut(Easing.sin) })
            ),
            -1, true
        );
        // Ring 3 — mid speed
        ring3Scale.value = withRepeat(
            withSequence(
                withTiming(1.12, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.88, { duration: 2800, easing: Easing.inOut(Easing.sin) })
            ),
            -1, true
        );
        // Ring 4 — fast, inverse phase
        ring4Scale.value = withRepeat(
            withSequence(
                withTiming(0.86, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
                withTiming(1.08, { duration: 2200, easing: Easing.inOut(Easing.sin) })
            ),
            -1, true
        );
        // Ring 5 — fastest shimmer
        ring5Scale.value = withRepeat(
            withSequence(
                withTiming(1.14, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.92, { duration: 1800, easing: Easing.inOut(Easing.sin) })
            ),
            -1, true
        );
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

    const innerGlowAnimStyle = useAnimatedStyle(() => ({
        opacity: interpolate(innerPulse.value, [0.3, 1], [0.4, 1]),
        transform: [{ scale: interpolate(innerPulse.value, [0.3, 1], [0.93, 1.07]) }],
        borderColor: interpolateColor(
            innerPulse.value,
            [0.3, 1],
            ['rgba(139, 92, 246, 0.6)', 'rgba(253, 186, 116, 0.9)']
        ),
    }));

    const ring1AnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ring1Scale.value }],
        opacity: interpolate(ring1Scale.value, [0.90, 1.15], [0.3, 0.9]),
        borderColor: interpolateColor(
            ring1Scale.value,
            [0.90, 1.15],
            ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.85)']
        ),
    }));

    const ring2AnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ring2Scale.value }],
        opacity: interpolate(ring2Scale.value, [0.84, 1.10], [0.25, 0.85]),
        borderColor: interpolateColor(
            ring2Scale.value,
            [0.84, 1.10],
            ['rgba(252, 211, 77, 0.15)', 'rgba(252, 211, 77, 0.8)']
        ),
    }));

    const ring3AnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ring3Scale.value }],
        opacity: interpolate(ring3Scale.value, [0.88, 1.12], [0.2, 0.8]),
        borderColor: interpolateColor(
            ring3Scale.value,
            [0.88, 1.12],
            ['rgba(167, 139, 250, 0.2)', 'rgba(167, 139, 250, 0.75)']
        ),
    }));

    const ring4AnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ring4Scale.value }],
        opacity: interpolate(ring4Scale.value, [0.86, 1.08], [0.2, 0.75]),
        borderColor: interpolateColor(
            ring4Scale.value,
            [0.86, 1.08],
            ['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.7)']
        ),
    }));

    const ring5AnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ring5Scale.value }],
        opacity: interpolate(ring5Scale.value, [0.92, 1.14], [0.15, 0.65]),
        borderColor: interpolateColor(
            ring5Scale.value,
            [0.92, 1.14],
            ['rgba(196, 181, 253, 0.1)', 'rgba(196, 181, 253, 0.6)']
        ),
    }));

    return (
        <View style={styles.container}>
            <View style={styles.centerArea}>


                <View style={styles.timerContainer}>
                    {/* Glowing halo behind rings */}
                    <Animated.View style={[styles.haloGlow, animatedGlow]} />

                    {/* 5 pulsing concentric rings */}
                    <Animated.View style={[styles.outerRing1, ring1AnimStyle]} />
                    <Animated.View style={[styles.outerRing2, ring2AnimStyle]} />
                    <Animated.View style={[styles.outerRing3, ring3AnimStyle]} />
                    <Animated.View style={[styles.outerRing4, ring4AnimStyle]} />
                    <Animated.View style={[styles.outerRing5, ring5AnimStyle]} />
                    <Animated.View style={[styles.innerGlowRing, innerGlowAnimStyle]} />

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
    haloGlow: {
        position: 'absolute',
        width: width * 0.82,
        height: width * 0.82,
        borderRadius: (width * 0.82) / 2,
        backgroundColor: 'rgba(245, 158, 11, 0.06)',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 60,
        elevation: 30,
    },
    outerRing1: {
        position: 'absolute',
        width: width * 0.88,
        height: width * 0.88,
        borderRadius: (width * 0.88) / 2,
        borderWidth: 1.5,
        borderColor: 'rgba(245, 158, 11, 0.5)',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 18,
        elevation: 12,
    },
    outerRing2: {
        position: 'absolute',
        width: width * 0.76,
        height: width * 0.76,
        borderRadius: (width * 0.76) / 2,
        borderWidth: 2,
        borderColor: 'rgba(252, 211, 77, 0.6)',
        shadowColor: '#FCD34D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 22,
        elevation: 16,
    },
    outerRing3: {
        position: 'absolute',
        width: width * 0.66,
        height: width * 0.66,
        borderRadius: (width * 0.66) / 2,
        borderWidth: 1.5,
        borderColor: 'rgba(167, 139, 250, 0.55)',
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 14,
    },
    outerRing4: {
        position: 'absolute',
        width: width * 0.60,
        height: width * 0.60,
        borderRadius: (width * 0.60) / 2,
        borderWidth: 2.5,
        borderColor: 'rgba(251, 191, 36, 0.5)',
        shadowColor: '#FBBF24',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.65,
        shadowRadius: 16,
        elevation: 10,
    },
    outerRing5: {
        position: 'absolute',
        width: width * 0.54,
        height: width * 0.54,
        borderRadius: (width * 0.54) / 2,
        borderWidth: 1,
        borderColor: 'rgba(196, 181, 253, 0.45)',
        shadowColor: '#C4B5FD',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 8,
    },
    innerGlowRing: {
        position: 'absolute',
        width: width * 0.54,
        height: width * 0.54,
        borderRadius: (width * 0.54) / 2,
        borderWidth: 2.5,
        borderColor: 'rgba(245, 158, 11, 0.8)',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 30,
        elevation: 20,
    },
    mainCircle: {
        width: height < 700 ? width * 0.45 : width * 0.52,
        height: height < 700 ? width * 0.45 : width * 0.52,
        borderRadius: (height < 700 ? width * 0.45 : width * 0.52) / 2,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: 'rgba(245, 158, 11, 0.7)',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 40,
        elevation: 30,
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
