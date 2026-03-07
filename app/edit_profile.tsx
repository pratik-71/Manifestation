import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
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
    const [goals, setGoals] = useState<string[]>([]);
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
                router.replace('/onboarding/google_signin');
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
                setGoals(profile.goals || []);
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

    const handleAddGoal = () => {
        if (!newGoal.trim()) return;
        setGoals([...goals, newGoal.trim()]);
        setNewGoal('');
    };

    const handleDeleteGoal = (index: number) => {
        setGoals(goals.filter((_, i) => i !== index));
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
                    manifest_time: manifestTimeStr,
                    goals: goals // Save as JSONB array directly
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
            console.error('Save error:', error);
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
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <ActivityIndicator color="#fb923c" size="small" />
                            ) : (
                                <Text style={styles.saveText}>Done</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={[{ id: 'form' }]}
                        keyExtractor={item => item.id}
                        renderItem={() => (
                            <View>
                                {/* Name Section */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>YOUR NAME</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={username}
                                        onChangeText={setUsername}
                                        placeholder="What should we call you?"
                                        placeholderTextColor="rgba(255,255,255,0.2)"
                                    />
                                </View>

                                {/* Goals Section */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>YOUR GOALS</Text>
                                    <View style={styles.glassCard}>
                                        {goals.map((goal, index) => (
                                            <View key={index} style={[styles.goalItem, index === goals.length - 1 && { borderBottomWidth: 0 }]}>
                                                <Text style={styles.goalText}>{goal}</Text>
                                                <TouchableOpacity onPress={() => handleDeleteGoal(index)} style={styles.deleteBtn}>
                                                    <Ionicons name="trash-outline" size={18} color="rgba(248, 113, 113, 0.6)" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                        <View style={styles.addGoalRow}>
                                            <TextInput
                                                style={styles.addGoalInput}
                                                value={newGoal}
                                                onChangeText={setNewGoal}
                                                placeholder="Add a new goal..."
                                                placeholderTextColor="rgba(255,255,255,0.2)"
                                                onSubmitEditing={handleAddGoal}
                                            />
                                            <TouchableOpacity style={styles.addGoalButton} onPress={handleAddGoal}>
                                                <Ionicons name="add" size={20} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Rhythm Section */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>SACRED RHYTHM</Text>

                                    <View style={styles.timeItem}>
                                        <Text style={styles.timeLabel}>Wake Up</Text>
                                        <TimeWheelPicker value={wakeTime} onChange={setWakeTime} />
                                    </View>

                                    <View style={styles.timeItem}>
                                        <Text style={styles.timeLabel}>Deep Sleep</Text>
                                        <TimeWheelPicker value={sleepTime} onChange={setSleepTime} />
                                    </View>

                                    <View style={styles.timeItem}>
                                        <Text style={styles.timeLabel}>Manifestation Hour</Text>
                                        <TimeWheelPicker value={manifestTime} onChange={setManifestTime} />
                                    </View>
                                </View>

                                <View style={{ height: 100 }} />
                            </View>
                        )}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    />
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
        paddingVertical: 35,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Comfortaa_700Bold',
        letterSpacing: 1,
    },
    saveText: {
        color: '#fb923c',
        fontSize: 15,
        fontFamily: 'Comfortaa_700Bold'
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10
    },
    section: {
        marginBottom: 32,
    },
    sectionLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontFamily: 'Comfortaa_700Bold',
        letterSpacing: 2,
        marginBottom: 12,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 18,
        color: '#fff',
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    goalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    goalText: {
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        flex: 1,
        marginRight: 12
    },
    deleteBtn: {
        padding: 4,
    },
    addGoalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        paddingLeft: 12,
        paddingRight: 6,
        paddingVertical: 4,
    },
    addGoalInput: {
        flex: 1,
        color: '#fff',
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        paddingVertical: 8,
    },
    addGoalButton: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: 'rgba(251, 146, 60, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeItem: {
        marginBottom: 24,
    },
    timeLabel: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Comfortaa_600SemiBold',
        marginBottom: 12,
        marginLeft: 4,
        opacity: 0.8,
    },
});
