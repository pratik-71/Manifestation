import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const BLINKING_STARS_COUNT = 5;

const BlinkingStar = React.memo(({ index }: { index: number }) => {
    const opacity = useSharedValue(Math.random());
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // Stabilize random values using useMemo or useRef so they persist across re-renders
    const config = useMemo(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1.5,
        opacityDuration: 2000 + Math.random() * 3000,
        moveDuration: 5000 + Math.random() * 5000,
    }), []);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.1, {
                duration: config.opacityDuration,
                easing: Easing.inOut(Easing.ease)
            }),
            -1,
            true
        );

        translateX.value = withRepeat(
            withTiming((Math.random() - 0.5) * 50, {
                duration: config.moveDuration,
                easing: Easing.inOut(Easing.sin)
            }),
            -1,
            true
        );

        translateY.value = withRepeat(
            withTiming((Math.random() - 0.5) * 50, {
                duration: config.moveDuration,
                easing: Easing.inOut(Easing.sin)
            }),
            -1,
            true
        );
    }, [config]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        left: config.x,
        top: config.y,
        width: config.size,
        height: config.size,
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value }
        ]
    }));

    return <Animated.View style={[styles.star, animatedStyle]} />;
});



const STAR_INDICES = Array.from({ length: BLINKING_STARS_COUNT }, (_, i) => i);

export const GlobalCosmicBackground = React.memo(() => {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {STAR_INDICES.map((i) => (
                <BlinkingStar key={`blink-${i}`} index={i} />
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    star: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 10,
        // Removed heavy shadows/elevation for smoothness on Android
    },
});
