import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BreathingBackground } from '../components/BreathingBackground';

const { width } = Dimensions.get('window');

const RaiseFrequency = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const practices = [
        {
            title: 'Solfeggio Frequencies',
            description: 'Align your energy with divine healing tones (528Hz, 432Hz).',
            icon: 'musical-notes',
            color: '#8B5CF6',
        },
        {
            title: 'High-Vibe Nutrition',
            description: 'Fuel your vessel with living, sun-charged foods.',
            icon: 'leaf',
            color: '#10B981',
        },
        {
            title: 'Gratitude Overflow',
            description: 'The fastest way to shift your state into abundance.',
            icon: 'heart',
            color: '#EF4444',
        },
        {
            title: 'Quantum Movement',
            description: 'Shake off stagnant energy and activate your aura.',
            icon: 'thunderstorm',
            color: '#F59E0B',
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <BreathingBackground
                colors={['#1E1B4B', '#312E81', '#1E1B4B']}
                opacity={0.8}
            />

            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Frequency</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.heroSection}>
                        <Text style={styles.heroTitle}>Raise Your Vibration</Text>
                        <Text style={styles.heroSubtitle}>
                            Shift your energetic state to match the frequency of your desires.
                        </Text>
                    </Animated.View>

                    <View style={styles.grid}>
                        {practices.map((item, index) => (
                            <Animated.View
                                key={item.title}
                                entering={FadeInUp.delay(200 * index).duration(800)}
                                style={styles.cardContainer}
                            >
                                <TouchableOpacity
                                    style={[styles.card, { borderColor: `${item.color}40` }]}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                                        <Ionicons name={item.icon as any} size={28} color={item.color} />
                                    </View>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <Text style={styles.cardDescription}>{item.description}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>

                    <Animated.View entering={FadeInDown.delay(1000)} style={styles.footer}>
                        <TouchableOpacity style={styles.instantShiftButton} activeOpacity={0.9}>
                            <Text style={styles.instantShiftText}>Instant Shift (5 Min)</Text>
                            <Ionicons name="flash" size={20} color="white" />
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </View>
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
        paddingHorizontal: 20,
        height: 60,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 18,
        color: 'white',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    heroSection: {
        marginBottom: 32,
        alignItems: 'center',
    },
    heroTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 28,
        color: 'white',
        textAlign: 'center',
        marginBottom: 12,
    },
    heroSubtitle: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    cardContainer: {
        width: (width - 64) / 2,
    },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
    },
    cardDescription: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 16,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    instantShiftButton: {
        backgroundColor: '#4F46E5',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 30,
        gap: 12,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    instantShiftText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: 'white',
    },
});

export default RaiseFrequency;
