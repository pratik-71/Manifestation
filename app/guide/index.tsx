import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    useSharedValue
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const STAGES = [
    {
        id: 1,
        title: 'Manifesting the Vision',
        subtitle: 'The Blueprint',
        points: [
            'Define your objective with absolute precision',
            'Align your internal focus with your future outcome',
            'Internalize the success before it manifests physically'
        ],
        icon: 'eye-outline',
        colors: ['#7c3aed', '#4338ca'],
    },
    {
        id: 2,
        title: 'Frequency of Action',
        subtitle: 'The Bridge',
        points: [
            'Bridge the gap between thought and reality through work',
            'Ensure your daily output matches your level of ambition',
            'Focus on consistent execution over passive contemplation'
        ],
        icon: 'flash-outline',
        colors: ['#f97316', '#ea580c'],
    },
    {
        id: 3,
        title: 'Living the Reality',
        subtitle: 'The Embodiment',
        points: [
            'Make decisions as the version of you who has already succeeded',
            'Structure your daily schedule to reflect your desired lifestyle',
            'Adopt the mindset and habits of your future self today'
        ],
        icon: 'planet-outline',
        colors: ['#db2777', '#be185d'],
    },
];

export default function GuideScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<Animated.ScrollView>(null);

    const handleNext = () => {
        if (currentIndex < STAGES.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
        } else {
            router.replace('/home');
        }
    };

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={['#02010a', '#0a031a', '#14052c']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.glowTop} />
            <View style={styles.glowBottom} />

            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cosmic Guide</Text>
                    <View style={{ width: 44 }} />
                </View>

                <Animated.ScrollView
                    ref={scrollRef as any}
                    horizontal
                    pagingEnabled
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {STAGES.map((stage, index) => (
                        <View key={stage.id} style={styles.page}>
                            <View style={styles.contentWrapper}>
                                {/* 1. Header */}
                                <Animated.View entering={FadeInDown.delay(100).duration(800)} style={styles.stageHeader}>
                                    <Text style={styles.stageTitle}>{stage.title}</Text>
                                    <Text style={[styles.stageSubtitle, { color: stage.colors[0] }]}>{stage.subtitle}</Text>
                                </Animated.View>

                                {/* 2. Icon */}
                                <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.iconContainer}>
                                    <LinearGradient
                                        colors={stage.colors as any}
                                        style={styles.iconCircle}
                                    >
                                        <Ionicons name={stage.icon as any} size={36} color="#fff" />
                                    </LinearGradient>
                                </Animated.View>

                                {/* 3. Pointwise Content */}
                                <Animated.View entering={FadeInDown.delay(500).duration(800)} style={styles.pointsList}>
                                    {stage.points.map((point, i) => (
                                        <View key={i} style={styles.pointRow}>
                                            <View style={[styles.pointDot, { backgroundColor: stage.colors[0] }]} />
                                            <Text style={styles.pointText}>{point}</Text>
                                        </View>
                                    ))}
                                </Animated.View>

                                {/* 4. Study Data */}
                                <Animated.View entering={FadeInDown.delay(700).duration(800)} style={styles.studyInfo}>
                                    <View style={styles.studyHeaderSmall}>
                                        <Ionicons name="analytics-outline" size={16} color="#00d4ff" />
                                        <Text style={styles.studyTagSmall}>STUDY DATA</Text>
                                    </View>
                                    <Text style={styles.studyTextSmall}>
                                        Visualization + Daily Action increases success by <Text style={styles.highlightSmall}>60%</Text>.
                                    </Text>
                                </Animated.View>
                            </View>
                        </View>
                    ))}
                </Animated.ScrollView>

                {/* 5. Floating Next Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleNext}
                        activeOpacity={0.8}
                        style={styles.nextButton}
                    >
                        <LinearGradient
                            colors={STAGES[currentIndex].colors as any}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.nextButtonGrad}
                        >
                            <Text style={styles.nextButtonText}>
                                {currentIndex === STAGES.length - 1 ? 'Complete' : 'Continue Journey'}
                            </Text>
                            <Ionicons
                                name={currentIndex === STAGES.length - 1 ? "checkmark" : "arrow-forward"}
                                size={20}
                                color="#fff"
                                style={{ marginLeft: 10 }}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#02010a',
    },
    safe: {
        flex: 1,
    },
    glowTop: {
        position: 'absolute', top: -100, left: -50,
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(124, 58, 237, 0.05)',
    },
    glowBottom: {
        position: 'absolute', bottom: 100, right: -50,
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(219, 39, 119, 0.05)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 28,
    },
    backButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
       
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    scrollContent: {
        flexGrow: 1,
    },
    page: {
        width: width,
        height: '100%',
        paddingHorizontal: 32,
    },
    contentWrapper: {
        flex: 1,
        paddingTop: height * 0.05,
    },
    stageHeader: {
        marginBottom: 40,
    },
    stageTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#fff',
        marginBottom: 8,
    },
    stageSubtitle: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 8,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    pointsList: {
        gap: 20,
        marginBottom: 50,
    },
    pointRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    pointDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 10,
        marginRight: 16,
    },
    pointText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 26,
        flex: 1,
    },
    studyInfo: {
        backgroundColor: 'rgba(0, 212, 255, 0.04)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(0, 212, 255, 0.1)',
    },
    studyHeaderSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    studyTagSmall: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 11,
        color: '#00d4ff',
        letterSpacing: 2,
    },
    studyTextSmall: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 22,
    },
    highlightSmall: {
        color: '#fff',
        fontFamily: 'Comfortaa_700Bold',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        paddingHorizontal: 28,
    },
    nextButton: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    nextButtonGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    nextButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 17,
        color: '#fff',
    },
});
