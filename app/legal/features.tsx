import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    StatusBar,
    Dimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BreathingBackground } from '../../components/BreathingBackground';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AppFeatures() {
    const router = useRouter();

    const FeatureCard = ({ icon, title, description, color, delay }: { icon: any; title: string; description: string; color: string; delay: number }) => (
        <Animated.View entering={FadeInDown.delay(delay).duration(600)} style={styles.cardContainer}>
            <BlurView intensity={20} tint="dark" style={styles.featureCard}>
                <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={icon} size={28} color={color} />
                </View>
                <View style={styles.featureInfo}>
                    <Text style={styles.featureTitle}>{title}</Text>
                    <Text style={styles.featureDescription}>{description}</Text>
                </View>
            </BlurView>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <BreathingBackground
                colors={['#0f172a', '#1e1b4b', '#4c1d95']}
                opacity={0.8}
            />
            
            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>APP FEATURES</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInUp.duration(800)} style={styles.hero}>
                        <Text style={styles.heroTitle}>The Manifest Suite</Text>
                        <Text style={styles.heroSubtitle}>Everything you need to align with your highest timeline.</Text>
                    </Animated.View>

                    <FeatureCard
                        delay={200}
                        icon="sparkles"
                        color="#fb923c"
                        title="Manifestation Engine"
                        description="A scientifically backed 5-step journey: Visualization, Goals, Dream Scripting, and Action Mapping."
                    />

                    <FeatureCard
                        delay={300}
                        icon="chatbubble-ellipses"
                        color="#8b5cf6"
                        title="AI Universe Chat"
                        description="Direct access to the Universe. Get divine guidance and strategic breakthroughs tailored to your specific journey."
                    />

                    <FeatureCard
                        delay={400}
                        icon="videocam"
                        color="#ec4899"
                        title="Future Records"
                        description="Record messages for your future self. Bridge the gap between who you are and who you are becoming."
                    />

                    <FeatureCard
                        delay={500}
                        icon="heart"
                        color="#ef4444"
                        title="Affirmation Sanctuary"
                        description="Daily mantras and powerful affirmations designed to reprogram your subconscious mind for success."
                    />

                    <FeatureCard
                        delay={600}
                        icon="flame"
                        color="#fbbf24"
                        title="Streak Tracking"
                        description="Stay consistent. Build the discipline of a master manifester with automated habit tracking."
                    />

                    <FeatureCard
                        delay={700}
                        icon="shield-checkmark"
                        color="#10b981"
                        title="Privacy First"
                        description="End-to-end focus on your privacy. Your dreams and records are for your eyes only."
                    />

                    <TouchableOpacity 
                        style={styles.ctaButton}
                        onPress={() => router.push('/onboarding/paywall')}
                    >
                        <LinearGradient
                            colors={['#8b5cf6', '#d946ef']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaGradient}
                        >
                            <Text style={styles.ctaText}>UNLOCK EVERYTHING</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    safe: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 3,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 32,
    },
    heroTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 32,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 20,
    },
    cardContainer: {
        marginBottom: 16,
    },
    featureCard: {
        padding: 20,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureInfo: {
        flex: 1,
    },
    featureTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#fff',
        marginBottom: 4,
    },
    featureDescription: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 18,
    },
    ctaButton: {
        marginTop: 20,
        borderRadius: 30,
        overflow: 'hidden',
        height: 60,
    },
    ctaGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#fff',
        letterSpacing: 2,
    },
});
