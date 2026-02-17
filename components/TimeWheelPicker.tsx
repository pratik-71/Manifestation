import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
const REPEAT_HOURS = 50; // ~600 items (12 * 50) - Much lighter
const REPEAT_MINUTES = 20; // ~1200 items (60 * 20) - Reduced significantly
const REPEAT_AMPM = 100; // ~200 items (2 * 100)

// Data Generation
const HOURS_BASE = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const MINUTES_BASE = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const AMPM_BASE = ['AM', 'PM'];

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
    const isMomentumScroll = useRef(false);
    const lastReportedValue = useRef(value);

    // Calculate start index to be roughly in the middle
    const initialIndex = useMemo(() => {
        const middleSet = Math.floor(items.length / baseLength / 2);
        const startIndexInBase = items.slice(0, baseLength).indexOf(value);
        const targetIndex = (middleSet * baseLength) + (startIndexInBase !== -1 ? startIndexInBase : 0);
        return Math.max(0, targetIndex);
    }, [items.length, baseLength]);

    // Sync Scroll to Value (only if external change)
    useEffect(() => {
        if (isMomentumScroll.current) return;

        const currentIndex = Math.round(scrollY.value / ITEM_HEIGHT);
        if (isNaN(currentIndex)) return;

        const currentItem = items[currentIndex];
        if (currentItem === value) return;

        const valIndexInBase = items.slice(0, baseLength).indexOf(value);
        const currentBlock = Math.floor(currentIndex / baseLength);
        let targetIndex = currentBlock * baseLength + valIndexInBase;

        if (Math.abs(targetIndex - currentIndex) > baseLength / 2) {
            if (targetIndex > currentIndex) targetIndex -= baseLength;
            else targetIndex += baseLength;
        }

        if (targetIndex < 0) targetIndex += baseLength;
        if (targetIndex >= items.length) targetIndex -= baseLength;

        if (targetIndex >= 0 && targetIndex < items.length) {
            flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
        }
    }, [value, items, baseLength]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const onMomentumScrollEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            isMomentumScroll.current = false;
            const offsetY = event.nativeEvent.contentOffset.y;
            const index = Math.round(offsetY / ITEM_HEIGHT);
            const safeIndex = Math.max(0, Math.min(index, items.length - 1));

            const newValue = items[safeIndex];
            if (newValue !== lastReportedValue.current) {
                lastReportedValue.current = newValue;
                onChange(newValue);
            }
        },
        [items, onChange]
    );

    const onScrollBeginDrag = useCallback(() => {
        isMomentumScroll.current = true;
    }, []);

    const onScrollEndDrag = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const velocity = event.nativeEvent.velocity?.y ?? 0;
            if (Math.abs(velocity) < 0.2) {
                isMomentumScroll.current = false;
                const offsetY = event.nativeEvent.contentOffset.y;
                const index = Math.round(offsetY / ITEM_HEIGHT);
                const safeIndex = Math.max(0, Math.min(index, items.length - 1));

                const newValue = items[safeIndex];
                if (newValue !== lastReportedValue.current) {
                    lastReportedValue.current = newValue;
                    onChange(newValue);
                }
            }
        },
        [items, onChange]
    );

    const getItemLayout = useCallback(
        (_: any, index: number) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
        }),
        []
    );

    const renderItem = useCallback(
        ({ item, index }: { item: string; index: number }) => {
            return <WheelItem label={item} index={index} scrollY={scrollY} />;
        },
        [scrollY]
    );

    return (
        <View style={[styles.wheelContainer, style]}>
            <Animated.FlatList
                ref={flatListRef}
                data={items}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${index}`}
                getItemLayout={getItemLayout}
                initialScrollIndex={initialIndex}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onMomentumScrollEnd={onMomentumScrollEnd}
                onScrollBeginDrag={onScrollBeginDrag}
                onScrollEndDrag={onScrollEndDrag}
                contentContainerStyle={styles.listContent}
                initialNumToRender={7}
                maxToRenderPerBatch={3}
                updateCellsBatchingPeriod={100}
                windowSize={3}
                removeClippedSubviews={true}
            />
        </View>
    );
});

export const TimeWheelPicker = React.memo(({ value, onChange }: TimeWheelPickerProps) => {
    const valueRef = useRef(value);
    valueRef.current = value;

    const handleHourChange = useCallback((newHour: string) => {
        const current = valueRef.current;
        if (current.hour !== newHour) {
            onChange({ ...current, hour: newHour });
        }
    }, [onChange]);

    const handleMinuteChange = useCallback((newMinute: string) => {
        const current = valueRef.current;
        if (current.minute !== newMinute) {
            onChange({ ...current, minute: newMinute });
        }
    }, [onChange]);

    const handleAmPmChange = useCallback((newAmPm: string) => {
        const current = valueRef.current;
        if (current.ampm !== newAmPm) {
            onChange({ ...current, ampm: newAmPm as 'AM' | 'PM' });
        }
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
}, (prevProps, nextProps) => {
    // Only re-render if the time value actually changed
    return (
        prevProps.value.hour === nextProps.value.hour &&
        prevProps.value.minute === nextProps.value.minute &&
        prevProps.value.ampm === nextProps.value.ampm &&
        prevProps.onChange === nextProps.onChange
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
