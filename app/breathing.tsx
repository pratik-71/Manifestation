import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
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
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BreathingBackground } from '../components/BreathingBackground';

const { width } = Dimensions.get('window');

const BreathingExercise = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [phase, setPhase] = useState('Ready');
    const [isActive, setIsActive] = useState(false);
    const isActiveRef = useRef(false);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.3);

    const startBreathing = () => {
        if (isActive) {
            setIsActive(false);
            isActiveRef.current = false;
            setPhase('Paused');
            scale.value = withTiming(1, { duration: 1000 });
            opacity.value = withTiming(0.3, { duration: 1000 });
            return;
        }

        setIsActive(true);
        isActiveRef.current = true;
        runBreathingCycle();
    };

    const runBreathingCycle = () => {
        setPhase('Inhale');
        scale.value = withTiming(1.6, { duration: 4000, easing: Easing.inOut(Easing.sin) });
        opacity.value = withTiming(1, { duration: 4000 });

        setTimeout(() => {
            if (!isActiveRef.current) return;
            setPhase('Hold');
            
            setTimeout(() => {
                if (!isActiveRef.current) return;
                setPhase('Exhale');
                scale.value = withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) });
                opacity.value = withTiming(0.3, { duration: 4000 });

                setTimeout(() => {
                    if (!isActiveRef.current) return;
                    setPhase('Hold Empty');
                    
                    setTimeout(() => {
                        if (isActiveRef.current) runBreathingCycle();
                    }, 4000);
                }, 4000);
            }, 4000);
        }, 4000);
    };

    useEffect(() => {
        return () => {
            setIsActive(false);
            isActiveRef.current = false;
        };
    }, []);

    const ringStyle1 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value * 1.3 }],
            opacity: opacity.value * 0.3,
            borderColor: '#818cf8',
        };
    });

    const ringStyle2 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value * 1.15 }],
            opacity: opacity.value * 0.6,
            borderColor: '#60a5fa',
        };
    });

    const ringStyle3 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
            borderColor: '#38bdf8',
        };
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <BreathingBackground
                colors={['#020617', '#0f172a', '#020617']}
                opacity={0.6}
            />

            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Resonance Box</Text>
                    <View style={{ width: 44 }} />
                </View>

                <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
                    <Text style={styles.description}>
                        4-4-4-4 rhythm to clear the nervous system.
                    </Text>

                    <View style={styles.visualizer}>
                        <Animated.View style={[styles.thinRing, ringStyle1]} />
                        <Animated.View style={[styles.thinRing, ringStyle2]} />
                        <Animated.View style={[styles.thinRing, ringStyle3]} />
                        <Text style={styles.phaseText}>{phase}</Text>
                    </View>

                    <Animated.View entering={FadeInUp.delay(400)} style={styles.footer}>
                        <TouchableOpacity
                            style={styles.pillButton}
                            activeOpacity={0.7}
                            onPress={startBreathing}
                        >
                            <Text style={styles.pillButtonText}>
                                {isActive ? "PAUSE" : "BEGIN"}
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
        width: width * 0.4,
        height: width * 0.4,
        borderRadius: (width * 0.4) / 2,
        borderWidth: 1,
        borderColor: '#38bdf8',
    },
    phaseText: {
        fontFamily: 'Comfortaa_300Light',
        fontSize: 24,
        color: 'white',
        letterSpacing: 4,
        textTransform: 'uppercase',
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

export default BreathingExercise;
