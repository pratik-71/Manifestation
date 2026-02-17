import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function OpeningPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // Shared Values for animations
    const textOpacity = useSharedValue(0);
    const orbScale = useSharedValue(1);
    const orbOpacity = useSharedValue(0.6);
    const sunRayRotation = useSharedValue(0);

    // Animation Config
    const FADE_IN_MS = 800;
    const FADE_OUT_MS = 800;

    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    const animatedOrbStyle = useAnimatedStyle(() => ({
        transform: [{ scale: orbScale.value }],
        opacity: orbOpacity.value,
    }));

    const animatedSunRaysStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${sunRayRotation.value}deg` }],
    }));

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Sequence Logic
    const runSequence = async () => {
        // Continuous subtle rotation for sun rays
        sunRayRotation.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1);

        // STEP 0: "Take a deep breath" (2s)
        setStep(0);
        orbScale.value = withTiming(1.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }); // Expand orb
        orbOpacity.value = withTiming(0.8, { duration: 3000 });
        textOpacity.value = withTiming(1, { duration: FADE_IN_MS });

        await delay(2500); // Hold text

        textOpacity.value = withTiming(0, { duration: FADE_OUT_MS });
        await delay(FADE_OUT_MS);

        // STEP 1: "Visualize your dreams coming true" (3s)
        setStep(1);
        orbScale.value = withTiming(1.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }); // Pulse slightly
        textOpacity.value = withTiming(1, { duration: FADE_IN_MS });

        await delay(3500); // Hold text

        textOpacity.value = withTiming(0, { duration: FADE_OUT_MS });
        await delay(FADE_OUT_MS);

        // STEP 2: "Relax" (2s)
        setStep(2);
        orbScale.value = withTiming(1.0, { duration: 3000, easing: Easing.out(Easing.ease) }); // Contract orb
        orbOpacity.value = withTiming(0.6, { duration: 3000 });
        textOpacity.value = withTiming(1, { duration: FADE_IN_MS });

        await delay(2500); // Hold text

        textOpacity.value = withTiming(0, { duration: FADE_OUT_MS });
        await delay(FADE_OUT_MS);

        // FINISH
        setIsFinished(true);
    };

    useEffect(() => {
        runSequence();
    }, []);

    const getStepContent = () => {
        switch (step) {
            case 0: return "Take a deep breath";
            case 1: return "Visualize your dreams\ncoming true";
            case 2: return "Relax";
            default: return "";
        }
    };

    const handleSkip = () => {
        // Stop animation logic if possible, but simplest is to just jump to finished state
        // Reanimated values might need to be cancelled but overwriting state usually works appropriately for UI
        setIsFinished(true);
    };

    return (
        <View className="flex-1 bg-slate-900">
            <StatusBar hidden />

            {/* Background Gradient - Deeper and richer */}
            <LinearGradient
                colors={['#0f172a', '#312e81', '#be185d', '#f59e0b']}
                locations={[0, 0.4, 0.7, 1]}
                style={StyleSheet.absoluteFill}
            />

            <View className="flex-1 items-center justify-center">

                {/* Breathing Sun / Orb Effect */}
                <Animated.View style={[animatedOrbStyle, { position: 'absolute' }]}>
                    {/* Core Sun */}
                    <View className="w-64 h-64 bg-amber-100 rounded-full opacity-20 blur-3xl" />
                    <View className="absolute top-12 left-12 w-40 h-40 bg-amber-200 rounded-full opacity-30 blur-2xl" />
                </Animated.View>

                {/* Sun Rays / Glow Ring (Rotating) */}
                <Animated.View style={[animatedSunRaysStyle, { position: 'absolute', opacity: 0.15 }]}>
                    <View className="w-[500px] h-[500px] border-2 border-amber-100 rounded-full border-dashed" />
                </Animated.View>
                <Animated.View style={[animatedSunRaysStyle, { position: 'absolute', opacity: 0.1, transform: [{ rotate: '45deg' }] }]}>
                    <View className="w-[400px] h-[400px] border border-white rounded-full" />
                </Animated.View>

                {/* Text Container */}
                {!isFinished && (
                    <Animated.View style={[animatedTextStyle, { alignItems: 'center', zIndex: 10, width: '90%' }]}>
                        <Text
                            className="text-white font-light text-center opacity-90"
                            style={{
                                fontFamily: 'Comfortaa_400Regular',
                                fontSize: width * 0.09,
                                lineHeight: width * 0.12,
                            }}
                        >
                            {getStepContent()}
                        </Text>
                    </Animated.View>
                )}

                {/* Final Welcome Message */}
                {isFinished && (
                    <Animated.View entering={FadeIn.duration(1000)} style={{ alignItems: 'center', zIndex: 10 }}>
                        <Text
                            className="text-white font-thin text-center tracking-widest mb-2"
                            style={{
                                fontFamily: 'Comfortaa_400Regular',
                                fontSize: width * 0.11,
                                lineHeight: width * 0.15,
                            }}
                        >
                            Welcome
                        </Text>
                        <Text className="text-white/80 text-lg font-light text-center tracking-widest mt-2" style={{ fontFamily: 'Comfortaa_400Regular' }}>
                            Your journey begins now.
                        </Text>
                    </Animated.View>
                )}

            </View>


            {/* Bottom Button Area - Always Visible */}
            <View className="absolute bottom-12 w-full items-center">
                <TouchableOpacity
                    onPress={isFinished ? () => router.push('/onboarding/google_signin') : handleSkip}
                    className="py-4 px-10 border border-white/20 rounded-full bg-white/5 active:bg-white/10"
                >
                    <Text className={`text-white text-center uppercase font-bold ${isFinished ? 'text-lg' : 'text-xs opacity-60'}`}>
                        {isFinished ? "Start Your Journey" : "Skip Intro"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View >
    );
}
