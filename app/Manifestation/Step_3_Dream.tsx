import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Step_3_Dream = ({ onComplete }: { onComplete?: () => void }) => {
    const [dreamScript, setDreamScript] = useState('');
    const insets = useSafeAreaInsets();

    const handleNext = () => {
        if (!dreamScript.trim()) {
            return;
        }
        Keyboard.dismiss();
        setTimeout(() => {
            onComplete?.();
        }, 300);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <Animated.View entering={FadeInDown.duration(600)} style={styles.headerArea}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="journal-outline" size={32} color="#fb923c" />
                            </View>
                            <Text style={styles.title}>The Dream Script</Text>
                            <Text style={styles.subtitle}>
                                Write down exactly what you just visualized. Write it in the present tense, as if you are already living it right now.
                            </Text>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.inputWrapper}>
                            <BlurView intensity={30} tint="dark" style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    multiline
                                    placeholder="I am so happy and grateful now that..."
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={dreamScript}
                                    onChangeText={setDreamScript}
                                    textAlignVertical="top"
                                    autoFocus
                                />
                            </BlurView>
                        </Animated.View>

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <Animated.View entering={FadeInUp.delay(400).duration(600)} style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                        <TouchableOpacity
                            style={[
                                styles.nextButton,
                                !dreamScript.trim() && styles.nextButtonDisabled
                            ]}
                            onPress={handleNext}
                            disabled={!dreamScript.trim()}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.nextButtonText}>Complete Step</Text>
                            <Ionicons name="arrow-forward" size={20} color={dreamScript.trim() ? '#000' : 'rgba(255,255,255,0.3)'} />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 40,
        flexGrow: 1,
    },
    headerArea: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(251, 146, 60, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(251, 146, 60, 0.3)',
    },
    title: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: 32,
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    inputWrapper: {
        width: '100%',
        minHeight: 250,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputContainer: {
        flex: 1,
        padding: 20,
    },
    textInput: {
        flex: 1,
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 16,
        color: '#fff',
        lineHeight: 28,
        minHeight: 250,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 20,
        backgroundColor: 'transparent',
    },
    nextButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#fb923c',
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#fb923c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    nextButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        shadowOpacity: 0,
        elevation: 0,
    },
    nextButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#000',
        letterSpacing: 1,
    },
});

export default Step_3_Dream;
