import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeInRight, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BreathingBackground } from '../components/BreathingBackground';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const RaiseFrequency = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [guideVisible, setGuideVisible] = useState(false);
    const [selectedGuideSection, setSelectedGuideSection] = useState<'what' | 'affect' | 'how' | null>(null);

    const practices = [
        {
            title: 'Resonance Tuning',
            description: 'Align with the divine geometry of sound (432Hz).',
            icon: 'musical-note',
            color: '#f97316', 
        },
        {
            title: 'Vital Fuel',
            description: 'Sun-grown, living nutrition for peak cell energy.',
            icon: 'leaf',
            color: '#D97706',
        },
        {
            title: 'Gratitude State',
            description: 'The instant shift from lack to abundance.',
            icon: 'heart',
            color: '#B45309',
        },
        {
            title: 'Etheric Flow',
            description: 'Movement that clears stagnant energy fields.',
            icon: 'sparkles',
            color: '#f97316',
        },
    ];

    const exercises = [
        {
            title: 'The Resonance Box',
            instruction: '4s Inhale • 4s Hold • 4s Exhale • 4s Hold.',
            icon: 'apps',
            color: '#D97706',
        },
        {
            title: 'Vocal Alignment',
            instruction: 'Primal humming to sync internal frequencies.',
            icon: 'mic',
            color: '#B45309',
        },
        {
            title: 'Kinetic Shake',
            instruction: 'Shake the body to instantly release trapped energy.',
            icon: 'pulse',
            color: '#f97316',
        },
    ];

    const renderGuideContent = () => {
        const StepCard = ({ icon, title, text, color }: { icon: any; title: string; text: string; color?: string }) => (
            <Animated.View entering={FadeInUp.duration(600)} style={styles.stepCardContainer}>
                <View style={styles.stepCardHeader}>
                    <View style={[styles.stepIconCircle, { backgroundColor: color ? `${color}15` : 'rgba(217, 119, 6, 0.1)' }]}>
                        <Ionicons name={icon} size={20} color={color || "#D97706"} />
                    </View>
                    <Text style={styles.stepCardTitle}>{title}</Text>
                </View>
                <Text style={styles.stepCardText}>{text}</Text>
            </Animated.View>
        );

        switch (selectedGuideSection) {
            case 'what':
                return (
                    <View style={styles.guideTextContainer}>
                        <Text style={styles.guideSubTitle}>What is Frequency?</Text>
                        
                        <StepCard 
                            icon="wifi"
                            title="Your Invisible Vibe"
                            text="Think of your body like a radio tower. You are always sending out a signal to everyone around you. Other people don't just see you; they literally feel your energy even before you say hello." 
                        />

                        <StepCard 
                            icon="flash"
                            title="The Power of Presence"
                            text="Have you ever noticed how some people walk into a room and the whole mood shifts? That's not magic—it's high frequency. When your vibe is high, you naturally lift everyone in your circle." 
                        />
                        
                        <StepCard 
                            icon="radio"
                            title="The Tuning Dial"
                            text="Life works just like a radio. If you're tuned to a 'stress' frequency, you'll only find more stress. To change what life gives you, you have to turn the dial and change your broadcast first." 
                        />

                        <TouchableOpacity 
                            style={styles.continueButton} 
                            activeOpacity={0.7}
                            onPress={() => setSelectedGuideSection('affect')}
                        >
                            <Text style={styles.continueText}>See The Impact</Text>
                            <Ionicons name="arrow-forward" size={16} color="#D97706" />
                        </TouchableOpacity>
                    </View>
                );
            case 'affect':
                return (
                    <View style={styles.guideTextContainer}>
                        <Text style={styles.guideSubTitle}>How it Affects Life</Text>
                        
                        <Text style={styles.impactIntro}>Your frequency is your vibe. It changes how your day goes.</Text>

                        <View style={styles.comparisonGrid}>
                            <View style={[styles.comparisonCard, { borderColor: 'rgba(217, 119, 6, 0.2)' }]}>
                                <View style={styles.comparisonHeader}>
                                    <Ionicons name="sunny" size={20} color="#D97706" />
                                    <Text style={styles.comparisonTitle}>HIGH VIBE</Text>
                                </View>
                                <Text style={styles.comparisonSubTitle}>Good Days</Text>
                                <Text style={styles.comparisonText}>
                                    • You feel clear and focused{"\n"}• Good people want to be around you{"\n"}• You get lucky chances{"\n"}• Life feels easy and fun
                                </Text>
                            </View>

                            <View style={[styles.comparisonCard, { borderColor: 'rgba(180, 83, 9, 0.1)' }]}>
                                <View style={styles.comparisonHeader}>
                                    <Ionicons name="cloudy-night" size={20} color="rgba(255,255,255,0.4)" />
                                    <Text style={[styles.comparisonTitle, { color: 'rgba(255,255,255,0.4)' }]}>LOW VIBE</Text>
                                </View>
                                <Text style={styles.comparisonSubTitle}>Bad Days</Text>
                                <Text style={styles.comparisonText}>
                                    • You feel tired and confused{"\n"}• You deal with drama and mean people{"\n"}• Things keep going wrong or taking too long{"\n"}• Life feels hard and stuck
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.continueButton} 
                            activeOpacity={0.7}
                            onPress={() => setSelectedGuideSection('how')}
                        >
                            <Text style={styles.continueText}>How to Increase</Text>
                            <Ionicons name="arrow-forward" size={16} color="#D97706" />
                        </TouchableOpacity>
                    </View>
                );
            case 'how':
                return (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
                        <Text style={styles.guideSubTitle}>How to Increase It</Text>
                        
                        <View style={[styles.alchemySection, { borderColor: '#D9770640' }]}>
                            <View style={styles.alchemyHeader}>
                                <View style={styles.stepIconCircle}>
                                    <Ionicons name="nutrition" size={20} color="#D97706" />
                                </View>
                                <Text style={styles.alchemyLabel}>01. BETTER FOOD</Text>
                            </View>
                            <Text style={styles.guideBody}>Think of your energy like a battery. <Text style={{ color: '#D97706', fontFamily: 'Comfortaa_700Bold' }}>Junk food drains your battery.</Text> Your body uses all its energy to process bad food instead of keeping your vibe high. Eat more fruits and greens.</Text>
                        </View>

                        <View style={styles.alchemySection}>
                            <View style={styles.alchemyHeader}>
                                <View style={styles.stepIconCircle}>
                                    <Ionicons name="alarm" size={20} color="#D97706" />
                                </View>
                                <Text style={styles.alchemyLabel}>02. NO PHONE IN MORNING</Text>
                            </View>
                            <Text style={styles.guideBody}>When you start your day looking at your phone, you let other people control your mood. Spend the first 15 minutes of your day without your phone. Drink water or stretch instead.</Text>
                        </View>

                        <View style={styles.alchemySection}>
                            <View style={styles.alchemyHeader}>
                                <View style={styles.stepIconCircle}>
                                    <Ionicons name="ban" size={20} color="rgba(255,255,255,0.4)" />
                                </View>
                                <Text style={styles.alchemyLabel}>03. THINGS TO AVOID</Text>
                            </View>
                            <Text style={styles.guideBody}>Avoid watching bad news, gossiping, and being around angry people. These things will drain your good energy instantly.</Text>
                        </View>

                        <View style={styles.alchemySection}>
                            <View style={styles.alchemyHeader}>
                                <View style={styles.stepIconCircle}>
                                    <Ionicons name="heart" size={20} color="#D97706" />
                                </View>
                                <Text style={styles.alchemyLabel}>04. BE THANKFUL</Text>
                            </View>
                            <View style={styles.insightBox}>
                                <Text style={styles.insightText}>
                                    Saying "Thank You" is the fastest way to feel better. You can't be scared or angry when you are thankful. Just find one small thing to be happy about right now.
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.finishStudyButton} 
                            activeOpacity={0.7}
                            onPress={() => setGuideVisible(false)}
                        >
                            <Text style={styles.finishStudyText}>I AM READY</Text>
                        </TouchableOpacity>
                    </ScrollView>
                );
            default:
                return (
                    <View style={styles.guideMenu}>
                        <Text style={styles.guideMenuTitle}>Learn Frequency</Text>
                        <Text style={styles.guideMenuSub}>3 steps to feel better and attract good things.</Text>
                        
                        <View style={styles.menuItemsList}>
                            {[
                                { id: 'what', title: '01 What is Frequency', sub: 'Learn the basics', icon: 'sparkles' },
                                { id: 'affect', title: '02 How it Affects Life', sub: 'See how it changes your day', icon: 'sync' },
                                { id: 'how', title: '03 How to Increase', sub: 'Simple habits to raise it', icon: 'flask' }
                            ].map((item) => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    activeOpacity={0.7}
                                    style={styles.menuItemClean} 
                                    onPress={() => setSelectedGuideSection(item.id as any)}
                                >
                                    <View style={styles.menuIconBox}>
                                        <Ionicons name={item.icon as any} size={20} color="#D97706" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                                        <Text style={styles.menuItemSubText}>{item.sub}</Text>
                                    </View>
                                    <View style={styles.menuArrow}>
                                        <Ionicons name="chevron-forward" size={14} color="#D97706" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <BreathingBackground
                colors={['#0f172a', '#1c1917', '#451a03']} // Deep Navy -> Dark Brown -> Mocha
                opacity={0.8}
            />

            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Resonance</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.heroSection}>
                        <Text style={styles.heroTitle}>Master Your Frequency</Text>
                        <Text style={styles.heroSubtitle}>
                            The world is a mirror. It doesn't give you what you want; it gives you who you are at an energetic level.
                        </Text>
                    </Animated.View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Increase Frequency</Text>
                        <View style={styles.sectionHighlight} />
                    </View>

                    <Text style={{ fontFamily: 'Comfortaa_700Bold', color: '#D97706', marginBottom: 12, marginLeft: 4, opacity: 0.8, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>3 Exercises</Text>

                    <View style={styles.actionsGrid}>
                        <View style={styles.actionsRow}>
                            <Animated.View entering={FadeInUp.delay(200)} style={styles.halfWidthCard}>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => router.push('/breathing' as any)}
                                    style={[styles.actionCardGrid, { borderColor: exercises[0].color + '40' }]}
                                >
                                    <View style={[styles.iconCircleSmall, { backgroundColor: exercises[0].color + '10' }]}>
                                        <Ionicons name={exercises[0].icon as any} size={20} color={exercises[0].color} />
                                    </View>
                                    <Text style={styles.cardTitleGrid}>Breathing</Text>
                                </TouchableOpacity>
                            </Animated.View>

                            <Animated.View entering={FadeInUp.delay(300)} style={styles.halfWidthCard}>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => router.push('/vocal' as any)}
                                    style={[styles.actionCardGrid, { borderColor: exercises[1].color + '40' }]}
                                >
                                    <View style={[styles.iconCircleSmall, { backgroundColor: exercises[1].color + '10' }]}>
                                        <Ionicons name={exercises[1].icon as any} size={20} color={exercises[1].color} />
                                    </View>
                                    <Text style={styles.cardTitleGrid}>Vocal</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>

                        <Animated.View entering={FadeInUp.delay(400)}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => router.push('/kinetic' as any)}
                                style={[styles.actionCardHorizontal, { borderColor: exercises[2].color + '40' }]}
                            >
                                <View style={[styles.iconCircleSmall, { backgroundColor: exercises[2].color + '10', marginBottom: 0, marginRight: 16 }]}>
                                    <Ionicons name={exercises[2].icon as any} size={20} color={exercises[2].color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.cardTitleGrid, { textAlign: 'left' }]}>{exercises[2].title}</Text>
                                    <Text style={{ fontFamily: 'Comfortaa_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{exercises[2].instruction}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    <View style={[styles.sectionHeader, { marginTop: 32 }]}>
                        <Text style={styles.sectionTitle}>What is Frequency?</Text>
                        <View style={styles.sectionHighlight} />
                    </View>

                    <Animated.View entering={FadeInUp.delay(500)}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => setGuideVisible(true)}
                            style={[styles.studyFlowButton, { padding: 8 }]}
                        >
                            <LinearGradient
                                colors={['rgba(217, 119, 6, 0.1)', 'rgba(217, 119, 6, 0.02)']}
                                style={styles.studyFlowGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.studyIconCircle}>
                                    <Ionicons name="book" size={24} color="#D97706" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.studyFlowText}>Read The Guide</Text>
                                    <Text style={styles.studyFlowSub}>3 simple steps to understand energy.</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(217, 119, 6, 0.5)" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </View>

            {/* Guide Modal */}
            <Modal
                visible={guideVisible}
                transparent
                animationType="slide"
                statusBarTranslucent
                onRequestClose={() => {
                    if (selectedGuideSection) setSelectedGuideSection(null);
                    else setGuideVisible(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
                    
                    <Animated.View entering={FadeInUp} style={styles.fullScreenModalContent}>
                        <View style={[styles.modalHeader, { paddingTop: insets.top + 10 }]}>
                            {selectedGuideSection && (
                                <TouchableOpacity onPress={() => setSelectedGuideSection(null)}>
                                    <View style={styles.modalBackButton}>
                                        <Ionicons name="chevron-back" size={20} color="white" />
                                    </View>
                                </TouchableOpacity>
                            )}
                            <Text style={styles.modalTitle}>Vibrational Mastery</Text>
                            <TouchableOpacity onPress={() => setGuideVisible(false)}>
                                <View style={styles.modalCloseButton}>
                                    <Ionicons name="close" size={20} color="white" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                            {renderGuideContent()}
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        height: 60,
    },
    backButton: {
        width: 24,
        height: 24,
       
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
       
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'white',
        letterSpacing: 4,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 60,
    },
    heroSection: {
        marginBottom: 28,
        alignItems: 'center',
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(217, 119, 6, 0.05)',
        marginBottom: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(217, 119, 6, 0.1)',
    },
    heroBadgeText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
        color: '#D97706',
        letterSpacing: 2,
    },
    heroTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -1,
        lineHeight: 40,
    },
    heroSubtitle: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    actionsGrid: {
        gap: 12,
        marginTop: 10,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidthCard: {
        flex: 1,
        aspectRatio: 1.1,
    },
    actionCardGrid: {
        flex: 1,
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 28,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    actionCardHorizontal: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    iconCircleSmall: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardTitleGrid: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 13,
        color: '#f8fafc',
        textAlign: 'center',
    },
    activeHighlight: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: '#020617',
    },
    fullScreenModalContent: {
        flex: 1,
        backgroundColor: '#020617',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    modalBackButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCloseButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 11,
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    guideMenu: {
        gap: 16,
    },
    guideMenuTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 32,
        color: 'white',
        marginBottom: 12,
        letterSpacing: -1,
    },
    guideMenuSub: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 40,
        lineHeight: 22,
    },
    menuItemsList: {
        gap: 14,
    },
    menuItemClean: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.015)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    menuIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(217, 119, 6, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    menuItemTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 17,
        color: 'white',
        marginBottom: 4,
    },
    menuItemSubText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.25)',
    },
    menuArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(217, 119, 6, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    guideTextContainer: {
        gap: 28,
    },
    guideSubTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 26,
        color: 'white',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    pointRow: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'flex-start',
    },
    pointBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 40,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    pointBadgeText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
    },
    pointTitleText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 15,
        color: 'white',
        marginBottom: 6,
    },
    guideBody: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.45)',
        lineHeight: 24,
    },
    impactIntro: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        color: 'rgba(255,255,255,0.25)',
        marginBottom: -8,
        fontStyle: 'italic',
    },
    alchemySection: {
        gap: 12,
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.01)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    alchemyLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 11,
        color: '#D97706',
        letterSpacing: 2,
    },
    insightBox: {
        backgroundColor: 'rgba(217, 119, 6, 0.02)',
        padding: 20,
        borderRadius: 20,
        borderLeftWidth: 3,
        borderLeftColor: 'rgba(217, 119, 6, 0.3)',
    },
    insightText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.35)',
        lineHeight: 22,
    },
    continueButton: {
        marginTop: 20,
        paddingVertical: 22,
        borderRadius: 28,
        backgroundColor: 'rgba(217, 119, 6, 0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(217, 119, 6, 0.1)',
    },
    continueText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 15,
        color: '#D97706',
    },
    finishStudyButton: {
        marginTop: 40,
        backgroundColor: '#D97706',
        paddingVertical: 22,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#D97706',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    finishStudyText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'white',
        letterSpacing: 4,
    },
    stepCardContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.04)',
    },
    stepCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    stepIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepIcon: {
        fontSize: 20,
    },
    stepCardTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: 'white',
    },
    stepCardText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 22,
    },
    alchemyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    comparisonGrid: {
        gap: 16,
    },
    comparisonCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
    },
    comparisonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    comparisonTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 13,
        color: '#D97706',
        letterSpacing: 2,
    },
    comparisonSubTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: 'white',
        marginBottom: 8,
    },
    comparisonText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingLeft: 4,
    },
    sectionTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: 'white',
        letterSpacing: 2,
    },
    sectionHighlight: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D97706',
        marginLeft: 8,
    },
    studyFlowButton: {
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderWidth: 1,
        borderColor: 'rgba(217, 119, 6, 0.2)',
        overflow: 'hidden',
    },
    studyFlowGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        borderRadius: 20,
    },
    studyIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    studyFlowText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: 'white',
        marginBottom: 4,
    },
    studyFlowSub: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
    },
});

export default RaiseFrequency;
