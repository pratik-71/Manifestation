import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, {
    Easing,
    FadeInDown,
    FadeInUp,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { BreathingBackground } from '../../components/BreathingBackground';
import { requestNotificationPermissions } from '../../services/notificationService';
import { generateAIRoadmap, updateGoals } from '../../services/profileService';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useUserStore } from '../../store/userStore';

const LOADING_MESSAGES = [
    "Analyzing your vision...",
    "Curating elite resources...",
    "Aligning with high-performance minds...",
    "Architecting your elite path...",
    "Syncing your manifestation...",
];

const RoadmapLoading = () => {
    const [msgIndex, setMsgIndex] = useState(0);
    const rotation = useSharedValue(0);
    const pulse = useSharedValue(1);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 2000, easing: Easing.linear }),
            -1,
            false
        );
        pulse.value = withRepeat(
            withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        const timer = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 1200);
        return () => clearInterval(timer);
    }, []);

    const ringStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: interpolate(pulse.value, [1, 1.2], [1, 0.4]),
    }));

    return (
        <View style={styles.premiumLoadingContainer}>
            <View style={styles.lottieAlternative}>
                <Animated.View style={[styles.pulseRing, pulseStyle]} />
                <Animated.View style={[styles.rotatingRing, ringStyle]}>
                    <View style={styles.ringDot} />
                </Animated.View>
                <Ionicons name="sparkles" size={32} color="#f59e0b" />
            </View>
            <View style={styles.loadingInfo}>
                <Text style={styles.eliteLoadingText}>{LOADING_MESSAGES[msgIndex]}</Text>
                <Text style={styles.loadingSubText}>This will be your masterplan for excellence.</Text>
            </View>
        </View>
    );
};

