import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    FadeInDown,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { BreathingBackground } from '../components/BreathingBackground';

const { width, height } = Dimensions.get('window');

const AFFIRMATIONS = [
    "I live deeply in love every day, I attract stable and growing wealth, I feel lasting happiness within myself, and I receive clear and genuine recognition for who I am and what I do.",
    "Love guides my thoughts and actions, wealth grows through my consistent efforts, happiness stays present in my life, and recognition follows my work naturally and without force.",
    "I fully deserve love in all forms, I confidently create and manage wealth, I choose happiness as my steady state, and I earn recognition through honest effort.",
    "My days are filled with real love and connection, my actions steadily build wealth, my heart remains grounded in happiness, and my work gains rightful recognition.",
    "I move forward with love in my heart, I expand into greater wealth with clarity, I rest in stable happiness, and I stand calmly in earned recognition.",

    "Love supports me in every situation, wealth flows to me through skill and discipline, happiness grounds my mind, and recognition meets me at the right time.",
    "I speak and act with love, I work with purpose that creates wealth, I live in balanced happiness, and I receive recognition that reflects my value.",
    "Love is my foundation, wealth is the result of my actions, happiness is my daily state, and recognition is the natural response to my effort.",
    "I allow love into my life fully, I grow wealth patiently and wisely, I protect my happiness, and I accept recognition without hesitation.",
    "Love surrounds my life and decisions, wealth rewards my consistency, happiness sustains my energy, and recognition finds me naturally.",

    "I remain calm and strong in love, disciplined and smart with wealth, steady and peaceful in happiness, and confident in my recognition.",
    "Love fuels my actions and choices, wealth reflects my real value, happiness shapes my lifestyle, and recognition confirms my impact.",
    "I welcome love openly, I respect and expand my wealth, I choose happiness daily, and I receive recognition without doubt or fear.",
    "My path is guided by love, my work steadily builds wealth, my mind holds lasting happiness, and my name earns recognition.",
    "I walk forward with love, I rise steadily in wealth, I stay rooted in happiness, and I stand firm in recognition.",

    "Love strengthens my character, wealth supports my freedom, happiness balances my life, and recognition honors my contribution.",
    "I act with love and integrity, I create real and sustainable wealth, I protect my happiness, and I accept public recognition calmly.",
    "Love keeps me grounded, wealth grows through my skills, happiness remains stable within me, and recognition comes honestly.",
    "I trust love completely, I manage wealth wisely, I sustain happiness intentionally, and I confidently claim recognition.",
    "Love flows through my actions, wealth builds through my discipline, happiness lives within my mind, and recognition reaches me.",

    "I am aligned with love, capable of creating wealth, deserving of happiness, and worthy of recognition.",
    "Love shapes my decisions, wealth follows my consistency, happiness stays present in my life, and recognition arrives on time.",
    "I breathe love into my days, generate wealth through effort, protect my happiness, and receive clear recognition.",
    "Love opens doors for me, wealth walks through them, happiness settles in my life, and recognition stays.",
    "I stand firmly in love, I expand my wealth steadily, I maintain inner happiness, and I hold recognition with ease.",

    "Love is my nature, wealth is my outcome, happiness is my rhythm, and recognition is my reality.",
    "I consciously choose love, I patiently build wealth, I live in lasting happiness, and I fully accept recognition.",
    "Love centers my mind, wealth empowers my actions, happiness stabilizes my emotions, and recognition validates my work.",
    "I move daily with love, grow steadily in wealth, remain calm in happiness, and rise naturally in recognition.",
    "Love leads my life, wealth supports my goals, happiness fulfills my days, and recognition follows my efforts."
];

