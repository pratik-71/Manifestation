import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BreathingBackground } from '../components/BreathingBackground';
import { TimeValue, TimeWheelPicker } from '../components/TimeWheelPicker';
import { getCurrentUser } from '../services/authService';
import { scheduleManifestationNotifications } from '../services/notificationService';
import { supabase } from '../services/supabase';

export default function EditProfile() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Rhythm State
    const [wakeTime, setWakeTime] = useState<TimeValue>({ hour: '07', minute: '00', ampm: 'AM' });
    const [sleepTime, setSleepTime] = useState<TimeValue>({ hour: '11', minute: '00', ampm: 'PM' });
    const [manifestTime, setManifestTime] = useState<TimeValue>({ hour: '12', minute: '00', ampm: 'AM' });

    // Goals State
    const [goals, setGoals] = useState<{ id: string; content: string }[]>([]);
    const [newGoal, setNewGoal] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const user = await getCurrentUser();
            if (!user) {
                router.replace('/onboarding/Opening_Page');
                return;
            }

            // Fetch Profile
            const { data: profile, error: pError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUsername(profile.username);
                setWakeTime(parseTimeToValue(profile.wake_time));
                setSleepTime(parseTimeToValue(profile.sleep_time));
                setManifestTime(parseTimeToValue(profile.manifest_time));
            }

            // Fetch Goals
            const { data: goalsData } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id);

            if (goalsData) {
                setGoals(goalsData);
            }

        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const parseTimeToValue = (timeStr: string): TimeValue => {
        if (!timeStr) return { hour: '12', minute: '00', ampm: 'AM' };
        const [h, m] = timeStr.split(':');
        let hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        if (hour === 0) hour = 12;
        return {
            hour: hour.toString().padStart(2, '0'),
            minute: m.padStart(2, '0'),
            ampm
        };
    };

    const formatToTimeStr = (val: TimeValue) => {
        let hour = parseInt(val.hour);
        if (val.ampm === 'PM' && hour !== 12) hour += 12;
        if (val.ampm === 'AM' && hour === 12) hour = 0;
        return `${hour.toString().padStart(2, '0')}:${val.minute}:00`;
    };

    const handleAddGoal = async () => {
        if (!newGoal.trim()) return;

        try {
            const user = await getCurrentUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('goals')
                .insert([{ user_id: user.id, content: newGoal.trim() }])
                .select()
                .single();

            if (data) {
                setGoals([...goals, data]);
                setNewGoal('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteGoal = async (id: string) => {
        try {
            await supabase.from('goals').delete().eq('id', id);
            setGoals(goals.filter(g => g.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const user = await getCurrentUser();
            if (!user) return;

            const wakeTimeStr = formatToTimeStr(wakeTime);
            const sleepTimeStr = formatToTimeStr(sleepTime);
            const manifestTimeStr = formatToTimeStr(manifestTime);

            const { error } = await supabase
                .from('profiles')
                .update({
                    username,
                    wake_time: wakeTimeStr,
                    sleep_time: sleepTimeStr,
                    manifest_time: manifestTimeStr
                })
                .eq('id', user.id);

            if (error) throw error;

            // Update Notifications
            const parseTo24 = (val: TimeValue) => {
                let hour = parseInt(val.hour);
                if (val.ampm === 'PM' && hour !== 12) hour += 12;
                if (val.ampm === 'AM' && hour === 12) hour = 0;
                return { hour, minute: parseInt(val.minute) };
            };

            await scheduleManifestationNotifications({
                wakeTime: parseTo24(wakeTime),
                sleepTime: parseTo24(sleepTime),
                manifestTime: parseTo24(manifestTime)
            });

            Alert.alert("Success", "Your sacred journey has been updated.");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to update cosmic settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <BreathingBackground colors={['#0f172a', '#1e1b4b']} opacity={1} />
                <ActivityIndicator size="large" color="#fb923c" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <BreathingBackground colors={['#0f172a', '#1e1b4b']} opacity={0.8} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Sacred Settings</Text>
                        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <ActivityIndicator color="#fb923c" size="small" />
                            ) : (
                                <Text style={styles.saveText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Animated.View entering={FadeInDown.duration(600)}>
                            <Text style={styles.label}>Manifesting Name</Text>
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Enter your name"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                            />

                            <Text style={styles.sectionTitle}>Sacred Rhythm</Text>

                            <View style={styles.timeSection}>
                                <Text style={styles.timeLabel}>Wake Up Time</Text>
                                <TimeWheelPicker value={wakeTime} onChange={setWakeTime} />
                            </View>

                            <View style={styles.timeSection}>
                                <Text style={styles.timeLabel}>Sleep Time</Text>
                                <TimeWheelPicker value={sleepTime} onChange={setSleepTime} />
                            </View>

                            <View style={styles.timeSection}>
                                <Text style={styles.timeLabel}>Manifestation Time</Text>
                                <TimeWheelPicker value={manifestTime} onChange={setManifestTime} />
                            </View>

                            <Text style={styles.sectionTitle}>Your Goals</Text>
                            <View style={styles.goalsContainer}>
                                {goals.map((goal) => (
                                    <View key={goal.id} style={styles.goalItem}>
                                        <Text style={styles.goalText}>{goal.content}</Text>
                                        <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)}>
                                            <Ionicons name="trash-outline" size={20} color="#f87171" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <View style={styles.addGoalRow}>
                                    <TextInput
                                        style={styles.addGoalInput}
                                        value={newGoal}
                                        onChangeText={setNewGoal}
                                        placeholder="Add a new intention..."
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        onSubmitEditing={handleAddGoal}
                                    />
                                    <TouchableOpacity style={styles.addGoalButton} onPress={handleAddGoal}>
                                        <Ionicons name="add" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Comfortaa_700Bold' },
    saveText: { color: '#fb923c', fontSize: 16, fontFamily: 'Comfortaa_700Bold' },
    scrollContent: { paddingHorizontal: 24, paddingTop: 20 },
    label: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 8, fontFamily: 'Comfortaa_400Regular' },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        color: '#fff',
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    sectionTitle: {
        color: '#fb923c',
        fontSize: 14,
        fontFamily: 'Comfortaa_700Bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginTop: 10,
        marginBottom: 20,
    },
    timeSection: { marginBottom: 24 },
    timeLabel: { color: '#fff', fontSize: 14, fontFamily: 'Comfortaa_600SemiBold', marginBottom: 12 },
    goalsContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    goalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    goalText: { color: '#fff', fontFamily: 'Comfortaa_500Medium', flex: 1, marginRight: 10 },
    addGoalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
    addGoalInput: {
        flex: 1,
        color: '#fff',
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        paddingVertical: 8,
    },
    addGoalButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fb923c',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
});