export default function Goals() {
    const router = useRouter();
    const setGoals = useOnboardingStore((s) => s.setGoals);
    const [currentGoal, setCurrentGoal] = useState('');
    const [goalTags, setGoalTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI Coach State
    const [selectedGoalForAI, setSelectedGoalForAI] = useState<string | null>(null);
    const [aiResponse, setAiResponse] = useState<{ goal: string; content: string[]; network: string[] }[]>([]);
    const setAiRoadmap = useOnboardingStore((s) => s.setAiRoadmap);
    const [currentAiGoalIndex, setCurrentAiGoalIndex] = useState(0);
    const [aiLoading, setAiLoading] = useState(false);
    const [isCoachVisible, setIsCoachVisible] = useState(false);

    const { profile, fetchProfile } = useUserStore();
    const isUpdateMode = profile?.onboarding_complete === true;

    useEffect(() => {
        // If we have existing goals, pre-fill them
        if (profile?.goals && profile.goals.length > 0) {
            setGoalTags(profile.goals);
        }
    }, [profile?.goals]);

    const handleAddGoal = () => {
        if (currentGoal.trim().length >= 3) {
            setGoalTags([...goalTags, currentGoal.trim()]);
            setCurrentGoal('');
        }
    };

    const handleRemoveGoal = (index: number) => {
        setGoalTags(goalTags.filter((_, i) => i !== index));
    };

    const startAICoach = async (goals: string[]) => {
        setSelectedGoalForAI(goals.join(", "));
        setIsCoachVisible(true);
        setAiLoading(true);
        setAiResponse([]);
        setCurrentAiGoalIndex(0);

        try {
            const data = await generateAIRoadmap(goals);
            setAiResponse(data);
            setAiRoadmap(data);
        } catch (error) {
            console.warn('AI Coach error (safely caught)');
            // Fallback handled inside generateAIRoadmap
        } finally {
            setAiLoading(false);
        }
    };

    const isValid = goalTags.length > 0;

    return (
        <View style={{ flex: 1, backgroundColor: '#02010a' }}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={['#02010a', '#78350f', '#f59e0b']}
                opacity={0.8}
            />

            <View style={styles.overlay} pointerEvents="none" />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons name="chevron-back" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <KeyboardAwareScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View
                            entering={FadeInDown.duration(600).delay(100)}
                            style={styles.questionContainer}
                        >
                            <Text style={styles.questionText}>
                                What are your goals?
                            </Text>
                            <Text style={styles.subQuestionText}>
                                Enter the dreams that you want to turn into reality
                            </Text>
                        </Animated.View>

                        <Animated.View
                            entering={FadeInUp.duration(600).delay(200)}
                            style={styles.inputWrapper}
                        >
                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={currentGoal}
                                    onChangeText={setCurrentGoal}
                                    placeholder="Type your goal here..."
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    style={styles.input}
                                    maxLength={100}
                                    returnKeyType="done"
                                    cursorColor="#f59e0b"
                                    selectionColor="rgba(245,158,11,0.3)"
                                    onSubmitEditing={handleAddGoal}
                                    multiline
                                />

                                <TouchableOpacity
                                    onPress={handleAddGoal}
                                    disabled={currentGoal.trim().length < 3}
                                    style={[
                                        styles.addButton,
                                        currentGoal.trim().length >= 3
                                            ? styles.addButtonActive
                                            : styles.addButtonInactive,
                                    ]}
                                >
                                    <Ionicons
                                        name="arrow-forward-circle"
                                        size={36}
                                        color={
                                            currentGoal.trim().length >= 3
                                                ? '#f59e0b'
                                                : 'rgba(255,255,255,0.2)'
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        {goalTags.length > 0 && (
                            <Animated.View
                                entering={FadeInUp.duration(400)}
                                style={styles.goalListContainer}
                            >
                                {goalTags.map((goal, index) => (
                                    <Animated.View
                                        key={index}
                                        entering={FadeInUp.duration(300).delay(index * 100)}
                                        style={styles.goalItem}
                                    >
                                        <Text
                                            style={styles.goalItemText}
                                            numberOfLines={2}
                                        >
                                            {goal}
                                        </Text>
                                        <View style={styles.goalActions}>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleRemoveGoal(index)
                                                }
                                                style={styles.removeButton}
                                            >
                                                <Ionicons
                                                    name="close-circle-outline"
                                                    size={24}
                                                    color="rgba(255,255,255,0.3)"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </Animated.View>
                                ))}
                            </Animated.View>
                        )}

                        <View style={styles.footer}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (isValid && !isSubmitting) {
                                        setIsSubmitting(true);
                                        setGoals(goalTags);
                                        startAICoach(goalTags);
                                        setTimeout(() => setIsSubmitting(false), 800);
                                    }
                                }}
                                disabled={!isValid || isSubmitting}
                                style={[
                                    styles.nextButton,
                                    isValid && !isSubmitting
                                        ? styles.nextButtonActive
                                        : styles.nextButtonInactive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.nextButtonText,
                                        !isValid && { opacity: 0.3 },
                                    ]}
                                >
                                    Continue
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </SafeAreaView>

            {/* AI Coach Modal */}
            <Modal
                visible={isCoachVisible}
                animationType="fade"
                transparent={false}
                onRequestClose={() => setIsCoachVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <BreathingBackground
                        colors={['#1c160c', '#2d2109', '#050505']}
                        opacity={0.9}
                    />
                    <SafeAreaView style={{ flex: 1 }}>
                        <TouchableOpacity
                            onPress={() => setIsCoachVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            <Ionicons name="close" size={24} color="#f59e0b" />
                        </TouchableOpacity>

                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <View style={styles.stepperContainer}>
                                    {aiResponse.length > 1 && aiResponse.map((_, idx) => (
                                        <View
                                            key={idx}
                                            style={[
                                                styles.stepDot,
                                                idx === currentAiGoalIndex && styles.stepDotActive,
                                                idx < currentAiGoalIndex && styles.stepDotCompleted
                                            ]}
                                        />
                                    ))}
                                </View>
                                <Text style={styles.modalSubtitle}>we are not here to copy others, we are here to be the best version of ourselves.</Text>
                            </View>

                            <ScrollView
                                style={styles.modalScroll}
                                contentContainerStyle={styles.modalScrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {aiLoading ? (
                                    <RoadmapLoading />
                                ) : (
                                    aiResponse[currentAiGoalIndex] && (
                                        <Animated.View
                                            key={currentAiGoalIndex}
                                            entering={FadeInDown.duration(400)}
                                            style={styles.singleGoalContainer}
                                        >
                                            <Text style={styles.bigGoalText}>
                                                {aiResponse[currentAiGoalIndex].goal}
                                            </Text>

                                            <View style={styles.recSection}>
                                                <View style={styles.recHeader}>
                                                    <Ionicons name="logo-youtube" size={18} color="#f59e0b" />
                                                    <Text style={styles.recLabel}>YOUTUBE & MINDSET</Text>
                                                </View>
                                                <Text style={styles.recIntro}>Follow these channels to shift your mindset:</Text>
                                                <View style={styles.pointsList}>
                                                    {aiResponse[currentAiGoalIndex].content?.map((point, pIdx) => (
                                                        <View key={pIdx} style={styles.pointRow}>
                                                            <View style={styles.bullet} />
                                                            <Text style={styles.recValue}>{point}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>

                                            <View style={styles.recSection}>
                                                <View style={styles.recHeader}>
                                                    <Ionicons name="chatbubbles" size={18} color="#f59e0b" />
                                                    <Text style={styles.recLabel}>REPUTABLE COMMUNITIES</Text>
                                                </View>
                                                <Text style={styles.recIntro}>Join these communities to understand their thinking:</Text>
                                                <View style={styles.pointsList}>
                                                    {aiResponse[currentAiGoalIndex].network?.map((point, pIdx) => (
                                                        <View key={pIdx} style={styles.pointRow}>
                                                            <View style={styles.bullet} />
                                                            <Text style={styles.recValue}>{point}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        </Animated.View>
                                    )
                                )}
                            </ScrollView>

                            {!aiLoading && aiResponse?.length > 0 && (
                                <View style={styles.modalFooter}>
                                    <View style={styles.modalNavRow}>
                                        {currentAiGoalIndex > 0 && (
                                            <TouchableOpacity
                                                onPress={() => setCurrentAiGoalIndex(prev => prev - 1)}
                                                style={styles.backButtonIcon}
                                            >
                                                <Ionicons name="chevron-back" size={24} color="#f59e0b" />
                                            </TouchableOpacity>
                                        )}

                                        {currentAiGoalIndex < aiResponse.length - 1 ? (
                                            <TouchableOpacity
                                                onPress={() => setCurrentAiGoalIndex(prev => prev + 1)}
                                                style={[styles.finishModalButton, { flex: 1 }]}
                                            >
                                                <Text style={styles.finishModalButtonText}>Next Goal</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    setIsCoachVisible(false);
                                                    if (profile?.id) {
                                                        setIsSubmitting(true);
                                                        try {
                                                            // Restore actual API update
                                                            await updateGoals(profile.id, goalTags, aiResponse);
                                                            await fetchProfile(profile.id);
                                                            
                                                            if (isUpdateMode) {
                                                                router.replace('/manifestation');
                                                            } else {
                                                                router.push('/record_future?fromOnboarding=1');
                                                            }
                                                        } catch (err) {
                                                            console.warn('Failed to update goals (safely caught)');
                                                        } finally {
                                                            setIsSubmitting(false);
                                                        }
                                                    } else {
                                                        // Fallback for fresh onboarding if profile not yet loaded
                                                        setGoals(goalTags);
                                                        router.push('/record_future?fromOnboarding=1');
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                                style={[styles.finishModalButton, { flex: 1, opacity: isSubmitting ? 0.7 : 1 }]}
                                            >
                                                {isSubmitting ? (
                                                    <ActivityIndicator color="#1c160c" />
                                                ) : (
                                                    <Text style={styles.finishModalButtonText}>
                                                        {isUpdateMode ? "Update Goals" : "Accept Challenge"}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            )}
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 14,
        paddingTop: 20,
    },
    backButton: {
        padding: 8,
        alignSelf: 'flex-start',
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 32,
        paddingTop: 20,
        paddingBottom: 40,
    },
    questionContainer: {
        marginBottom: 48,
        alignItems: 'flex-start',
    },
    questionText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 26,
        lineHeight: 34,
        color: '#fff',
        letterSpacing: -0.5,
    },
    subQuestionText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        lineHeight: 20,
        marginTop: 12,
        color: 'rgba(255,255,255,0.5)',
        maxWidth: '90%',
    },
    inputWrapper: {
        marginBottom: 32,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        paddingBottom: 8,
        gap: 12,
    },
    input: {
        flex: 1,
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 18,
        color: '#fff',
        minHeight: 40,
        maxHeight: 100,
        textAlignVertical: 'center',
        paddingVertical: 4,
    },
    addButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonActive: {
        opacity: 1,
    },
    addButtonInactive: {
        opacity: 0.3,
    },
    goalListContainer: {
        marginTop: 20,
        gap: 16,
    },
    goalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 4,
    },
    goalItemText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 16,
        color: '#fff',
        flex: 1,
    },
    goalActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    removeButton: {
        padding: 4,
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 40,
        paddingBottom: 24,
    },
    nextButton: {
        paddingVertical: 12,
        borderRadius: 32,
        width: '100%',
        alignItems: 'center',
    },
    nextButtonActive: {
        backgroundColor: '#f59e0b',
        shadowColor: '#f59e0b',
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
    },
    nextButtonInactive: {
        backgroundColor: 'rgba(245,158,11,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.2)',
    },
    nextButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 18,
        letterSpacing: 1.5,
        color: '#1c160c',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    // Modal Styles (Dark Amber theme as requested previously)
    modalOverlay: {
        flex: 1,
        backgroundColor: '#000',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
    },
    modalHeader: {
        marginBottom: 24,
    },
    modalFooter: {
        paddingVertical: 10,
        paddingBottom: 28, // Lifted for iOS home bar
    },
    modalNavRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalSubtitle: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 12,
        lineHeight: 18,
    },
    stepperContainer: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 4,
    },
    stepDot: {
        height: 4,
        width: 20,
        borderRadius: 2,
        backgroundColor: 'rgba(245,158,11,0.2)',
    },
    stepDotActive: {
        backgroundColor: '#f59e0b',
        width: 30,
    },
    stepDotCompleted: {
        backgroundColor: 'rgba(245,158,11,0.6)',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 50,
        padding: 8,


    },
    modalScroll: {
        flex: 1,
    },
    modalScrollContent: {
        paddingTop: 10,
        paddingBottom: 40,
    },
    singleGoalContainer: {
        gap: 24,
    },
    bigGoalText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#fff',
        lineHeight: 46,
        marginBottom: 10,
        textShadowColor: 'rgba(245,158,11,0.2)',
        textShadowRadius: 15,
    },
    recSection: {
        marginBottom: 16,
    },
    recHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    recLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 11,
        color: '#f59e0b',
        letterSpacing: 1.5,
    },
    recIntro: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    recValue: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 15,
        lineHeight: 22,
        color: '#fff',
        flex: 1,
    },
    pointsList: {
        marginTop: 4,
        gap: 10,
    },
    pointRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#f59e0b',
        marginTop: 8,
    },
    loadingContainer: {
        padding: 60,
        alignItems: 'center',
        gap: 20,
    },
    premiumLoadingContainer: {
        paddingVertical: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lottieAlternative: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    pulseRing: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#f59e0b',
    },
    rotatingRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.2)',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    ringDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#f59e0b',
        marginTop: -4,
    },
    loadingInfo: {
        alignItems: 'center',
        gap: 12,
    },
    eliteLoadingText: {
        fontFamily: 'Comfortaa_700Bold',
        color: '#f59e0b',
        fontSize: 18,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    loadingSubText: {
        fontFamily: 'Comfortaa_400Regular',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        textAlign: 'center',
    },
    loadingText: {
        fontFamily: 'Comfortaa_400Regular',
        color: '#f59e0b',
        fontSize: 16,
    },
    finishModalButton: {
        backgroundColor: '#f59e0b',
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: 'center',
    },
    finishModalButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#1c160c',
    },
    backButtonIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(245,158,11,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
