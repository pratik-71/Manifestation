import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

interface BreathingBackgroundProps {
    colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
    opacity?: number;
    children?: React.ReactNode;
}

const BreathingBackgroundComponent: React.FC<BreathingBackgroundProps> = ({
    colors,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    opacity = 0.4,
    children
}) => {
    // Removed breathing animation logic to fix lag

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Directly render the gradient without animated opacity */}
            <LinearGradient
                colors={colors}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {children}
        </View>
    );
};

export const BreathingBackground = React.memo(BreathingBackgroundComponent, (prev, next) => {
    // Only re-render if colors actually changed
    return prev.colors.length === next.colors.length &&
        prev.colors.every((color, index) => color === next.colors[index]);
});