export default function AffirmationScreen() {
    const router = useRouter();
    const charge = useSharedValue(0);
    // Removed unused rotation and pulsing shared values for simpler animation
    const rotation = useSharedValue(0); // Kept for style reference diffs but unused logic
    const textPulse = useSharedValue(1);



    // Initialize with a daily index but allow manual cycling
    const initialIndex = useMemo(() => {
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = (today.getTime() - (start as any).getTime()) + ((start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        return dayOfYear % AFFIRMATIONS.length;
    }, []);

    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
    const dailyAffirmation = AFFIRMATIONS[currentIndex];

    // Split affirmation into lines for teleprompter

    // ...



    // ... stopRecording ...



    const [direction, setDirection] = React.useState(0); // 1 for next, -1 for prev

    const handleNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
        charge.value = 0;
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + AFFIRMATIONS.length) % AFFIRMATIONS.length);
        charge.value = 0;
    };

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            charge.value = withTiming(1, { duration: 2000 });
        })
        .onEnd((e) => {
            if (e.translationY < -100) {
                // Swipe Up -> Next
                runOnJS(handleNext)();
            } else if (e.translationY > 100) {
                // Swipe Down -> Prev
                runOnJS(handlePrev)();
            }
        })
        .onFinalize(() => {
            if (charge.value < 1) {
                charge.value = withSpring(0);
            }
        });

    const orbit1Style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }, { scale: 1 + charge.value * 0.2 }],
        borderColor: `rgba(249, 115, 22, ${0.2 + charge.value * 0.5})`,
    }));

    const orbit2Style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${-rotation.value * 1.5}deg` }, { scale: 1 + charge.value * 0.3 }],
        borderColor: `rgba(139, 92, 246, ${0.15 + charge.value * 0.4})`,
    }));

    const orbit3Style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value * 0.8}deg` }, { scale: 1 + charge.value * 0.4 }],
        borderColor: `rgba(6, 182, 212, ${0.1 + charge.value * 0.3})`,
    }));

    const textStyle = useAnimatedStyle(() => ({
        transform: [{ scale: textPulse.value + charge.value * 0.1 }],
        opacity: interpolate(charge.value, [0, 1], [1, 0.8]),
        textShadowRadius: interpolate(charge.value, [0, 1], [10, 30]),
        textShadowColor: 'rgba(249, 115, 22, 0.5)',
    }));

    const progressBarStyle = useAnimatedStyle(() => ({
        width: `${charge.value * 100}%`,
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={['#0f172a', '#1c1917', '#451a03']} // Navy -> Dark Brown -> Mocha
                opacity={0.8}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Daily Affirmation</Text>
                    <View style={{ width: 24 }} />
                </View>

                <GestureDetector gesture={panGesture}>
                    <View style={styles.interactiveLayer}>
                        <View style={styles.content}>
                            <Animated.View
                                key={currentIndex}
                                entering={direction >= 0 ? FadeInDown.duration(800) : FadeInDown.duration(800)}
                                style={styles.affirmationWrapper}
                            >
                                <Text style={styles.label}>SAY OUT LOUD</Text>
                                <Animated.Text style={[styles.affirmationText, textStyle]}>
                                    {dailyAffirmation}
                                </Animated.Text>
                                <View style={styles.separator} />
                                <Text style={styles.instruction}>HOLD TO CHARGE & AFFIRM</Text>

                                <View style={styles.progressBarContainer}>
                                    <Animated.View style={[styles.progressBar, progressBarStyle]} />
                                </View>
                            </Animated.View>

                            <Animated.View
                                entering={FadeInDown.delay(1000).duration(800)}
                                style={styles.scrollHint}
                            >
                                <Ionicons name="chevron-up" size={20} color="rgba(255,255,255,0.2)" />
                                <Text style={styles.scrollHintText}>Scroll to move next</Text>
                            </Animated.View>
                        </View>
                    </View>
                </GestureDetector>
            </SafeAreaView>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    safeArea: {
        flex: 1,
    },
    interactiveLayer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40, // Increased top padding
        height: 100,
        zIndex: 10,
    },
    backButton: {
        width: 28,
        height: 28,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: '#fff',
        letterSpacing: 4,
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    affirmationWrapper: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    label: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
        color: '#f97316',
        letterSpacing: 2,
        marginBottom: 30,
    },
    affirmationText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 48,
    },
    separator: {
        width: 30,
        height: 2,
        backgroundColor: 'rgba(249, 115, 22, 0.3)',
        marginVertical: 35,
        borderRadius: 1,
    },
    instruction: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 9,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        letterSpacing: 3,
        marginBottom: 15,
    },
    progressBarContainer: {
        width: '60%',
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 1,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#f97316',
    },
    scrollHint: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
        opacity: 0.5,
    },
    scrollHintText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: '#fff',
        marginTop: 8,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    footer: {
        marginTop: 60,
    },
    shareIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    }
});
