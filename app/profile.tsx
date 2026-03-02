import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BottomBar } from '../components/BottomBar';
import { BreathingBackground } from '../components/BreathingBackground';
import { getCurrentUser, signOut } from '../services/authService';
import { useUserStore } from '../store/userStore';

const { width } = Dimensions.get('window');

export default function Profile() {
    const router = useRouter();
    const { profile, fetchProfile } = useUserStore();
    const [email, setEmail] = useState<string>('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const init = async () => {
            const user = await getCurrentUser();
            if (user) {
                setEmail(user.email || '');
                if (!profile) {
                    await fetchProfile(user.id);
                }
            } else {
                router.replace('/onboarding/google_signin');
            }
        };
        init();
    }, []);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Stay", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            await signOut();
                            router.replace('/onboarding/google_signin');
                        } catch (error) {
                            Alert.alert("Error", "Failed to sign out.");
                        } finally {
                            setIsLoggingOut(false);
                        }
                    }
                }
            ]
        );
    };

    const MenuRow = ({ icon, label, onPress, showBorder = true }: any) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.menuRow, !showBorder && { borderBottomWidth: 0 }]}
        >
            <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color="#fff" />
                </View>
                <Text style={styles.menuLabel}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={['#0f172a', '#1c1917', '#451a03']}
                opacity={0.8}
            />

            <SafeAreaView style={styles.safe}>
                <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
                    <Text style={styles.headerTitle}>PROFILE</Text>
                </Animated.View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Profile Hero */}
                    <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.heroContainer}>
                        <View style={styles.avatarOutline}>
                            <LinearGradient
                                colors={['#8b5cf6', '#d946ef', '#f97316']}
                                style={styles.avatarGradient}
                            >
                                <Text style={styles.avatarText}>
                                    {(profile?.username || 'S').charAt(0).toUpperCase()}
                                </Text>
                            </LinearGradient>
                        </View>

                        <Text style={styles.username}>{profile?.username || 'Seeker'}</Text>
                        <Text style={styles.emailTag}>{email}</Text>

                        <View style={styles.streakBadge}>
                            <Ionicons name="flame" size={14} color="#f97316" />
                            <Text style={styles.streakText}>{profile?.streak_count || 0} Day Streak</Text>
                        </View>
                    </Animated.View>

                    {/* Settings Section */}
                    <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.sectionWrapper}>
                        <BlurView intensity={25} tint="dark" style={styles.glassCard}>
                            <MenuRow
                                icon="person-outline"
                                label="Personal Information"
                                onPress={() => router.push('/edit_profile')}
                            />
                            <MenuRow
                                icon="card-outline"
                                label="Subscription"
                                onPress={() => { }}
                            />
                            <MenuRow
                                icon="chatbubble-outline"
                                label="Feedback"
                                onPress={() => { }}
                            />
                            <MenuRow
                                icon="information-circle-outline"
                                label="About"
                                onPress={() => Alert.alert("About Astral", "Your companion in the journey of manifestation.\nVersion 1.0.4")}
                                showBorder={true}
                            />
                            <MenuRow
                                icon="log-out-outline"
                                label="Logout"
                                onPress={handleLogout}
                                showBorder={false}
                            />
                        </BlurView>
                    </Animated.View>

                    <View style={styles.footer}>
                        <Text style={styles.versionText}>v1.0.4</Text>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </SafeAreaView>

            <BottomBar />

            {isLoggingOut && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator color="#fff" size="large" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#0f172a' },
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
    avatarOutline: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    avatarGradient: {
        flex: 1,
        borderRadius: 47,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 42,
        color: '#fff',
    },
    username: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#fff',
        marginBottom: 4,
    },
    emailTag: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 16,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    streakText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
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
        marginBottom: 8,
    },
    cardTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    aboutText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 22,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLabel: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    versionText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 10,
        color: 'rgba(255,255,255,0.1)',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
});
