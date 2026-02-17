import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BreathingBackground } from '../../components/BreathingBackground';

export default function Goals() {
    const router = useRouter();
    const [currentGoal, setCurrentGoal] = useState('');
    const [goalTags, setGoalTags] = useState<string[]>([]);

    const handleAddGoal = () => {
        if (currentGoal.trim().length >= 3) {
            setGoalTags([...goalTags, currentGoal.trim()]);
            setCurrentGoal('');
        }
    };

    const handleRemoveGoal = (index: number) => {
        setGoalTags(goalTags.filter((_, i) => i !== index));
    };

    const isValid = goalTags.length > 0;

    return (
        <View style={{ flex: 1, backgroundColor: '#1a0d1f' }}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={['#100f13ff', '#361a3fff', '#83208aff']}
                opacity={0.75}
            />

            <View style={styles.overlay} pointerEvents="none" />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Question */}
                        <Animated.View
                            entering={FadeInDown.duration(600).delay(100)}
                            style={styles.questionContainer}
                        >
                            <Text style={styles.questionText}>
                                What are your goals? you wanna acheieve
                            </Text>
                        </Animated.View>

                        {/* Input Card */}
                        <Animated.View
                            entering={FadeInUp.duration(600).delay(200)}
                            style={styles.inputWrapper}
                        >
                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={currentGoal}
                                    onChangeText={setCurrentGoal}
                                    placeholder="Type your goal here..."
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    style={styles.input}
                                    maxLength={100}
                                    returnKeyType="done"
                                    cursorColor="#d946ef"
                                    selectionColor="rgba(217,70,239,0.3)"
                                    onSubmitEditing={handleAddGoal}
                                    multiline
                                />

                                <TouchableOpacity
                                    onPress={handleAddGoal}
                                    disabled={currentGoal.trim().length < 3}
                                    style={[
                                        styles.addButton,
                                        currentGoal.trim().length >= 3
                                            ? styles.addButtonActive
                                            : styles.addButtonInactive,
                                    ]}
                                >
                                    <Ionicons
                                        name="arrow-forward-circle"
                                        size={36}
                                        color={
                                            currentGoal.trim().length >= 3
                                                ? '#d946ef'
                                                : 'rgba(255,255,255,0.2)'
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        {/* Goals List */}
                        {goalTags.length > 0 && (
                            <Animated.View
                                entering={FadeInUp.duration(400)}
                                style={styles.goalListContainer}
                            >
                                {goalTags.map((goal, index) => (
                                    <Animated.View
                                        key={index}
                                        entering={FadeInUp.duration(300).delay(index * 100)}
                                        style={styles.goalItem}
                                    >
                                        <Text
                                            style={styles.goalItemText}
                                            numberOfLines={2}
                                        >
                                            {goal}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                handleRemoveGoal(index)
                                            }
                                            style={styles.removeButton}
                                        >
                                            <Ionicons
                                                name="close-circle-outline"
                                                size={24}
                                                color="#d946ef"
                                            />
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </Animated.View>
                        )}

                        {/* Footer moved inside ScrollView */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                onPress={() =>
                                    isValid &&
                                    router.push('/onboarding/accept_challenge')
                                }
                                style={[
                                    styles.nextButton,
                                    isValid
                                        ? styles.nextButtonActive
                                        : styles.nextButtonInactive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.nextButtonText,
                                        !isValid && { opacity: 0.3 },
                                    ]}
                                >
                                    Continue
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        paddingHorizontal: 14,
        paddingTop: 20,
    },

    backButton: {
        padding: 8,
        alignSelf: 'flex-start',
    },

    content: {
        flexGrow: 1,
        paddingHorizontal: 32,
        paddingTop: 20,
        paddingBottom: 40,
    },

    questionContainer: {
        marginBottom: 48,
        alignItems: 'center',
    },

    questionText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 20,
        lineHeight: 42,
        color: '#fff',
        textShadowColor: 'rgba(217,70,239,0.5)',
        textShadowRadius: 20,
        textShadowOffset: { width: 0, height: 0 },
    },

    inputWrapper: {
        marginBottom: 32,
        paddingHorizontal: 0, // Removed padding to increase width
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        paddingBottom: 8,
        gap: 12,
    },

    input: {
        flex: 1,
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 18,
        color: '#fff',
        minHeight: 40,
        maxHeight: 100,
        textAlignVertical: 'center',
        paddingVertical: 4,
    },

    addButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    addButtonActive: {
        opacity: 1,
    },

    addButtonInactive: {
        opacity: 0.3,
    },

    goalListContainer: {
        marginTop: 20,
        gap: 16,
    },

    goalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 4,
    },

    goalItemText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 18,
        color: '#fff',
        marginRight: 12,
        flex: 1,
    },

    removeButton: {
        padding: 4,
    },

    footer: {
        marginTop: 'auto',
        paddingTop: 40,
        paddingBottom: 24,
    },

    nextButton: {
        paddingVertical: 12,
        borderRadius: 32,
        width: '100%',
        alignItems: 'center',
    },

    nextButtonActive: {
        backgroundColor: '#d946ef',
        shadowColor: '#d946ef',
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
    },

    nextButtonInactive: {
        backgroundColor: 'rgba(217,70,239,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(217,70,239,0.2)',
    },

    nextButtonText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        color: '#fff',
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(29,11,31,0.15)',
    },
});
