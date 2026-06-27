import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { cancelAnimation, Easing, FadeIn, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Step_2_Visualize = ({ onComplete }: { onComplete?: () => void }) => {
    const [isActive, setIsActive] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

    const glowScale = useSharedValue(1);

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
        if (isActive) {
            glowScale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
                ),
                -1, true
            );
        } else {
            cancelAnimation(glowScale);
            glowScale.value = withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) });
        }
    }, [isActive]);

    useEffect(() => {
        async function handleAudio() {
            if (isActive) {
                if (!soundRef.current) {
                    try {
                        const { sound } = await Audio.Sound.createAsync(
                            require('../../assets/6hz.mp3'),
                            { shouldPlay: true, isLooping: true }
                        );
                        soundRef.current = sound;
                    } catch (e) {
                        console.log("Error loading audio", e);
                    }
                } else {
                    await soundRef.current.playAsync();
                }
            } else {
                if (soundRef.current) {
                    await soundRef.current.pauseAsync();
                }
            }
        }
        handleAudio();
    }, [isActive]);

    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const mainCircleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value }],
    }));

    const ring1AnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value + 0.1 }],
        opacity: isActive ? 1 - (glowScale.value - 1) * 2 : 0.8,
    }));

    const ring2AnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value + 0.2 }],
        opacity: isActive ? 0.8 - (glowScale.value - 1) * 2 : 0.5,
    }));

    const ring3AnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value + 0.3 }],
        opacity: isActive ? 0.5 - (glowScale.value - 1) * 2 : 0.3,
    }));

    return (
        <View style={styles.container}>
            <View style={styles.centerArea}>


                <View style={styles.timerContainer}>
                    {/* 3 pulsing concentric rings for a calming effect */}
                    <Animated.View style={[styles.ring, styles.outerRing3, ring3AnimStyle]} />
                    <Animated.View style={[styles.ring, styles.outerRing2, ring2AnimStyle]} />
                    <Animated.View style={[styles.ring, styles.outerRing1, ring1AnimStyle]} />

                    {/* Premium Glassmorphism Core */}
                    <Animated.View style={[styles.mainCircle, mainCircleStyle]}>
                        <LinearGradient
                            colors={['rgba(251, 146, 60, 0.2)', 'transparent']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <View style={styles.portalContent}>
                            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                        </View>
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginVertical: 20,
    },
    ring: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 1,
    },
    outerRing3: {
        width: width * 0.85,
        height: width * 0.85,
        backgroundColor: 'rgba(251, 146, 60, 0.02)',
        borderColor: 'rgba(251, 146, 60, 0.1)',
    },
    outerRing2: {
        width: width * 0.72,
        height: width * 0.72,
        backgroundColor: 'rgba(251, 146, 60, 0.04)',
        borderColor: 'rgba(251, 146, 60, 0.2)',
    },
    outerRing1: {
        width: width * 0.58,
        height: width * 0.58,
        backgroundColor: 'rgba(251, 146, 60, 0.06)',
        borderColor: 'rgba(251, 146, 60, 0.3)',
    },
    mainCircle: {
        width: width * 0.45,
        height: width * 0.45,
        borderRadius: (width * 0.45) / 2,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(251, 146, 60, 0.5)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    portalContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    timerText: {
        fontSize: width < 380 ? 40 : 48,
        fontFamily: 'Comfortaa_700Bold',
        color: '#FFFFFF',
        letterSpacing: 2,
        textShadowColor: 'rgba(251, 146, 60, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    timerLabel: {
        fontSize: 11,
        color: '#fb923c',
        fontFamily: 'Comfortaa_700Bold',
        marginTop: 6,
        letterSpacing: 3,
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
