import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomBar } from '../components/BottomBar';
import { BreathingBackground } from '../components/BreathingBackground';
import { useUserStore } from '../store/userStore';

const { width } = Dimensions.get('window');

export default function ManifestHub() {
    const router = useRouter();
    const {
        profile,
        manifestTasks,
        toggleManifestTask,
        startChallenge,
        completeTaskDay
    } = useUserStore();

    const challengeDay = profile?.challenge_day || 1;
    const challengeDuration = profile?.challenge_duration || 7;
    const isChallengeComplete = profile?.is_challenge_complete || false;

    useEffect(() => {
        const allTasksDone = manifestTasks.tookAction &&
            manifestTasks.watchedContent &&
            manifestTasks.connectedWithPeople;

        if (allTasksDone) {
            completeTaskDay();
        }
    }, [manifestTasks]);

    const [roadmapModal, setRoadmapModal] = React.useState<{ visible: boolean, type: 'content' | 'network' }>({
        visible: false,
        type: 'content'
    });

    const [savedGoals, setSavedGoals] = useState<string[]>([]);
    const [checkedGoals, setCheckedGoals] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const loadGoals = async () => {
            try {
                const data = await AsyncStorage.getItem('today_goals');
                if (data) {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setSavedGoals(parsed);
                    }
                }
            } catch (e) { }
        };
        loadGoals();
    }, []);

    // Auto-tick 'Take Action' when all sub-goals are checked
    useEffect(() => {
        if (savedGoals.length > 0) {
            const allChecked = savedGoals.every((_, idx) => checkedGoals[idx]);
            if (allChecked && !manifestTasks.tookAction) {
                toggleManifestTask('tookAction');
            }
        }
    }, [checkedGoals, savedGoals]);

    const toggleGoalCheck = (idx: number) => {
        setCheckedGoals(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const RitualRow = ({ icon, label, checked, onToggle, onShowDetails, showBorder = true, hint }: any) => (
        <View style={[styles.ritualRow, !showBorder && { borderBottomWidth: 0 }]}>
            <TouchableOpacity
                onPress={onShowDetails}
                activeOpacity={onShowDetails ? 0.6 : 1}
                style={styles.ritualLeft}
            >
                <View style={[styles.iconContainer, checked && styles.iconContainerChecked]}>
                    <Ionicons name={icon} size={18} color={checked ? "#10b981" : "#fff"} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.ritualLabel, checked && styles.ritualLabelChecked]}>{label}</Text>
                    {hint ? <Text style={styles.ritualViewAction}>{hint}</Text> : null}
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onToggle}
                activeOpacity={0.7}
                style={[styles.checkbox, checked && styles.checkboxChecked]}
            >
                {checked && <Ionicons name="checkmark" size={12} color="#fff" />}
            </TouchableOpacity>
        </View>
    );

    const RoadmapModal = () => {
        const type = roadmapModal.type;
        const title = type === 'content' ? 'Content Roadmap' : 'Network Roadmap';
        const subtitle = type === 'content'
            ? 'Curated resources to accelerate your growth'
            : 'Communities to align with similar minds';

        return (
            <Modal
                visible={roadmapModal.visible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setRoadmapModal({ ...roadmapModal, visible: false })}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={120} tint="dark" style={styles.modalBlur}>
                        <SafeAreaView style={{ flex: 1 }}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity
                                    onPress={() => setRoadmapModal({ ...roadmapModal, visible: false })}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="chevron-down" size={24} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>{title}</Text>
                                <Text style={styles.modalSubtitle}>{subtitle}</Text>
                            </View>

                            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                                {profile?.ai_roadmap?.map((goalItem, gIdx) => (
                                    <View key={gIdx} style={styles.roadmapGoalSection}>
                                        <Text style={styles.roadmapGoalTitle}>{goalItem.goal}</Text>
                                        <View style={styles.roadmapList}>
                                            {(type === 'content' ? goalItem.content : goalItem.network).map((item, iIdx) => (
                                                <View key={iIdx} style={styles.roadmapItem}>
                                                    <View style={styles.roadmapBullet} />
                                                    <Text style={styles.roadmapContentText}>{item}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                                {(!profile?.ai_roadmap || profile.ai_roadmap.length === 0) && (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="sparkles-outline" size={48} color="rgba(255,255,255,0.1)" />
                                        <Text style={styles.emptyText}>No recommendations generated yet. Complete onboarding for your masterplan.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </SafeAreaView>
                    </BlurView>
                </View>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={['#0f172a', '#1c1917', '#451a03']}
                opacity={0.8}
            />

            <SafeAreaView style={styles.safe}>
                <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
                    <Text style={styles.headerTitle}>JOURNEY</Text>
                </Animated.View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Simple Hero */}
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.heroContainer}>
                        <Text style={styles.dayText}>Day {challengeDay}</Text>
                        <Text style={styles.durationText}>{challengeDuration} Day Challenge</Text>
                    </Animated.View>

                    {isChallengeComplete ? (
                        <Animated.View entering={FadeInDown.duration(800)} style={styles.sectionWrapper}>
                            <BlurView intensity={25} tint="dark" style={styles.glassCard}>
                                <View style={styles.completeContent}>
                                    <Ionicons name="medal-outline" size={40} color="#B45309" style={{ marginBottom: 16 }} />
                                    <Text style={styles.completeTitle}>Challenge Complete</Text>
                                    <Text style={styles.completeSubtitle}>You've successfully finished your {challengeDuration}-day sprint.</Text>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={styles.upgradeButton}
                                        onPress={() => startChallenge(30)}
                                    >
                                        <LinearGradient
                                            colors={['#fb923c', '#ea580c']}
                                            style={styles.upgradeGrad}
                                        >
                                            <Text style={styles.upgradeButtonText}>Start 30 Day Mastery</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </Animated.View>
                    ) : (
                        <>
                            {/* Progress Section */}
                            <Animated.View entering={FadeInDown.duration(800)} style={styles.sectionWrapper}>
                                <BlurView intensity={25} tint="dark" style={[styles.glassCard, { paddingVertical: 24 }]}>
                                    <View style={styles.progressHeader}>
                                        <Text style={styles.progressLabel}>PROGRESS</Text>
                                        <Text style={styles.progressValue}>{Math.round((challengeDay / challengeDuration) * 100)}%</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${(challengeDay / challengeDuration) * 100}%`, backgroundColor: '#B45309' }]} />
                                    </View>
                                </BlurView>
                            </Animated.View>

                            {/* Goals Section */}
                            {profile?.goals && profile.goals.length > 0 && (
                                <Animated.View entering={FadeInDown.duration(800)} style={styles.sectionWrapper}>
                                    <BlurView intensity={25} tint="dark" style={styles.glassCard}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardTitle}>Your Intentions</Text>
                                        </View>
                                        <View style={styles.goalsList}>
                                            {profile.goals.map((goal, index) => (
                                                <View key={index} style={styles.goalLine}>
                                                    <View style={[styles.goalBullet, { backgroundColor: '#B45309' }]} />
                                                    <Text style={styles.goalText}>{goal}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </BlurView>
                                </Animated.View>
                            )}

                            {/* Rituals List Card */}
                            <Animated.View entering={FadeInDown.duration(800)} style={styles.sectionWrapper}>
                                <BlurView intensity={25} tint="dark" style={styles.glassCard}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Daily Rituals</Text>
                                    </View>

                                    <RitualRow
                                        icon="flash-outline"
                                        label="Take Action Toward Your Goal"
                                        checked={manifestTasks.tookAction}
                                        onToggle={() => toggleManifestTask('tookAction')}
                                        showBorder={savedGoals.length === 0}
                                    />

                                    {/* Always-visible saved goals with checkboxes */}
                                    {savedGoals.length > 0 && (
                                        <View style={styles.savedGoalsSection}>
                                            {savedGoals.map((goal, idx) => (
                                                <Pressable
                                                    key={idx}
                                                    style={styles.savedGoalRow}
                                                    onPress={() => toggleGoalCheck(idx)}
                                                >
                                                    <View style={[
                                                        styles.subGoalCheckbox,
                                                        checkedGoals[idx] && styles.subGoalCheckboxChecked
                                                    ]}>
                                                        {checkedGoals[idx] && (
                                                            <Ionicons name="checkmark" size={10} color="#fff" />
                                                        )}
                                                    </View>
                                                    <Text style={[
                                                        styles.savedGoalText,
                                                        checkedGoals[idx] && styles.savedGoalTextChecked
                                                    ]}>{goal}</Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    )}
                                    <RitualRow
                                        icon="play-circle-outline"
                                        label="Watch Content Related to Your Goal"
                                        checked={manifestTasks.watchedContent}
                                        onToggle={() => toggleManifestTask('watchedContent')}
                                        onShowDetails={() => setRoadmapModal({ visible: true, type: 'content' })}
                                        hint="Tap to view recommendations"
                                    />
                                    <RitualRow
                                        icon="people-outline"
                                        label="Connect with People of Similar Mindset"
                                        checked={manifestTasks.connectedWithPeople}
                                        onToggle={() => toggleManifestTask('connectedWithPeople')}
                                        onShowDetails={() => setRoadmapModal({ visible: true, type: 'network' })}
                                        showBorder={false}
                                        hint="Tap to view recommendations"
                                    />
                                </BlurView>
                            </Animated.View>

                            <RoadmapModal />

                            {/* Manage Button */}
                            <Animated.View entering={FadeInDown.duration(800)} style={styles.manageWrapper}>
                                <TouchableOpacity
                                    onPress={() => router.push('/edit_profile')}
                                    style={styles.manageButton}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="settings-outline" size={16} color="rgba(255,255,255,0.4)" />
                                    <Text style={styles.manageButtonText}>Change Goals</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </>
                    )}

                    <Animated.View entering={FadeIn.duration(800)} style={styles.footer}>
                        <Text style={styles.footerText}>Keep the streak alive to manifest your goals.</Text>
                    </Animated.View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </SafeAreaView>

            <BottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    safe: { flex: 1 },
    header: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 3,
        paddingTop: 24,
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    heroContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    dayText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 32,
        color: '#fff',
        marginBottom: 4,
    },
    durationText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.3)',
    },
    sectionWrapper: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    glassCard: {
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        marginBottom: 12,
    },
    cardTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
    },
    progressValue: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: '#fff',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 3,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fb923c',
        borderRadius: 3,
    },
    ritualRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    ritualLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        paddingRight: 10,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -4,
    },
    iconContainerChecked: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    ritualLabel: {
        flex: 1,
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 20,
    },
    ritualLabelChecked: {
        color: 'rgba(255,255,255,0.3)',
        textDecorationLine: 'line-through',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#B45309',
        borderColor: '#B45309',
    },
    goalsList: {
        gap: 12,
    },
    goalLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    goalBullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#B45309',
    },
    goalText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        flex: 1,
    },
    manageWrapper: {
        alignItems: 'center',
        marginTop: 8,
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    manageButtonText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
    },
    completeContent: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    completeTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 22,
        color: '#fff',
        marginBottom: 8,
    },
    completeSubtitle: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    upgradeButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    upgradeGrad: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    upgradeButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 15,
        color: '#fff',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.2)',
        textAlign: 'center',
    },
    ritualViewAction: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 10,
        color: '#fb923c',
        marginTop: 4,
        opacity: 0.8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalBlur: {
        height: '80%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(5, 5, 10, 0.95)',
    },
    modalHeader: {
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    closeButton: {
        marginBottom: 16,
        padding: 4,
    },
    modalTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 18,
        color: '#fff',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
    },
    modalScroll: {
        flex: 1,
    },
    modalScrollContent: {
        padding: 24,
    },
    roadmapGoalSection: {
        marginBottom: 32,
    },
    roadmapGoalTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: '#B45309',
        marginBottom: 16,
        letterSpacing: 1,
    },
    roadmapList: {
        gap: 16,
    },
    roadmapItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    roadmapBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#B45309',
        marginTop: 6,
    },
    roadmapContentText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        color: '#fff',
        lineHeight: 20,
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    savedGoalsSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    savedGoalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
    },
    subGoalCheckbox: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subGoalCheckboxChecked: {
        backgroundColor: '#F59E0B',
        borderColor: '#F59E0B',
    },
    savedGoalText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        flex: 1,
        lineHeight: 19,
    },
    savedGoalTextChecked: {
        color: 'rgba(255,255,255,0.25)',
        textDecorationLine: 'line-through',
    },
});
