import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BreathingBackground } from '../components/BreathingBackground';

const { width } = Dimensions.get('window');

const VocalExercise = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState('Ready');
    const isActiveRef = useRef(false);

    const baseScale = useSharedValue(1);
    const ripple = useSharedValue(0);

    const startHumming = () => {
        if (isActive) {
            setIsActive(false);
            isActiveRef.current = false;
            setPhase('Ready');
            baseScale.value = withTiming(1, { duration: 500 });
            ripple.value = withTiming(0, { duration: 500 });
            return;
        }

        setIsActive(true);
        isActiveRef.current = true;
        runCycle();
    };

    const runCycle = () => {
        setPhase('Inhale...');
        ripple.value = 0;
        baseScale.value = withTiming(1.6, { duration: 4000, easing: Easing.inOut(Easing.ease) });
        
        setTimeout(() => {
            if (!isActiveRef.current) return;
            setPhase('Hummm...');
            
            ripple.value = withRepeat(
                withTiming(1, { duration: 2500, easing: Easing.out(Easing.ease) }),
                4,
                false
            );

            setTimeout(() => {
                if (!isActiveRef.current) return;
                setPhase('Rest...');
                baseScale.value = withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) });
                ripple.value = withTiming(0, { duration: 1000 });

                setTimeout(() => {
                    if (isActiveRef.current) runCycle();
                }, 3000);
            }, 10000);
        }, 4000);
    };

    useEffect(() => {
        return () => {
            setIsActive(false);
            isActiveRef.current = false;
        };
    }, []);

    const rippleStyle1 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: baseScale.value * 1.0 + ripple.value * 0.8 }],
            opacity: 1 - ripple.value * 0.8,
            borderColor: '#f59e0b',
        };
    });

    const rippleStyle2 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: baseScale.value * 0.85 + ripple.value * 1.0 }],
            opacity: Math.max(0, 0.7 - ripple.value * 0.7),
            borderColor: '#fbbf24',
        };
    });

    const rippleStyle3 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: baseScale.value * 0.7 + ripple.value * 0.5 }],
            opacity: Math.max(0, 0.4 - ripple.value * 0.4),
            borderColor: '#d97706',
        };
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <BreathingBackground
                colors={['#020617', '#2e1005', '#020617']}
                opacity={0.6}
            />

            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Vocal Resonance</Text>
                    <View style={{ width: 44 }} />
                </View>

                <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
                    <Text style={styles.description}>
                        A low, slow hum structurally rattles stagnant energy loose.
                    </Text>

                    <View style={styles.visualizer}>
                        <Animated.View style={[styles.thinRing, rippleStyle1]} />
                        <Animated.View style={[styles.thinRing, rippleStyle2]} />
                        <Animated.View style={[styles.thinRing, rippleStyle3]} />
                        {/* Mic icon intentionally removed since it implies a connection */}
                    </View>

                    <Animated.View entering={FadeInUp.delay(300)} style={styles.timersContainer}>
                        <Text style={styles.instructionText}>
                            {isActive ? phase : "Ready."}
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(500)} style={styles.footer}>
                        <TouchableOpacity
                            style={styles.pillButton}
                            activeOpacity={0.7}
                            onPress={startHumming}
                        >
                            <Text style={styles.pillButtonText}>
                                {isActive ? "STOP" : "START"}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        height: 60,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'white',
        letterSpacing: 4,
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 40,
    },
    description: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 80,
    },
    visualizer: {
        width: width * 0.6,
        height: width * 0.6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thinRing: {
        position: 'absolute',
        width: width * 0.3,
        height: width * 0.3,
        borderRadius: (width * 0.3) / 2,
        borderWidth: 1,
        borderColor: '#f59e0b',
    },
    timersContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    instructionText: {
        fontFamily: 'Comfortaa_300Light',
        fontSize: 20,
        color: 'white',
        letterSpacing: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 80,
        width: '100%',
        alignItems: 'center',
    },
    pillButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pillButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 4,
    },
});

export default VocalExercise;
