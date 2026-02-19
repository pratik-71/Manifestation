import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BreathingBackground } from '../components/BreathingBackground';
import { getCurrentUser, signOut } from '../services/authService';
import { supabase } from '../services/supabase';

interface UserProfile {
    username: string;
    wake_time: string;
    sleep_time: string;
    manifest_time: string;
}

export default function Profile() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const user = await getCurrentUser();
            if (!user) {
                router.replace('/onboarding/Opening_Page');
                return;
            }
            setUserEmail(user.email || null);

            const { data, error } = await supabase
                .from('profiles')
                .select('username, wake_time, sleep_time, manifest_time')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Cosmic Disconnect",
            "Are you sure you want to log out of your manifestation journey?",
            [
                { text: "Stay", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            await signOut();
                            router.replace('/onboarding/Opening_Page');
                        } catch (error) {
                            Alert.alert("Error", "Failed to sign out. Please try again.");
                        } finally {
                            setIsLoggingOut(false);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading || isLoggingOut) {
        return (
            <View style={styles.loadingContainer}>
                <BreathingBackground colors={['#0f172a', '#1e1b4b']} opacity={1} />
                <ActivityIndicator size="large" color="#fb923c" />
                <Text style={styles.loadingText}>{isLoggingOut ? "Closing Cosmic Portal..." : "Syncing Intensions..."}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <BreathingBackground
                colors={['#0f172a', '#1e1b4b', '#312e81']}
                opacity={0.8}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cosmic Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* User Info Card */}
                    <Animated.View entering={FadeInUp.duration(600)} style={styles.userCard}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarGlow} />
                            <View style={styles.avatarInner}>
                                <Text style={styles.avatarInitial}>
                                    {profile?.username?.[0]?.toUpperCase() || 'S'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.userName}>{profile?.username || 'Seeker'}</Text>
                        <Text style={styles.userEmail}>{userEmail}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>12</Text>
                                <Text style={styles.statLabel}>Rituals</Text>
                            </View>
                            <View style={[styles.statBox, styles.statBorder]}>
                                <Text style={styles.statValue}>3</Text>
                                <Text style={styles.statLabel}>Day Streak</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>Zen</Text>
                                <Text style={styles.statLabel}>Level</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Ritual Timing Section */}
                    <Text style={styles.sectionTitle}>Your Sacred Rhythm</Text>
                    <Animated.View entering={FadeInDown.delay(200)} style={styles.rhythmCard}>
                        <View style={styles.rhythmItem}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(251, 146, 60, 0.1)' }]}>
                                <Ionicons name="sunny" size={20} color="#fb923c" />
                            </View>
                            <View style={styles.rhythmInfo}>
                                <Text style={styles.rhythmLabel}>Wake Up</Text>
                                <Text style={styles.rhythmValue}>{profile?.wake_time?.substring(0, 5) || '07:00'} AM</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/edit_profile' as any)}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.rhythmItem}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                                <Ionicons name="moon" size={20} color="#a855f7" />
                            </View>
                            <View style={styles.rhythmInfo}>
                                <Text style={styles.rhythmLabel}>Sleep Time</Text>
                                <Text style={styles.rhythmValue}>{profile?.sleep_time?.substring(0, 5) || '11:00'} PM</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/edit_profile' as any)}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.rhythmItem}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                                <Ionicons name="sparkles" size={20} color="#22c55e" />
                            </View>
                            <View style={styles.rhythmInfo}>
                                <Text style={styles.rhythmLabel}>Manifestation</Text>
                                <Text style={styles.rhythmValue}>{profile?.manifest_time?.substring(0, 5) || '12:00'} AM</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/edit_profile' as any)}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Menu Options */}
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <Animated.View entering={FadeInDown.delay(400)} style={styles.menuCard}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="notifications-outline" size={22} color="#fff" />
                            <Text style={styles.menuText}>Notification Settings</Text>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={22} color="#f87171" />
                            <Text style={[styles.menuText, { color: '#f87171' }]}>Disconnect Portal</Text>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
                        </TouchableOpacity>
                    </Animated.View>

                    <Text style={styles.versionText}>Version 1.0.0 – Manifestation Engine</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fb923c',
        fontFamily: 'Comfortaa_500Medium',
        marginTop: 20,
        fontSize: 16,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 18,
        color: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    // User Card
    userCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    avatarContainer: {
        width: 90,
        height: 90,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fb923c',
        opacity: 0.15,
    },
    avatarInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderWidth: 2,
        borderColor: '#fb923c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: '#fb923c',
        fontSize: 32,
        fontFamily: 'Comfortaa_700Bold',
    },
    userName: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 22,
        color: '#fff',
        marginBottom: 4,
    },
    userEmail: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.4)',
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        paddingVertical: 15,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statBorder: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statValue: {
        color: '#fff',
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 18,
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        marginTop: 4,
    },
    // Sections
    sectionTitle: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Rhythm Card
    rhythmCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 24,
        padding: 16,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    rhythmItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    rhythmInfo: {
        flex: 1,
    },
    rhythmLabel: {
        fontFamily: 'Comfortaa_400Regular',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
    },
    rhythmValue: {
        fontFamily: 'Comfortaa_600SemiBold',
        color: '#fff',
        fontSize: 16,
        marginTop: 2,
    },
    editText: {
        color: '#fb923c',
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 13,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 4,
    },
    // Menu Card
    menuCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 24,
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 15,
    },
    menuText: {
        flex: 1,
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 16,
        color: '#fff',
    },
    versionText: {
        textAlign: 'center',
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.2)',
        marginTop: 30,
    },
});
