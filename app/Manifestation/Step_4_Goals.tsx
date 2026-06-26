import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeInDown, FadeInUp, FadeOut, Layout } from 'react-native-reanimated';
import { clearStaleGoals } from '../../services/goalService';
import { useUserStore } from '../../store/userStore';

const { width, height } = Dimensions.get('window');

interface Goal {
    id: string;
    text: string;
}

const Step_4_Goals = ({ onComplete }: { onComplete?: () => void }) => {
    const [goals, setGoals] = useState<Goal[]>([{ id: Date.now().toString(), text: '' }]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load previously saved goals on mount
    useEffect(() => {
        const loadSavedGoals = async () => {
            try {
                const wakeTime = useUserStore.getState().profile?.wake_time || '07:00';
                const wasCleared = await clearStaleGoals(wakeTime);
                if (wasCleared) {
                    setIsLoaded(true);
                    return; // goals were wiped and reset to empty
                }

                const saved = await AsyncStorage.getItem('today_goals');
                if (saved) {
                    try {
                        const parsed: string[] = JSON.parse(saved);
                        if (parsed.length > 0) {
                            setGoals(parsed.map((text, i) => ({
                                id: `loaded_${i}_${Date.now()}`,
                                text
                            })));
                        }
                    } catch (parseError) {
                        console.warn('Failed to parse saved goals:', parseError);
                    }
                }
            } catch (e) {
                // If load fails, start with empty goal
            } finally {
                setIsLoaded(true);
            }
        };
        loadSavedGoals();
    }, []);

    const addGoal = () => {
        setGoals([...goals, { id: Date.now().toString(), text: '' }]);
    };

    const removeGoal = (id: string) => {
        if (goals.length > 1) {
            setGoals(goals.filter(goal => goal.id !== id));
        }
    };

    const updateGoal = (id: string, text: string) => {
        setGoals(goals.map(goal => (goal.id === id ? { ...goal, text } : goal)));
    };

    const handleSave = async () => {
        const validGoals = goals.filter(g => g.text.trim() !== '');
        if (validGoals.length === 0) {
            Alert.alert('Empty Goals', 'Please add at least one goal for today.');
            return;
        }

        setIsSaving(true);
        try {
            const existingData = await AsyncStorage.getItem('manifestation_history');
            let history = [];
            if (existingData) {
                try {
                    history = JSON.parse(existingData);
                } catch (parseError) {
                    console.warn('Failed to parse manifestation history:', parseError);
                    history = [];
                }
            }

            const sessionData = {
                date: new Date().toISOString(),
                goals: validGoals.map(g => g.text),
                type: 'daily_manifestation'
            };

            history.push(sessionData);
            await AsyncStorage.setItem('manifestation_history', JSON.stringify(history));

            // Also save as "today's goals" for quick access
            const now = new Date().toISOString();
            await AsyncStorage.setItem('today_goals', JSON.stringify(validGoals.map(g => g.text)));
            await AsyncStorage.setItem('last_goals_save_time', now);

            onComplete?.();
        } catch (error) {
            console.warn("Error saving goals: [Safe String]");
            Alert.alert('Error', 'Failed to save your goals. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                <Text style={styles.subtitle}>List a few small actions you can take today moving you closer towards your goal.</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300)} style={styles.exampleContainer}>
                <BlurView intensity={10} tint="light" style={styles.exampleBlur}>
                    <View style={styles.exampleHeader}>
                        <Ionicons name="bulb-outline" size={14} color="#FCD34D" />
                        <Text style={styles.exampleTitle}>Actionable Steps</Text>
                    </View>
                    <Text style={styles.exampleText}>Focus on clear, simple tasks you can control today.</Text>
                </BlurView>
            </Animated.View>

            <KeyboardAwareScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {goals.map((goal, index) => (
                    <Animated.View
                        key={goal.id}
                        entering={FadeInDown.delay(index * 100)}
                        exiting={FadeOut}
                        layout={Layout.springify()}
                        style={styles.goalItem}
                    >
                        <BlurView intensity={15} tint="light" style={styles.goalGlass}>
                            <View style={styles.inputWrapper}>
                                <View style={styles.starCircle}>
                                    <Ionicons name="ellipse" size={8} color="#FCD34D" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Write a goal here..."
                                    placeholderTextColor="rgba(255, 255, 255, 0.2)"
                                    value={goal.text}
                                    onChangeText={(text) => updateGoal(goal.id, text)}
                                    cursorColor="#FCD34D"
                                />
                                {goals.length > 1 && (
                                    <TouchableOpacity onPress={() => removeGoal(goal.id)} style={styles.removeBtn}>
                                        <Ionicons name="trash-outline" size={18} color="rgba(255, 68, 68, 0.5)" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </BlurView>
                    </Animated.View>
                ))}

                <TouchableOpacity style={styles.addBtn} onPress={addGoal} activeOpacity={0.7}>
                    <View style={styles.addIconCircle}>
                        <Ionicons name="add" size={20} color="white" />
                    </View>
                    <Text style={styles.addBtnText}>Add Another Goal</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                    activeOpacity={0.9}
                    disabled={isSaving}
                >
                    <LinearGradient
                        colors={['#F59E0B', '#D97706']}
                        style={styles.gradientBtn}
                    >
                        <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : "Save Goals"}</Text>
                        <Ionicons name="checkmark" size={18} color="white" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.skipStepBtn}
                    onPress={onComplete}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipStepText}>Skip to Final Release</Text>
                    <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    header: {
        marginBottom: height < 700 ? 15 : 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 10,
        fontFamily: 'Comfortaa_700Bold',
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: width < 380 ? 14 : 18,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 6,
        lineHeight: width < 380 ? 24 : 30,
        fontFamily: 'Comfortaa_500Medium',
    },
    exampleContainer: {
        borderRadius: 24,
        marginBottom: height < 700 ? 15 : 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
    },
    exampleBlur: {
        padding: height < 700 ? 10 : 12,
    },
    exampleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    exampleTitle: {
        fontSize: 10,
        fontFamily: 'Comfortaa_700Bold',
        color: '#FCD34D',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    exampleText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'Comfortaa_400Regular',
        lineHeight: 18,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    goalItem: {
        marginBottom: 12,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    goalGlass: {
        padding: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
    },
    starCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Comfortaa_500Medium',
    },
    removeBtn: {
        padding: 6,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 12,
        marginTop: 5,
    },
    addIconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnText: {
        fontSize: 12,
        fontFamily: 'Comfortaa_700Bold',
        color: '#FCD34D',
        letterSpacing: 1,
    },
    saveBtn: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    footer: {
        width: '100%',
        paddingBottom: 8,
    },
    gradientBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Comfortaa_700Bold',
        letterSpacing: 1,
    },
    skipStepBtn: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'center',
        padding: 5,
    },
    skipStepText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.2)',
        fontFamily: 'Comfortaa_500Medium',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

export default Step_4_Goals;
