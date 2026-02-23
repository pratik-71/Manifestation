import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    View,
    ViewStyle
} from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';

export type TimeValue = {
    hour: string;
    minute: string;
    ampm: 'AM' | 'PM';
};

type TimeWheelPickerProps = {
    value: TimeValue;
    onChange: (value: TimeValue) => void;
};

const ITEM_HEIGHT = 60;
const REPEAT_HOURS = 10;
const REPEAT_MINUTES = 4;
const REPEAT_AMPM = 20;

// Data Generation
const HOURS_BASE = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const MINUTES_BASE = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const AMPM_BASE = ['AM', 'PM'] as const;

const HOURS_DATA = Array.from({ length: REPEAT_HOURS }, () => HOURS_BASE).flat();
const MINUTES_DATA = Array.from({ length: REPEAT_MINUTES }, () => MINUTES_BASE).flat();
const AMPM_DATA = Array.from({ length: REPEAT_AMPM }, () => AMPM_BASE).flat();

interface WheelProps {
    items: string[];
    value: string;
    onChange: (val: string) => void;
    style?: ViewStyle;
    baseLength: number;
}

const WheelItem = React.memo(
    ({ label, index, scrollY }: { label: string; index: number; scrollY: SharedValue<number> }) => {
        const inputRange = useMemo(() => [
            (index - 2) * ITEM_HEIGHT,
            (index - 1) * ITEM_HEIGHT,
            index * ITEM_HEIGHT,
            (index + 1) * ITEM_HEIGHT,
            (index + 2) * ITEM_HEIGHT,
        ], [index]);

        const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(
                scrollY.value,
                inputRange,
                [0.75, 0.9, 1.05, 0.9, 0.75],
                Extrapolation.CLAMP
            );

            const opacity = interpolate(
                scrollY.value,
                inputRange,
                [0.3, 0.5, 1, 0.5, 0.3],
                Extrapolation.CLAMP
            );

            return {
                transform: [{ scale }],
                opacity,
            };
        });

        return (
            <Animated.View style={[styles.itemContainer, animatedStyle]}>
                <Text style={[styles.itemText, label === 'AM' || label === 'PM' ? styles.ampmText : null]}>{label}</Text>
            </Animated.View>
        );
    }
);

const Wheel = React.memo(({ items, value, onChange, style, baseLength }: WheelProps) => {
    const flatListRef = useRef<Animated.FlatList<string>>(null);
    const scrollY = useSharedValue(0);
    const isInteracting = useRef(false);
    const lastReportedValue = useRef(value);
    const [isLayoutReady, setIsLayoutReady] = useState(false);

    const isMatch = useCallback((a: string, b: string) => {
        if (!a || !b) return false;
        const nA = parseInt(a, 10);
        const nB = parseInt(b, 10);
        if (!isNaN(nA) && !isNaN(nB)) return nA === nB;
        return a.toString().toUpperCase() === b.toString().toUpperCase();
    }, []);

    // Initial index in the middle range
    const middleIndex = useMemo(() => {
        const middleBlock = Math.floor(items.length / baseLength / 2);
        const indexInBase = items.slice(0, baseLength).findIndex(item => isMatch(item, value));
        return (middleBlock * baseLength) + (indexInBase !== -1 ? indexInBase : 0);
    }, [items, baseLength, value]);

    const syncToValue = useCallback((val: string, animated = true) => {
        if (!flatListRef.current || isInteracting.current) return;

        const currentIndex = Math.round(scrollY.value / ITEM_HEIGHT);
        const valIndexInBase = items.slice(0, baseLength).findIndex(item => isMatch(item, val));

        if (valIndexInBase === -1) return;

        // Current block we are in
        const currentBlock = Math.floor(currentIndex / baseLength);
        let targetIndex = currentBlock * baseLength + valIndexInBase;

        // Ensure we are somewhat in the middle of the items array for better infinite feel
        const totalBlocks = items.length / baseLength;
        const targetBlock = Math.floor(totalBlocks / 2);

        // If we are too far from middle, jump to middle block
        if (Math.abs(currentBlock - targetBlock) > 2) {
            targetIndex = targetBlock * baseLength + valIndexInBase;
        }

        lastReportedValue.current = val;
        flatListRef.current.scrollToIndex({ index: targetIndex, animated });
    }, [items, baseLength, isMatch]);

    useEffect(() => {
        if (isLayoutReady && value !== lastReportedValue.current) {
            syncToValue(value, true);
        }
    }, [value, isLayoutReady, syncToValue]);

    const handleLayout = () => {
        if (!isLayoutReady) {
            // Give extra time for Android layout to stabilize before first forced scroll
            setTimeout(() => {
                setIsLayoutReady(true);
                syncToValue(value, false);
            }, 150);
        }
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const onMomentumScrollEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            isInteracting.current = false;
            const offsetY = event.nativeEvent.contentOffset.y;
            const index = Math.round(offsetY / ITEM_HEIGHT);
            const safeIndex = Math.max(0, Math.min(index, items.length - 1));

            const newValue = items[safeIndex];
            if (newValue && newValue !== lastReportedValue.current) {
                lastReportedValue.current = newValue;
                onChange(newValue);
            }
        },
        [items, onChange]
    );

    const onScrollBeginDrag = useCallback(() => {
        isInteracting.current = true;
    }, []);

    const onScrollEndDrag = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const velocity = event.nativeEvent.velocity?.y ?? 0;
            if (Math.abs(velocity) < 0.2) {
                isInteracting.current = false;
                const offsetY = event.nativeEvent.contentOffset.y;
                const index = Math.round(offsetY / ITEM_HEIGHT);
                const safeIndex = Math.max(0, Math.min(index, items.length - 1));

                const newValue = items[safeIndex];
                if (newValue && newValue !== lastReportedValue.current) {
                    lastReportedValue.current = newValue;
                    onChange(newValue);
                }
            }
        },
        [items, onChange]
    );

    return (
        <View style={[styles.wheelContainer, style]}>
            <Animated.FlatList
                ref={flatListRef}
                data={items}
                renderItem={({ item, index }) => (
                    <WheelItem label={item} index={index} scrollY={scrollY} />
                )}
                keyExtractor={(item, index) => `${index}`}
                getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
                initialScrollIndex={middleIndex}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onMomentumScrollEnd={onMomentumScrollEnd}
                onScrollBeginDrag={onScrollBeginDrag}
                onScrollEndDrag={onScrollEndDrag}
                onLayout={handleLayout}
                contentContainerStyle={styles.listContent}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
            />
        </View>
    );
});

