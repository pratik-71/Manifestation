import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { BottomBar } from '../components/BottomBar';
import { useUserStore } from '../store/userStore';

const { width } = Dimensions.get('window');

export default function ManifestHub() {
    const router = useRouter();
    const {
        challengeDay,
        challengeDuration,
        isChallengeComplete,
        manifestTasks,
        toggleManifestTask,
        checkAndResetDaily,
        startChallenge
    } = useUserStore();

    useEffect(() => {
        checkAndResetDaily();
    }, []);

    const tasks = [
        {
            id: 'tookAction',
            label: 'Take action for your goal',
            icon: 'flash-outline',
            color: '#10b981', // Emerald
            checked: manifestTasks.tookAction
        },
        {
            id: 'watchedContent',
            label: 'Watch content for your goal',
            icon: 'play-circle-outline',
            color: '#3b82f6', // Blue
            checked: manifestTasks.watchedContent
        },
        {
            id: 'connectedWithPeople',
            label: 'Connect with people for your goal',
            icon: 'people-outline',
            color: '#8b5cf6', // Violet
            checked: manifestTasks.connectedWithPeople
        },
    ];

    const renderProgress = () => {
        const progress = challengeDay / challengeDuration;
        return (
            <View style={styles.progressContainer}>
                <View style={styles.progressBarWrapper}>
                    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
                <View style={styles.progressTextRow}>
                    <Text style={styles.progressText}>Progress</Text>
                    <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#09090b' }]} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Daily Rituals</Text>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{challengeDay}</Text>
                            <Text style={styles.statLabel}>Day</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{challengeDuration}</Text>
                            <Text style={styles.statLabel}>Target</Text>
                        </View>
                    </View>
                </View>

                {isChallengeComplete ? (
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.completeCard}>
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 78, 59, 0.1)']}
                            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                        />
                        <Ionicons name="medal-outline" size={48} color="#10b981" style={{ alignSelf: 'center', marginBottom: 16 }} />
                        <Text style={styles.completeTitle}>Tier 1 Mastery!</Text>
                        <Text style={styles.completeSubtitle}>You've completed your 7-day sprint. Ready for the ultimate challenge?</Text>

                        <TouchableOpacity
                            style={styles.upgradeButton}
                            onPress={() => startChallenge(30)}
                        >
                            <Text style={styles.upgradeButtonText}>Start 30-Day Mastery</Text>
                            <Ionicons name="arrow-forward" size={18} color="#000" />
                        </TouchableOpacity>
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.challengeCard}>
                        <View style={styles.challengeHeader}>
                            <Text style={styles.challengeTitle}>{challengeDuration}-Day Challenge</Text>
                            <View style={styles.dayBadge}>
                                <Text style={styles.dayBadgeText}>DAY {challengeDay}</Text>
                            </View>
                        </View>

                        {renderProgress()}

                        <View style={styles.ritualContainer}>
                            {tasks.map((task, index) => (
                                <Animated.View
                                    key={task.id}
                                    entering={FadeInRight.delay(index * 100).duration(600)}
                                    style={styles.ritualItem}
                                >
                                    <TouchableOpacity
                                        style={[styles.checkbox, task.checked && { backgroundColor: task.color, borderColor: task.color }]}
                                        onPress={() => toggleManifestTask(task.id as any)}
                                    >
                                        {task.checked && <Ionicons name="checkmark" size={12} color="#fff" />}
                                    </TouchableOpacity>
                                    <View style={styles.ritualTextContent}>
                                        <Text style={[styles.ritualLabel, task.checked && styles.ritualLabelChecked]}>
                                            {task.label}
                                        </Text>
                                        <View style={[styles.taskIndicator, { backgroundColor: task.color + '20' }]}>
                                            <Ionicons name={task.icon as any} size={10} color={task.color} />
                                            <Text style={[styles.taskIndicatorText, { color: task.color }]}>DAILY</Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                <View style={styles.footerInfo}>
                    <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.footerInfoText}>
                        Your progress resets if you miss a daily ritual. Keep the streak alive.
                    </Text>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <BottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090b',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greeting: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#fff',
    },
    statLabel: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
    },
    challengeCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
        marginBottom: 24,
    },
    challengeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    challengeTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 18,
        color: '#fff',
    },
    dayBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    dayBadgeText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
        color: '#3b82f6',
    },
    progressContainer: {
        marginBottom: 32,
    },
    progressBarWrapper: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: 3,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
    },
    ritualContainer: {
        gap: 20,
    },
    ritualItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    ritualTextContent: {
        flex: 1,
    },
    ritualLabel: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    ritualLabelChecked: {
        color: 'rgba(255,255,255,0.3)',
        textDecorationLine: 'line-through',
    },
    taskIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    taskIndicatorText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 8,
        letterSpacing: 1,
    },
    completeCard: {
        padding: 32,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        marginBottom: 24,
        overflow: 'hidden',
    },
    completeTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 22,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    completeSubtitle: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    upgradeButton: {
        backgroundColor: '#10b981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 20,
        gap: 10,
    },
    upgradeButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#000',
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        gap: 10,
    },
    footerInfoText: {
        flex: 1,
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        lineHeight: 18,
    }
});
