import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.52;

const Step_1_Breath = ({ onComplete }: { onComplete?: () => void }) => {
    const [isActive, setIsActive] = useState(false);
    const [step, setStep] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Ready'>('Ready');
    const [cycle, setCycle] = useState(0);

    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.6);
    const progress = useSharedValue(0);
    const rot = useSharedValue(0);

    React.useEffect(() => {
        rot.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1);
    }, []);

    const startBreathing = () => {
        setIsActive(true);
        setCycle(1);
        runCycle(1);
    };

    const runCycle = (currentCycle: number) => {
        setStep('Inhale');
        progress.value = 0;
        scale.value = withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.sin) });
        opacity.value = withTiming(1, { duration: 4000 });
        progress.value = withTiming(1, { duration: 4000, easing: Easing.linear });

        setTimeout(() => {
            setStep('Hold');
            progress.value = 0;
            progress.value = withTiming(1, { duration: 6000, easing: Easing.linear });

            setTimeout(() => {
                setStep('Exhale');
                progress.value = 0;
                scale.value = withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) });
                opacity.value = withTiming(0.6, { duration: 8000 });
                progress.value = withTiming(1, { duration: 8000, easing: Easing.linear }, (finished) => {
                    if (finished) {
                        runOnJS(handleCycleEnd)(currentCycle);
                    }
                });
            }, 6000);
        }, 4000);
    };

    const handleCycleEnd = (completedCycle: number) => {
        if (completedCycle < 2) {
            setCycle(completedCycle + 1);
            runCycle(completedCycle + 1);
        } else {
            setIsActive(false);
            setStep('Ready');
            if (onComplete) onComplete();
        }
    };

    const animatedCircleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const innerGlowStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value * 1.1 }]
    }));

    const orbitStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rot.value}deg` }]
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isActive ? 1 : 0.6, { duration: 500 }),
        color: '#FFFFFF'
    }));

    return (
        <View style={styles.container}>
            {/* Central area: circle + info */}
            <View style={styles.centerArea}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={!isActive ? startBreathing : undefined}
                    disabled={isActive}
                    style={styles.touchArea}
                >
                    <View style={styles.centerContainer}>
                        {/* Outer Ethereal Rings */}
                        <Animated.View style={[styles.outerRing1, animatedCircleStyle]} />
                        <Animated.View style={[styles.outerRing2, innerGlowStyle]} />

                        {/* Orbiting Elements */}
                        <Animated.View style={[styles.orbitring, orbitStyle]}>
                            <View style={styles.orbitDot} />
                            <View style={styles.orbitDot2} />
                        </Animated.View>

                        {/* Sacred Orb Glow */}
                        <Animated.View style={[styles.glowLayer, innerGlowStyle]} />

                        {/* Main Core */}
                        <Animated.View style={[styles.circle, animatedCircleStyle]}>
                            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill}>
                                <View style={styles.innerCircleContent}>
                                    <Animated.Text style={[styles.stepText, textStyle]}>
                                        {step === 'Ready' ? 'Begin' : step}
                                    </Animated.Text>
                                    {step === 'Ready' && (
                                        <Animated.View entering={FadeInDown.delay(1000).duration(1500)}>
                                            <Ionicons name="finger-print-outline" size={40} color="rgba(252, 211, 77, 0.6)" style={{ marginTop: 20 }} />
                                        </Animated.View>
                                    )}
                                </View>
                            </BlurView>
                        </Animated.View>
                    </View>
                </TouchableOpacity>

                <View style={styles.infoContainer}>
                    {isActive ? (
                        <View style={styles.activeContainer}>
                            <Text style={styles.instruction}>
                                {step === 'Inhale' && 'Breathe in through your nose...'}
                                {step === 'Hold' && 'Hold gently and feel the light...'}
                                {step === 'Exhale' && 'Slowly release through your mouth...'}
                            </Text>
                            <Text style={styles.cycleCounter}>Session {cycle} of 2</Text>
                        </View>
                    ) : (
                        <Animated.View entering={FadeInDown.delay(500)} style={styles.activeContainer}>
                            <Text style={styles.instruction}>Tap anywhere to begin</Text>
                        </Animated.View>
                    )}
                </View>
            </View>

            {/* Pinned Footer */}
            <View style={styles.footer}>
                <View style={styles.tipContainer}>
                    <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.tipText}>Keep your shoulders relaxed and spine straight.</Text>
                </View>
                <TouchableOpacity
                    style={styles.skipStepBtn}
                    onPress={onComplete}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipStepText}>Skip to Visualization</Text>
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
        paddingBottom: 0,
        paddingTop: 8,
        flexDirection: 'column',
    },
    centerArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 24,
    },
    touchArea: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContainer: {
        height: CIRCLE_SIZE * 1.8,
        width: CIRCLE_SIZE * 1.8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    outerRing1: {
        position: 'absolute',
        width: CIRCLE_SIZE * 1.6,
        height: CIRCLE_SIZE * 1.6,
        borderRadius: (CIRCLE_SIZE * 1.6) / 2,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
        opacity: 0.6,
    },
    outerRing2: {
        position: 'absolute',
        width: CIRCLE_SIZE * 1.35,
        height: CIRCLE_SIZE * 1.35,
        borderRadius: (CIRCLE_SIZE * 1.35) / 2,
        borderWidth: 1.5,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        opacity: 0.8,
    },
    orbitring: {
        position: 'absolute',
        width: CIRCLE_SIZE * 1.5,
        height: CIRCLE_SIZE * 1.5,
        borderRadius: (CIRCLE_SIZE * 1.5) / 2,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.4)',
        borderStyle: 'dashed',
    },
    orbitDot: {
        position: 'absolute',
        top: -4,
        left: (CIRCLE_SIZE * 1.5) / 2 - 4,
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
    orbitDot2: {
        position: 'absolute',
        bottom: -3,
        left: (CIRCLE_SIZE * 1.5) / 2 - 3,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F59E0B',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    glowLayer: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: '#F59E0B',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 80,
        elevation: 40,
        opacity: 0.15,
    },
    circle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(245, 158, 11, 0.5)',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
    },
    innerCircleContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    stepText: {
        fontSize: width < 380 ? 26 : 34,
        color: '#FFFFFF',
        fontFamily: 'Comfortaa_400Regular',
        textTransform: 'uppercase',
        letterSpacing: 8,
        textShadowColor: 'rgba(252, 211, 77, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    infoContainer: {
        width: '100%',
        minHeight: 72,
        alignItems: 'center',
    },
    activeContainer: {
        width: '100%',
        alignItems: 'center',
    },
    instruction: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Comfortaa_500Medium',
        marginBottom: 6,
        textAlign: 'center',
        lineHeight: 24,
    },
    cycleCounter: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.3)',
        fontFamily: 'Comfortaa_400Regular',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        width: '80%',
        justifyContent: 'center',
    },
    tipText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.2)',
        textAlign: 'center',
        fontFamily: 'Comfortaa_400Regular',
        fontStyle: 'italic'
    },
    skipStepBtn: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 10,
    },
    skipStepText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.3)',
        fontFamily: 'Comfortaa_500Medium',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

export default Step_1_Breath;
