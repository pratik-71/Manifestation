import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    ListRenderItem,
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
const REPEAT_HOURS = 3;
const REPEAT_MINUTES = 2; // 120 items is enough for smooth scroll
const REPEAT_AMPM = 5;

// Data Generation
const HOURS_BASE = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const MINUTES_BASE = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const AMPM_BASE = ['AM', 'PM'] as const;

const HOURS_DATA = Array.from({ length: REPEAT_HOURS }, () => HOURS_BASE).flat();
const MINUTES_DATA = Array.from({ length: REPEAT_MINUTES }, () => MINUTES_BASE).flat();
const AMPM_DATA = Array.from({ length: REPEAT_AMPM }, () => AMPM_BASE).flat();

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
// @ts-ignore - needed because Animated.createAnimatedComponent doesn't perfectly preserve generic types sometimes
const TypedAnimatedFlatList = AnimatedFlatList as any;

interface WheelProps {
    items: string[];
    value: string;
    onChange: (val: string) => void;
    style?: ViewStyle;
    baseLength: number;
}

const isMatch = (a: string, b: string) => {
    if (!a || !b) return false;
    const nA = parseInt(a, 10);
    const nB = parseInt(b, 10);
    if (!isNaN(nA) && !isNaN(nB)) return nA === nB;
    return a.toString().toUpperCase() === b.toString().toUpperCase();
};

const WheelItem = React.memo(
    ({ label, index, scrollY }: { label: string; index: number; scrollY: SharedValue<number> }) => {
        const animatedStyle = useAnimatedStyle(() => {
            const inputRange = [
                (index - 2) * ITEM_HEIGHT,
                (index - 1) * ITEM_HEIGHT,
                index * ITEM_HEIGHT,
                (index + 1) * ITEM_HEIGHT,
                (index + 2) * ITEM_HEIGHT,
            ];

            const scale = interpolate(
                scrollY.value,
                inputRange,
                [0.75, 0.9, 1.1, 0.9, 0.75],
                Extrapolation.CLAMP
            );

            const opacity = interpolate(
                scrollY.value,
                inputRange,
                [0.2, 0.4, 1, 0.4, 0.2],
                Extrapolation.CLAMP
            );

            return {
                transform: [{ scale }],
                opacity,
            };
        });

        return (
            <Animated.View style={[styles.itemContainer, animatedStyle]}>
                <Text style={[styles.itemText, label === 'AM' || label === 'PM' ? styles.ampmText : null]}>
                    {label}
                </Text>
            </Animated.View>
        );
    }
);

const Wheel = React.memo(({ items, value, onChange, style, baseLength }: WheelProps) => {
    const flatListRef = useRef<any>(null);
    const scrollY = useSharedValue(0);
    const isInteracting = useRef(false);
    const lastReportedValue = useRef(value);
    const [isLayoutReady, setIsLayoutReady] = useState(false);

    // Calculate the target index in the items array that corresponds to value
    const getTargetIndex = useCallback((val: string) => {
        const valIndexInBase = items.slice(0, baseLength).findIndex(item => isMatch(item, val));
        if (valIndexInBase === -1) return 0;

        // Find the middle block
        const totalBlocks = items.length / baseLength;
        const middleBlock = Math.floor(totalBlocks / 2);
        return middleBlock * baseLength + valIndexInBase;
    }, [items, baseLength]);

    const initialIndex = useMemo(() => getTargetIndex(value), [getTargetIndex, value]);

    const syncToValue = useCallback((val: string, animated = true) => {
        if (!flatListRef.current || isInteracting.current) return;

        const targetIndex = getTargetIndex(val);
        lastReportedValue.current = val;

        flatListRef.current.scrollToOffset({
            offset: targetIndex * ITEM_HEIGHT,
            animated
        });
    }, [getTargetIndex]);

    useEffect(() => {
        if (isLayoutReady && value !== lastReportedValue.current) {
            syncToValue(value, true);
        }
    }, [value, isLayoutReady, syncToValue]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const handleScrollEnd = useCallback(
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

    const getItemLayout = (_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
    });

    const renderItem: ListRenderItem<string> = useCallback(({ item, index }) => (
        <WheelItem label={item} index={index} scrollY={scrollY} />
    ), [scrollY]);

    return (
        <View style={[styles.wheelContainer, style]}>
            <TypedAnimatedFlatList
                ref={flatListRef}
                data={items}
                keyExtractor={(item: string, index: number) => index.toString()}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                initialScrollIndex={initialIndex}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onMomentumScrollEnd={handleScrollEnd}
                onScrollBeginDrag={onScrollBeginDrag}
                onScrollEndDrag={handleScrollEnd}
                onLayout={() => setIsLayoutReady(true)}
                contentContainerStyle={styles.listContent}
                nestedScrollEnabled={true}
                removeClippedSubviews={true}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={3}
            />
        </View>
    );
});

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
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    wheelsWrapper: {
        flexDirection: 'row',
        width: '100%',
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
        fontSize: 26,
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
        width: '94%',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
});
