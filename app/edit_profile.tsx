import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    InteractionManager,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BreathingBackground } from '../components/BreathingBackground';
import { TimeValue, TimeWheelPicker } from '../components/TimeWheelPicker';
import { requestNotificationPermissions, scheduleManifestationNotifications } from '../services/notificationService';
import { useUserStore } from '../store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const timeValueTo24h = (val: TimeValue): string => {
    let hour = parseInt(val.hour, 10);
    if (val.ampm === 'PM' && hour !== 12) hour += 12;
    if (val.ampm === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${val.minute}`;
};

const h24ToTimeValue = (time: string): TimeValue => {
    if (!time) return { hour: '07', minute: '00', ampm: 'AM' };
    const [h, m] = time.split(':').map(Number);
    let ampm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    let hour = h % 12;
    if (hour === 0) hour = 12;
    return {
        hour: hour.toString().padStart(2, '0'),
        minute: m.toString().padStart(2, '0'),
        ampm
    };
};

export default function EditProfile() {
    const router = useRouter();
    const { profile, updateProfile } = useUserStore();
    
    const [username, setUsername] = useState(profile?.username || '');
    const [wakeTime, setWakeTime] = useState<TimeValue>(h24ToTimeValue(profile?.wake_time || '07:00'));
    const [sleepTime, setSleepTime] = useState<TimeValue>(h24ToTimeValue(profile?.sleep_time || '23:00'));
    const [manifestTime, setManifestTime] = useState<TimeValue>(h24ToTimeValue(profile?.manifest_time || '10:00'));
    const [calmMindInterval, setCalmMindInterval] = useState<number>(0);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isReady, setIsReady] = useState(false);

    React.useEffect(() => {
        const task = InteractionManager.runAfterInteractions(async () => {
            try {
                const storedInterval = await AsyncStorage.getItem('calm_mind_interval');
                if (storedInterval !== null) {
                    setCalmMindInterval(parseInt(storedInterval, 10));
                }
            } catch (e) {
                console.warn('Failed to load interval');
            }
            setIsReady(true);
        });
        return () => task.cancel();
    }, []);

    const handleSave = async () => {
        if (!username.trim()) {
            Alert.alert("Error", "Username cannot be empty");
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile({
                username: username.trim(),
                wake_time: timeValueTo24h(wakeTime),
                sleep_time: timeValueTo24h(sleepTime),
                manifest_time: timeValueTo24h(manifestTime),
            });

            // Reschedule notifications (will update only if already granted)
            try {
                const parseTime = (val: TimeValue) => {
                    let hour = parseInt(val.hour);
                    if (val.ampm === 'PM' && hour !== 12) hour += 12;
                    if (val.ampm === 'AM' && hour === 12) hour = 0;
                    return { hour, minute: parseInt(val.minute) };
                };

                await AsyncStorage.setItem('calm_mind_interval', calmMindInterval.toString());

                await scheduleManifestationNotifications({
                    wakeTime: parseTime(wakeTime),
                    sleepTime: parseTime(sleepTime),
                    manifestTime: parseTime(manifestTime),
                    calmMindInterval: calmMindInterval === 0 ? undefined : calmMindInterval,
                });
            } catch (err) {
                console.warn("Failed to reschedule notifications: [Safe String]");
            }

            Alert.alert("Success", "Profile updated successfully!");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={['#060114', '#160a2b', '#030014']}
                opacity={0.9}
            />

            <View style={styles.glowOrbTop} />
            <View style={styles.glowOrbBottom} />

            <SafeAreaView style={styles.safe}>
                <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>YOUR IDENTITY</Text>
                    <View style={{ width: 44 }} />
                </Animated.View>

                <KeyboardAwareScrollView 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={styles.scrollContent}
                    style={{ flex: 1 }}
                >
                        
                        {/* Username Section */}
                        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="person-circle-outline" size={16} color="#d946ef" />
                                <Text style={styles.sectionLabel}>USERNAME</Text>
                            </View>
                            <BlurView intensity={30} tint="dark" style={styles.inputCard}>
                                <LinearGradient
                                    colors={['rgba(217, 70, 239, 0.1)', 'rgba(0,0,0,0)']}
                                    style={StyleSheet.absoluteFillObject}
                                />
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Your username"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    maxLength={15}
                                />
                            </BlurView>
                        </Animated.View>

                        {/* Wake Time Section */}
                        <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="sunny-outline" size={16} color="#f59e0b" />
                                <Text style={styles.sectionLabel}>WAKE UP Time</Text>
                            </View>
                            <View style={styles.pickerContainer}>
                                {isReady ? (
                                    <TimeWheelPicker value={wakeTime} onChange={setWakeTime} />
                                ) : (
                                    <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
                                        <ActivityIndicator color="rgba(255,255,255,0.2)" />
                                    </View>
                                )}
                            </View>
                        </Animated.View>

                        {/* Sleep Time Section */}
                        <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="moon-outline" size={16} color="#8b5cf6" />
                                <Text style={styles.sectionLabel}>Sleep Time</Text>
                            </View>
                            <View style={styles.pickerContainer}>
                                {isReady ? (
                                    <TimeWheelPicker value={sleepTime} onChange={setSleepTime} />
                                ) : (
                                    <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
                                        <ActivityIndicator color="rgba(255,255,255,0.2)" />
                                    </View>
                                )}
                            </View>
                        </Animated.View>

                        {/* Manifestation Time Section */}
                        <Animated.View entering={FadeInDown.delay(500).duration(800)} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="sparkles-outline" size={16} color="#14b8a6" />
                                <Text style={styles.sectionLabel}>MANIFESTATION WINDOW</Text>
                            </View>
                            <View style={styles.pickerContainer}>
                                {isReady ? (
                                    <TimeWheelPicker value={manifestTime} onChange={setManifestTime} />
                                ) : (
                                    <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
                                        <ActivityIndicator color="rgba(255,255,255,0.2)" />
                                    </View>
                                )}
                            </View>
                        </Animated.View>

                        {/* Calm Mind Interval Section */}
                        <Animated.View entering={FadeInDown.delay(550).duration(800)} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="leaf-outline" size={16} color="#fb923c" />
                                <Text style={styles.sectionLabel}>CORTISOL REDUCTION REMINDER</Text>
                            </View>
                            <View style={styles.intervalContainer}>
                                {[0, 60, 90, 120, 150, 180].map((val) => (
                                    <TouchableOpacity
                                        key={val}
                                        style={[
                                            styles.intervalButton,
                                            calmMindInterval === val ? styles.intervalSelected : styles.intervalUnselected
                                        ]}
                                        onPress={() => setCalmMindInterval(val)}
                                    >
                                        <Text style={[
                                            styles.intervalText,
                                            { color: calmMindInterval === val ? '#fb923c' : '#fff' }
                                        ]}>
                                            {val === 0 ? "Off" : `${val} min`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>

                        <View style={{ height: 40 }} />

                        <Animated.View entering={FadeInDown.delay(600).duration(800)}>
                            <TouchableOpacity 
                                style={styles.saveButton} 
                                onPress={handleSave}
                                disabled={isSaving}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#8b5cf6', '#d946ef', '#f97316']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.saveGradient}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveText}>UPDATE DESTINY</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        <View style={{ height: 100 }} />
                    </KeyboardAwareScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#02010A' },
    safe: { flex: 1 },
    glowOrbTop: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#8b5cf6',
        opacity: 0.15,
        filter: 'blur(60px)',
    },
    glowOrbBottom: {
        position: 'absolute',
        bottom: -50,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#d946ef',
        opacity: 0.1,
        filter: 'blur(80px)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 30,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    backButton: {
        width: 44,
        height: 44,
       
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 13,
        color: '#fff',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginLeft: 4,
        gap: 8,
    },
    sectionLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    inputCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(20, 10, 40, 0.4)',
    },
    input: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 18,
        color: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    pickerContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(10, 5, 25, 0.6)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    intervalContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 8,
    },
    intervalButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    intervalSelected: {
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderColor: '#fb923c',
    },
    intervalUnselected: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    intervalText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
    },
    saveButton: {
        borderRadius: 30,
        overflow: 'hidden',
        height: 56,
        shadowColor: '#d946ef',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    saveGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: '#fff',
        letterSpacing: 3,
    },
});
