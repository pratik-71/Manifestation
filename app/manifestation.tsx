import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated as RNAnimated,
    Dimensions,
    Easing,
    Image,
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

// Helper for local date YYYY-MM-DD
const getLocalDateString = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function ManifestHub() {
    const router = useRouter();
    const {
        profile,
        fetchProfile,
        manifestTasks,
        toggleManifestTask,
        startChallenge,
        completeTaskDay,
        resetChallenge,
        clearManifestTasks,
    } = useUserStore();

    const challengeDay = profile?.challenge_day ?? 1;
    const challengeDuration = profile?.challenge_duration || 7;
    const isChallengeComplete = profile?.is_challenge_complete || false;
    const streakCount = profile?.streak_count ?? 0;
    const username = profile?.username || 'Seeker';

    // Completed days = days where user fully finished all rituals (day starts at 1 = 0 completed)
    const completedDays = Math.max(0, challengeDay - 1);
    const progressPct = challengeDuration > 0 ? (completedDays / challengeDuration) * 100 : 0;

    // Failure detection: last_manifest_date exists, challenge is active, and last completed day was >1 calendar day ago
    const hasFailed = (() => {
        if (!profile || isChallengeComplete || !profile.last_manifest_date) return false;
        const lastDate = new Date(profile.last_manifest_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        return diffDays > 1; // missed more than 1 day
    })();

    // Animated streak counter
    const [displayedStreak, setDisplayedStreak] = useState(0);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const flamePulse = useRef(new RNAnimated.Value(1)).current;
    const streakAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch profile if not loaded yet (direct navigation to this screen)
    useEffect(() => {
        const init = async () => {
            const { getCurrentUser } = await import('../services/authService');
            const user = await getCurrentUser();
            if (user) {
                if (!profile) {
                    await fetchProfile(user.id);
                }
            } else {
                router.replace('/onboarding/google_signin');
            }
        };
        init();
    }, []);

    // Animate streak count up when profile loads / changes
    useEffect(() => {
        const target = streakCount;
        if (target === 0) { setDisplayedStreak(0); return; }

        let current = 0;
        if (streakAnimRef.current) clearInterval(streakAnimRef.current);

        const step = Math.ceil(target / 20);
        streakAnimRef.current = setInterval(() => {
            current = Math.min(current + step, target);
            setDisplayedStreak(current);
            if (current >= target) {
                clearInterval(streakAnimRef.current!);
                streakAnimRef.current = null;
            }
        }, 40);

        return () => {
            if (streakAnimRef.current) clearInterval(streakAnimRef.current);
        };
    }, [streakCount]);

    // Flame pulse when streak > 0
    useEffect(() => {
        if (streakCount > 0) {
            RNAnimated.loop(
                RNAnimated.sequence([
                    RNAnimated.timing(flamePulse, { toValue: 1.3, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    RNAnimated.timing(flamePulse, { toValue: 1.0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            ).start();
        } else {
            flamePulse.setValue(1);
        }
    }, [streakCount]);

    useEffect(() => {
        const allTasksDone = manifestTasks.tookAction &&
            manifestTasks.watchedContent &&
            manifestTasks.connectedWithPeople;

        const todayStr = getLocalDateString();
        const isAlreadyDoneToday = profile?.last_manifest_date === todayStr;

        if (allTasksDone && !isAlreadyDoneToday) {
            completeTaskDay();
        }
    }, [manifestTasks, profile?.last_manifest_date]);

    // Reset local checked goals if day has changed
    useEffect(() => {
        const todayStr = getLocalDateString();
        // If the user hasn't finished today yet, ensure tasks are cleared if they were from a previous day
        if (profile?.last_manifest_date !== todayStr) {
            setCheckedGoals({});
            clearManifestTasks();
        }
    }, [profile?.last_manifest_date]);


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

    // Auto-sync 'Take Action' with sub-goals
    useEffect(() => {
        if (savedGoals.length > 0) {
            const allChecked = savedGoals.every((_, idx) => checkedGoals[idx]);
            if (allChecked !== manifestTasks.tookAction) {
                toggleManifestTask('tookAction');
            }
        }
    }, [checkedGoals, savedGoals, manifestTasks.tookAction]);

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



    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={['#0f172a', '#1c1917', '#451a03']}
                opacity={0.8}
            />

            <SafeAreaView style={styles.safe}>
                <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
                    <View style={styles.headerRow}>
                        {/* Header Branding */}
                        <View style={styles.headerBranding}>
                            <Image
                                source={require('../assets/logo.png')}
                                style={styles.headerLogo}
                                resizeMode="contain"
                            />
                            <Text style={styles.greetingText}>Hello, {profile?.username || 'Seeker'} </Text>
                        </View>
                        {/* Streak Badge */}
                        <View style={styles.streakBadge}>
                            <RNAnimated.View style={{ transform: [{ scale: flamePulse }] }}>
                                <Ionicons name="flame" size={16} color={displayedStreak > 0 ? '#f97316' : '#B45309'} />
                            </RNAnimated.View>
                            <Text style={styles.streakBadgeText}>{displayedStreak}</Text>
                        </View>
                    </View>
                </Animated.View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Hero: Completed Days */}
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.heroContainer}>
                        <Text style={styles.dayText}>
                            {isChallengeComplete ? '🏆' : hasFailed ? '💔' : `Day ${completedDays + 1}`}
                        </Text>
                        <Text style={styles.durationText}>
                            {isChallengeComplete
                                ? `${challengeDuration}-Day Challenge Complete!`
                                : hasFailed
                                    ? `Failed on Day ${completedDays + 1} of ${challengeDuration}`
                                    : `${completedDays} of ${challengeDuration} days done`}
                        </Text>
                    </Animated.View>

                    {/* ── CHALLENGE COMPLETE ── */}
                    {isChallengeComplete ? (
                        <Animated.View entering={FadeInDown.duration(800)} style={styles.sectionWrapper}>
                            <BlurView intensity={25} tint="dark" style={styles.glassCard}>
                                <View style={styles.completeContent}>
                                    <Ionicons name="medal-outline" size={40} color="#B45309" style={{ marginBottom: 16 }} />
                                    <Text style={styles.completeTitle}>Challenge Complete! 🏆</Text>
                                    <Text style={styles.completeSubtitle}>You've fully completed your {challengeDuration}-day sprint. Great job on staying committed!</Text>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={styles.upgradeButton}
                                        onPress={() => startChallenge(30)}
                                    >
                                        <LinearGradient
                                            colors={['#fb923c', '#ea580c']}
                                            style={styles.upgradeGrad}
                                        >
                                            <Text style={styles.upgradeButtonText}>Start 30 Day Mastery 🚀</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </Animated.View>

                    ) : hasFailed ? (
                        /* ── FAILED STATE ── */
                        <Animated.View entering={FadeInDown.duration(800)} style={styles.sectionWrapper}>
                            <BlurView intensity={25} tint="dark" style={styles.glassCard}>
                                <View style={styles.completeContent}>
                                    <Text style={styles.failEmoji}>💔</Text>
                                    <Text style={styles.failTitle}>You Broke the Chain</Text>
                                    <Text style={styles.failSubtitle}>
                                        You made it to Day {completedDays + 1} — that's real progress, {username}. Every day is a new chance to succeed. Champions fall and rise. Your comeback starts now.
                                    </Text>

                                    <View style={styles.failStatsRow}>
                                        <View style={styles.failStat}>
                                            <Text style={styles.failStatNum}>{completedDays}</Text>
                                            <Text style={styles.failStatLabel}>Days Done</Text>
                                        </View>
                                        <View style={styles.failStatDivider} />
                                        <View style={styles.failStat}>
                                            <Text style={styles.failStatNum}>{challengeDuration - completedDays}</Text>
                                            <Text style={styles.failStatLabel}>Days Left</Text>
                                        </View>
                                        <View style={styles.failStatDivider} />
                                        <View style={styles.failStat}>
                                            <Text style={styles.failStatNum}>{Math.round(progressPct)}%</Text>
                                            <Text style={styles.failStatLabel}>Reached</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={styles.upgradeButton}
                                        onPress={() => resetChallenge()}
                                    >
                                        <LinearGradient
                                            colors={['#f43f5e', '#e11d48']}
                                            style={styles.upgradeGrad}
                                        >
                                            <Text style={styles.upgradeButtonText}>Rise Again — Start Over 🔥</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => startChallenge(challengeDuration)}
                                        style={styles.ghostRetryBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.ghostRetryText}>Try a Different Duration</Text>
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </Animated.View>

                    ) : (
                        /* ── ACTIVE CHALLENGE ── */
                        <>
                            {/* Progress Section */}
                            <Animated.View entering={FadeInDown.duration(800)} style={styles.sectionWrapper}>
                                <BlurView intensity={25} tint="dark" style={[styles.glassCard, { paddingVertical: 24 }]}>
                                    <View style={styles.progressHeader}>
                                        <Text style={styles.progressLabel}>PROGRESS — {completedDays}/{challengeDuration} DAYS</Text>
                                        <Text style={styles.progressValue}>{Math.round(progressPct)}%</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                                    </View>
                                    {completedDays === 0 && (
                                        <Text style={styles.progressHint}>Complete today's rituals below to mark Day 1 ✓</Text>
                                    )}
                                </BlurView>
                            </Animated.View>

                        
                            {/* Rituals List Card */}
                            <Animated.View entering={FadeInDown.duration(800)} style={styles.sectionWrapper}>
                                <BlurView intensity={25} tint="dark" style={styles.glassCard}>
                                    <View style={[styles.cardHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                        <Text style={styles.cardTitle}>Daily Rituals</Text>
                                        {profile?.last_manifest_date === getLocalDateString() && (
                                            <View style={styles.doneBadge}>
                                                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                                                <Text style={styles.doneBadgeText}>DONE TODAY</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={profile?.last_manifest_date === getLocalDateString() ? { opacity: 0.6 } : null} pointerEvents={profile?.last_manifest_date === getLocalDateString() ? 'none' : 'auto'}>
                                        <RitualRow
                                            icon="flash-outline"
                                            label="Take Action Toward Your Goal"
                                            checked={manifestTasks.tookAction || profile?.last_manifest_date === getLocalDateString()}
                                            onToggle={savedGoals.length > 0 ? null : () => toggleManifestTask('tookAction')}
                                            showBorder={savedGoals.length === 0}
                                            hint={savedGoals.length > 0 ? "Mark all sub-goals below to complete" : null}
                                        />

                                        {/* Always-visible saved goals with checkboxes */}
                                        {savedGoals.length > 0 && (
                                            <View style={styles.savedGoalsSection}>
                                                {savedGoals.map((goal, idx) => {
                                                    const isDoneToday = profile?.last_manifest_date === getLocalDateString();
                                                    return (
                                                        <Pressable
                                                            key={idx}
                                                            style={styles.savedGoalRow}
                                                            onPress={() => toggleGoalCheck(idx)}
                                                            disabled={isDoneToday}
                                                        >
                                                            <View style={[
                                                                styles.subGoalCheckbox,
                                                                (checkedGoals[idx] || isDoneToday) && styles.subGoalCheckboxChecked
                                                            ]}>
                                                                {(checkedGoals[idx] || isDoneToday) && (
                                                                    <Ionicons name="checkmark" size={10} color="#fff" />
                                                                )}
                                                            </View>
                                                            <Text style={[
                                                                styles.savedGoalText,
                                                                (checkedGoals[idx] || isDoneToday) && styles.savedGoalTextChecked
                                                            ]}>{goal}</Text>
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>
                                        )}
                                        <RitualRow
                                            icon="play-circle-outline"
                                            label="Watch Content Related to Your Goal"
                                            checked={manifestTasks.watchedContent || profile?.last_manifest_date === getLocalDateString()}
                                            onToggle={() => toggleManifestTask('watchedContent')}
                                        />
                                        <RitualRow
                                            icon="people-outline"
                                            label="Connect with People of Similar Mindset"
                                            checked={manifestTasks.connectedWithPeople || profile?.last_manifest_date === getLocalDateString()}
                                            onToggle={() => toggleManifestTask('connectedWithPeople')}
                                            showBorder={false}
                                        />

                                        <TouchableOpacity 
                                            style={styles.detailsBtn} 
                                            onPress={() => setIsDetailsVisible(true)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.detailsBtnText}>View Full Roadmap</Text>
                                            <Ionicons name="apps-outline" size={14} color="#fb923c" />
                                        </TouchableOpacity>
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


                            
                            {/* Manage Button */}
                            <Animated.View entering={FadeInDown.duration(800)} style={styles.manageWrapper}>
                                <TouchableOpacity
                                    onPress={() => router.push('/onboarding/goals')}
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

            <Modal
                visible={isDetailsVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsDetailsVisible(false)}
            >
                <View style={styles.detailsModalRoot}>
                    <BreathingBackground
                        colors={['#020617', '#0f172a', '#1e1b4b']}
                        opacity={1}
                    />
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity 
                                onPress={() => setIsDetailsVisible(false)}
                                style={styles.modalCloseBtn}
                            >
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>YOUR ROADMAP</Text>
                            <View style={{ width: 44 }} />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                            {/* Intentions Section */}
                            <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.modalSection}>
                                <View style={styles.sectionHeaderRow}>
                                    <View style={[styles.sectionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                        <Ionicons name="flame" size={12} color="#F59E0B" />
                                    </View>
                                    <Text style={[styles.modalSectionLabel, { color: '#F59E0B' }]}>CORE INTENTIONS</Text>
                                </View>
                                <BlurView intensity={20} tint="dark" style={styles.modalGlassCard}>
                                    {profile?.goals && profile.goals.length > 0 ? (
                                        profile.goals.map((goal, idx) => (
                                            <View key={idx} style={[styles.modalItem, idx === profile.goals!.length - 1 && { borderBottomWidth: 0 }]}>
                                                <View style={styles.modalBullet} />
                                                <Text style={styles.modalItemText}>{goal}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.emptyText}>No intentions set yet.</Text>
                                    )}
                                </BlurView>
                            </Animated.View>

                            {/* AI Roadmap Section */}
                            {profile?.ai_roadmap && profile.ai_roadmap.length > 0 && profile.ai_roadmap.map((plan, planIdx) => (
                                <Animated.View key={planIdx} entering={FadeInDown.delay(200 + planIdx * 100).duration(600)} style={styles.modalSection}>
                                    <View style={styles.sectionHeaderRow}>
                                        <View style={[styles.sectionIcon, { backgroundColor: 'rgba(251, 146, 60, 0.1)' }]}>
                                            <Ionicons name="compass" size={12} color="#fb923c" />
                                        </View>
                                        <Text style={[styles.modalSectionLabel, { color: '#fb923c' }]}>STRATEGY: {plan.goal.toUpperCase()}</Text>
                                    </View>
                                    
                                    <View style={styles.subSection}>
                                        <View style={styles.subSectionHeader}>
                                            <Ionicons name="play-circle" size={16} color="#10b981" />
                                            <Text style={[styles.subSectionTitle, { color: '#10b981' }]}>Content & Learning</Text>
                                        </View>
                                        <BlurView intensity={15} tint="dark" style={styles.modalGlassCard}>
                                            {plan.content.map((item, idx) => (
                                                <View key={idx} style={[styles.modalItem, idx === plan.content.length - 1 && { borderBottomWidth: 0 }]}>
                                                    <Ionicons name="book-outline" size={14} color="rgba(255,255,255,0.4)" style={{ marginRight: 12 }} />
                                                    <Text style={styles.modalSubItemText}>{item}</Text>
                                                </View>
                                            ))}
                                        </BlurView>
                                    </View>

                                    <View style={styles.subSection}>
                                        <View style={styles.subSectionHeader}>
                                            <Ionicons name="people" size={16} color="#8b5cf6" />
                                            <Text style={[styles.subSectionTitle, { color: '#8b5cf6' }]}>Networking & Support</Text>
                                        </View>
                                        <BlurView intensity={15} tint="dark" style={styles.modalGlassCard}>
                                            {plan.network.map((item, idx) => (
                                                <View key={idx} style={[styles.modalItem, idx === plan.network.length - 1 && { borderBottomWidth: 0 }]}>
                                                    <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.4)" style={{ marginRight: 12 }} />
                                                    <Text style={styles.modalSubItemText}>{item}</Text>
                                                </View>
                                            ))}
                                        </BlurView>
                                    </View>
                                </Animated.View>
                            ))}

                            <View style={{ height: 60 }} />
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>

            <BottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    safe: { flex: 1 },
    header: {
        paddingTop: 16,
        paddingBottom: 8,
        paddingHorizontal: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 4,
    },
    headerBranding: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerLogo: {
        width: 28,
        height: 28,
    },
    greetingText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#f8fafc',
    },
    headerGreeting: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 2,
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.25)',
        gap: 5,
    },
    streakBadgeText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 11,
        color: '#B45309',
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
    progressHint: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        marginTop: 10,
        textAlign: 'center',
    },
    // Failure card styles
    failEmoji: {
        fontSize: 48,
        marginBottom: 12,
        textAlign: 'center',
    },
    failTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 22,
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
    failSubtitle: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    failStatsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 12,
        width: '100%',
        gap: 0,
    },
    failStat: {
        flex: 1,
        alignItems: 'center',
    },
    failStatNum: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#f43f5e',
        marginBottom: 4,
    },
    failStatLabel: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    failStatDivider: {
        width: 1,
        height: 36,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    ghostRetryBtn: {
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    ghostRetryText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        textDecorationLine: 'underline',
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
    doneBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    doneBadgeText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 9,
        color: '#10b981',
        letterSpacing: 0.5,
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,146,60,0.1)',
    },
    detailsBtnText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 11,
        color: '#fb923c',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Modal Styles
    detailsModalRoot: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    modalCloseBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: '#fff',
        letterSpacing: 3,
    },
    modalScroll: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    modalSection: {
        marginBottom: 32,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        marginLeft: 4,
    },
    sectionIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSectionLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 2,
    },
    modalGlassCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 4,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    modalBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fb923c',
        marginRight: 16,
    },
    modalItemText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: '#fff',
        flex: 1,
        lineHeight: 20,
    },
    subSection: {
        marginTop: 20,
    },
    subSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        marginLeft: 4,
    },
    subSectionTitle: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    modalSubItemText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        flex: 1,
        lineHeight: 18,
    },
    emptyText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        paddingVertical: 20,
    },
});
