import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BreathingBackground } from '../components/BreathingBackground';
import { BottomBar } from '../components/BottomBar';

const { width } = Dimensions.get('window');

type Phase = 'inhale' | 'hold_full' | 'exhale' | 'hold_empty';

export default function CalmMind() {
    const router = useRouter();
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<Phase>('inhale');
    const [timeLeft, setTimeLeft] = useState(4);
    const [cycle, setCycle] = useState(1);
    const totalCycles = 3;

    const circleScale = useSharedValue(1);

    useEffect(() => {
        let timer: any;
        if (isActive) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setPhase((currentPhase) => {
                            if (currentPhase === 'inhale') return 'hold_full';
                            else if (currentPhase === 'hold_full') return 'exhale';
                            else if (currentPhase === 'exhale') return 'hold_empty';
                            else {
                                setCycle((c) => c + 1);
                                return 'inhale';
                            }
                        });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isActive]);

    useEffect(() => {
        if (!isActive) return;

        if (cycle > totalCycles) {
            setIsActive(false);
            setCycle(1);
            cancelAnimation(circleScale);
            circleScale.value = withTiming(1, { duration: 1000 });
            setPhase('inhale');
            setTimeLeft(4);
            return;
        }

        if (phase === 'inhale') {
            setTimeLeft(4);
            circleScale.value = withTiming(2.2, { duration: 4000, easing: Easing.inOut(Easing.ease) });
        } else if (phase === 'hold_full') {
            setTimeLeft(4);
        } else if (phase === 'exhale') {
            setTimeLeft(4);
            circleScale.value = withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) });
        } else if (phase === 'hold_empty') {
            setTimeLeft(4);
        }
    }, [phase, isActive, cycle]);

    const handleToggle = () => {
        if (isActive) {
            setIsActive(false);
            cancelAnimation(circleScale);
            circleScale.value = withTiming(1, { duration: 1000 });
            setPhase('inhale');
            setTimeLeft(4);
            setCycle(1);
        } else {
            setIsActive(true);
            setPhase('inhale');
            setTimeLeft(4);
            setCycle(1);
            circleScale.value = withTiming(2.2, { duration: 4000, easing: Easing.inOut(Easing.ease) });
        }
    };

    const animatedCircleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: circleScale.value }],
    }));

    const animatedRing1Style = useAnimatedStyle(() => ({
        transform: [{ scale: circleScale.value + 0.1 }],
        opacity: isActive ? 1 - (circleScale.value - 1) / 2 : 0.3,
    }));

    const animatedRing2Style = useAnimatedStyle(() => ({
        transform: [{ scale: circleScale.value + 0.2 }],
        opacity: isActive ? 0.8 - (circleScale.value - 1) / 1.5 : 0.1,
    }));

    const animatedRing3Style = useAnimatedStyle(() => ({
        transform: [{ scale: circleScale.value + 0.3 }],
        opacity: isActive ? 0.5 - (circleScale.value - 1) / 1.5 : 0.05,
    }));

    const getPhaseText = () => {
        if (!isActive) return "Tap Start to Begin";
        if (cycle > totalCycles) return "Session Complete";
        switch (phase) {
            case 'inhale': return 'Inhale';
            case 'hold_full': return 'Hold';
            case 'exhale': return 'Exhale';
            case 'hold_empty': return 'Hold';
        }
    };

    const getInstructions = () => {
        if (!isActive) return "4s Inhale • 4s Hold • 4s Exhale • 4s Hold";
        if (cycle > totalCycles) return "You did great. Your mind is centered.";
        switch (phase) {
            case 'inhale': return 'Breathe in slowly through your nose';
            case 'hold_full': return 'Hold your breath, relax your shoulders';
            case 'exhale': return 'Exhale gently through your mouth';
            case 'hold_empty': return 'Stay empty, stay relaxed';
        }
    };

    return (
        <View style={styles.container}>
            <BreathingBackground
                colors={['#0f172a', '#1c1917', '#451a03']}
                opacity={0.85}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Calm Mind</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.content}>
                    <View style={styles.textContainer}>
                        <Text style={styles.phaseText}>{getPhaseText()}</Text>
                        <Text style={styles.instructionText}>{getInstructions()}</Text>
                        {isActive && cycle <= totalCycles && (
                            <Text style={styles.cycleText}>Cycle {cycle} of {totalCycles}</Text>
                        )}
                    </View>

                    <View style={styles.circleContainer}>
                        <Animated.View style={[styles.ring, styles.ring3, animatedRing3Style]} />
                        <Animated.View style={[styles.ring, styles.ring2, animatedRing2Style]} />
                        <Animated.View style={[styles.ring, styles.ring1, animatedRing1Style]} />
                        
                        <Animated.View style={[styles.breathingCircle, animatedCircleStyle]}>
                            {isActive && cycle <= totalCycles ? (
                                <View style={styles.timerContainer}>
                                    <Text style={styles.timerText}>{timeLeft}</Text>
                                </View>
                            ) : (
                                <Ionicons name="leaf" size={40} color="rgba(255,255,255,0.8)" style={{ opacity: 0.5 }} />
                            )}
                        </Animated.View>
                    </View>

                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, isActive ? styles.stopButton : styles.startButton]}
                        onPress={handleToggle}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionButtonContent}>
                            <Ionicons name={isActive ? "stop" : "play"} size={22} color={isActive ? "#fff" : "#02010a"} style={{ marginRight: 8 }} />
                            <Text style={[styles.actionButtonText, isActive && { color: '#fff' }]}>
                                {isActive ? 'STOP' : 'START'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <BottomBar />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: { padding: 8, marginLeft: -8 },
    headerTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 18, color: '#fff' },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 30,
        paddingHorizontal: 24,
    },
    textContainer: { alignItems: 'center', height: 100 },
    phaseText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 26,
        color: '#fff',
        marginBottom: 8,
        textShadowColor: 'rgba(251, 146, 60, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    instructionText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
        marginBottom: 8,
    },
    cycleText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: '#fb923c',
        letterSpacing: 1,
    },
    circleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    ring: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 1,
    },
    ring3: {
        width: width * 0.45,
        height: width * 0.45,
        backgroundColor: 'rgba(251, 146, 60, 0.05)',
        borderColor: 'rgba(251, 146, 60, 0.1)',
    },
    ring2: {
        width: width * 0.4,
        height: width * 0.4,
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderColor: 'rgba(251, 146, 60, 0.2)',
    },
    ring1: {
        width: width * 0.35,
        height: width * 0.35,
        backgroundColor: 'rgba(251, 146, 60, 0.15)',
        borderColor: 'rgba(251, 146, 60, 0.3)',
    },
    breathingCircle: {
        width: width * 0.3,
        height: width * 0.3,
        borderRadius: width * 0.15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerContainer: { position: 'absolute' },
    timerText: { fontFamily: 'Comfortaa_700Bold', fontSize: 28, color: '#fff' },
    actionContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        paddingTop: 10,
    },
    actionButton: {
        width: '100%',
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    actionButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButton: {
        backgroundColor: '#fb923c',
        shadowColor: '#fb923c',
    },
    stopButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    actionButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: '#02010a',
        letterSpacing: 2,
    },
});