import { Platform } from 'react-native';

export const TimeWheelPicker = React.memo(({ value, onChange }: TimeWheelPickerProps) => {
    const valueRef = useRef(value);
    valueRef.current = value;

    const handleHourChange = useCallback((newHour: string) => {
        onChange({ ...valueRef.current, hour: newHour });
    }, [onChange]);

    const handleMinuteChange = useCallback((newMinute: string) => {
        onChange({ ...valueRef.current, minute: newMinute });
    }, [onChange]);

    const handleAmPmChange = useCallback((newAmPm: string) => {
        onChange({ ...valueRef.current, ampm: newAmPm as 'AM' | 'PM' });
    }, [onChange]);

    return (
        <View style={styles.container}>
            <View style={styles.selectionOverlay} pointerEvents="none" />
            <View style={styles.wheelsWrapper}>
                <Wheel
                    items={HOURS_DATA}
                    value={value.hour}
                    onChange={handleHourChange}
                    baseLength={HOURS_BASE.length}
                    style={styles.wheelFlex}
                />
                <Wheel
                    items={MINUTES_DATA}
                    value={value.minute}
                    onChange={handleMinuteChange}
                    baseLength={MINUTES_BASE.length}
                    style={styles.wheelFlex}
                />
                <Wheel
                    items={AMPM_DATA}
                    value={value.ampm}
                    onChange={handleAmPmChange}
                    baseLength={AMPM_BASE.length}
                    style={styles.wheelFlex}
                />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        height: 180,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    wheelsWrapper: {
        flexDirection: 'row',
        width: '90%',
        height: '100%',
    },
    wheelContainer: {
        height: '100%',
        overflow: 'hidden',
    },
    wheelFlex: {
        flex: 1,
    },
    listContent: {
        paddingVertical: (180 - ITEM_HEIGHT) / 2,
    },
    itemContainer: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 24,
        color: '#fff',
        includeFontPadding: false,
    },
    ampmText: {
        fontSize: 18,
        fontFamily: 'Comfortaa_700Bold',
        letterSpacing: 2,
    },
    selectionOverlay: {
        position: 'absolute',
        top: 180 / 2 - ITEM_HEIGHT / 2,
        height: ITEM_HEIGHT,
        width: '90%',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
});
