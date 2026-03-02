import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    Layout,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const STAGE = {
    id: 1,
    title: 'Living the Reality',
    subtitle: 'The Embodiment',
    points: [
        'Start living your dream life today',
        'Watch content around your goals',
        'Connect with like-minded people',
        "Think and act as if it's already real"
    ],
    expandedPoints: [
        {
            title: 'Quantum Entanglement',
            desc: 'Your thoughts are electromagnetic signals. When you align your frequency with your goal, you collapse the wave function of possibility into physical reality.',
            todo: 'Spend 5 minutes every morning visualizing your goal in vivid detail, feeling the emotions of having already achieved it.',
            icon: 'analytics-outline'
        },
        {
            title: 'Neuroplasticity (Scientific)',
            desc: "By 'acting as if,' you bypass the Reticular Activating System (RAS), forcing your brain to notice opportunities that were previously invisible to you.",
            todo: "When faced with a decision, ask 'What would the version of me who already has this do?' and act accordingly.",
            icon: 'flash-outline'
        },
        {
            title: 'The Law of Vibration',
            desc: 'Ancient wisdom meets modern physics: nothing rests, everything moves. You do not attract what you want; you attract what you ARE.',
            todo: 'Curate your environment. Limit negative influences and surround yourself with high-frequency content and music.',
            icon: 'infinite-outline'
        }
    ],
    icon: 'planet-outline',
    colors: ['#fb923c', '#ea580c'],
};

export default function GuideScreen() {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleComplete = () => {
        router.replace('/home');
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

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.page}>
                        <View style={styles.contentWrapper}>
                            {/* 1. Header */}
                            <Animated.View entering={FadeInDown.delay(100).duration(800)} style={styles.stageHeader}>
                                <Text style={styles.stageTitle}>{STAGE.title}</Text>
                                <Text style={[styles.stageSubtitle, { color: STAGE.colors[0] }]}>{STAGE.subtitle}</Text>
                            </Animated.View>

                            {/* 2. Icon */}
                            <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.iconContainer}>
                                <LinearGradient
                                    colors={STAGE.colors as any}
                                    style={styles.iconCircle}
                                >
                                    <Ionicons name={STAGE.icon as any} size={36} color="#fff" />
                                </LinearGradient>
                            </Animated.View>

                            {/* 3. Pointwise Content */}
                            <Animated.View entering={FadeInDown.delay(500).duration(800)} style={styles.pointsList}>
                                {STAGE.points.map((point, i) => (
                                    <View key={i} style={styles.pointRow}>
                                        <View style={[styles.pointDot, { backgroundColor: STAGE.colors[0] }]} />
                                        <Text style={styles.pointText}>{point}</Text>
                                    </View>
                                ))}
                            </Animated.View>

                            {/* 4. View More Button (Above Study Data) */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setIsExpanded(!isExpanded)}
                                style={styles.viewMoreBtn}
                            >
                                <Text style={styles.viewMoreText}>
                                    {isExpanded ? 'Hide Insights' : 'View Deep Insights'}
                                </Text>
                                <Ionicons
                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={16}
                                    color="#fb923c"
                                />
                            </TouchableOpacity>

                            {/* 5. Expanded Content (Quantum/Scientific/Traditional) */}
                            {isExpanded && (
                                <Animated.View
                                    layout={Layout.springify()}
                                    entering={FadeInDown.duration(400)}
                                    style={styles.expandedContent}
                                >
                                    {STAGE.expandedPoints.map((item, idx) => (
                                        <View key={idx} style={styles.pointwiseItem}>
                                            <View style={styles.pointwiseLeft}>
                                                <View style={[styles.pointwiseIcon, { borderColor: STAGE.colors[0] }]}>
                                                    <Ionicons name={item.icon as any} size={12} color={STAGE.colors[0]} />
                                                </View>
                                                {idx < STAGE.expandedPoints.length - 1 && (
                                                    <View style={[styles.pointwiseLine, { backgroundColor: STAGE.colors[0] + '33' }]} />
                                                )}
                                            </View>
                                            <View style={styles.pointwiseRight}>
                                                <Text style={styles.insightTitle}>{item.title}</Text>
                                                <Text style={styles.insightDesc}>{item.desc}</Text>
                                                <View style={styles.todoBox}>
                                                    <Text style={[styles.todoLabel, { color: STAGE.colors[0] }]}>DAILY PRACTICE:</Text>
                                                    <Text style={styles.todoText}>{item.todo}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </Animated.View>
                            )}

                            {/* 6. Study Data */}
                            <Animated.View entering={FadeInDown.delay(700).duration(800)} style={styles.studyInfo}>
                                <View style={styles.studyHeaderSmall}>
                                    <Ionicons name="analytics-outline" size={16} color="#fb923c" />
                                    <Text style={styles.studyTagSmall}>STUDY DATA</Text>
                                </View>
                                <Text style={styles.studyTextSmall}>
                                    Living in the state of the wish fulfilled increases manifestation success by <Text style={styles.highlightSmall}>85%</Text>.
                                </Text>
                            </Animated.View>

                            <View style={{ height: 120 }} />
                        </View>
                    </View>
                </ScrollView>

                {/* 7. Floating Complete Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleComplete}
                        activeOpacity={0.8}
                        style={styles.nextButton}
                    >
                        <LinearGradient
                            colors={STAGE.colors as any}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.nextButtonGrad}
                        >
                            <Text style={styles.nextButtonText}>Begin Journey</Text>

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
        backgroundColor: 'rgba(251, 146, 60, 0.05)',
    },
    glowBottom: {
        position: 'absolute', bottom: 100, right: -50,
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(234, 88, 12, 0.05)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 28,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 22,
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    page: {
        width: width,
        paddingHorizontal: 32,
    },
    contentWrapper: {
        paddingTop: height * 0.02,
    },
    stageHeader: {
        marginBottom: 30,
    },
    stageTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 28,
        color: '#fff',
        marginBottom: 8,
    },
    stageSubtitle: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    pointsList: {
        gap: 18,
        marginBottom: 30,
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
        fontSize: 15,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 24,
        flex: 1,
    },
    viewMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 8,
        marginBottom: 20,
        backgroundColor: 'rgba(251, 146, 60, 0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(251, 146, 60, 0.15)',
    },
    viewMoreText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 13,
        color: '#fb923c',
    },
    pointwiseItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    pointwiseLeft: {
        width: 30,
        alignItems: 'center',
    },
    pointwiseIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    pointwiseLine: {
        width: 1,
        flex: 1,
        marginVertical: 4,
    },
    pointwiseRight: {
        flex: 1,
        marginLeft: 12,
    },
    insightTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 15,
        color: '#fff',
        marginBottom: 6,
    },
    insightDesc: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
        lineHeight: 20,
        marginBottom: 12,
    },
    todoBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    todoLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 9,
        letterSpacing: 1,
        marginBottom: 4,
    },
    todoText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 18,
    },
    studyInfo: {
        backgroundColor: 'rgba(251, 146, 60, 0.04)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(251, 146, 60, 0.1)',
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
        color: '#fb923c',
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
        paddingHorizontal: 28,
        backgroundColor: 'transparent',
        paddingBottom: 40,
        paddingTop: 10,
    },
    nextButton: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#fb923c',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    nextButtonGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    nextButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 17,
        color: '#fff',
    },
});
