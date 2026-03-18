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
    withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BreathingBackground } from '../components/BreathingBackground';

const { width } = Dimensions.get('window');

const KineticShake = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const isActiveRef = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const shakeOffset = useSharedValue(0);

    const startShake = () => {
        if (isActive) {
            stopShake();
            return;
        }

        setIsActive(true);
        isActiveRef.current = true;
        setTimeLeft(60);
        
        // Start fast shake animation
        shakeOffset.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 50, easing: Easing.linear }),
                withTiming(15, { duration: 50, easing: Easing.linear }),
                withTiming(0, { duration: 50, easing: Easing.linear })
            ),
            -1, // Infinite
            true
        );

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopShake();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopShake = () => {
        setIsActive(false);
        isActiveRef.current = false;
        if (timerRef.current) clearInterval(timerRef.current);
        shakeOffset.value = withTiming(0, { duration: 300 });
    };

    useEffect(() => {
        return () => {
            stopShake();
        };
    }, []);

    const shakeStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shakeOffset.value }, { translateY: shakeOffset.value * 0.5 }],
        };
    });

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <BreathingBackground
                colors={['#020617', '#431407', '#020617']}
                opacity={0.6}
            />

            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Kinetic Shake</Text>
                    <View style={{ width: 44 }} />
                </View>

                <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
                    <Text style={styles.description}>
                        Stand up. Shake your hands, arms, and body. Release all tension.
                    </Text>

                    <View style={styles.visualizer}>
                        <Animated.View style={[styles.pulseRing, shakeStyle]}>
                            <Ionicons name="pulse" size={48} color="#f97316" />
                        </Animated.View>
                    </View>

                    <Animated.View entering={FadeInUp.delay(300)} style={styles.timersContainer}>
                        <Text style={styles.instructionText}>
                            {isActive ? formatTime(timeLeft) : "60 Seconds"}
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(500)} style={styles.footer}>
                        <TouchableOpacity
                            style={styles.pillButton}
                            activeOpacity={0.7}
                            onPress={startShake}
                        >
                            <Text style={styles.pillButtonText}>
                                {isActive ? "STOP" : "START SHAKING"}
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
    pulseRing: {
        width: width * 0.4,
        height: width * 0.4,
        borderRadius: (width * 0.4) / 2,
        backgroundColor: 'rgba(249, 115, 22, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timersContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    instructionText: {
        fontFamily: 'Comfortaa_300Light',
        fontSize: 32,
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
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.3)',
    },
    pillButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: '#f97316',
        letterSpacing: 4,
    },
});

export default KineticShake;
