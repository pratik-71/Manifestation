import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BreathingBackground } from '../components/BreathingBackground';

export default function Profile() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <BreathingBackground
                colors={['#0f172a', '#1e1b4b', '#312e81']}
                opacity={0.6}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Your Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.delay(200)} style={styles.profileHeader}>
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={40} color="#f97316" />
                        </View>
                        <Text style={styles.userName}>Seeker</Text>
                        <Text style={styles.userStatus}>3 Day Streak 🔥</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="notifications-outline" size={22} color="#fff" />
                            <Text style={styles.menuText}>Notifications</Text>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="settings-outline" size={22} color="#fff" />
                            <Text style={styles.menuText}>Settings</Text>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="help-circle-outline" size={22} color="#fff" />
                            <Text style={styles.menuText}>Help & Feedback</Text>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                    </Animated.View>
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
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
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
        color: '#fff',
    },
    profileHeader: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 2,
        borderColor: '#f97316',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    userName: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#fff',
        marginBottom: 8,
    },
    userStatus: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: '#f97316',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    section: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        padding: 8,
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
});
