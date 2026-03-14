import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Step_3_Dream = ({ onComplete }: { onComplete?: () => void }) => {
    const [dreamText, setDreamText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleNext = () => {
        if (dreamText.trim().length < 5) {
            return;
        }
        setIsSaving(true);
        // We could save this to AsyncStorage if needed, for now just move to next
        setTimeout(() => {
            setIsSaving(false);
            onComplete?.();
        }, 600);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                    <Text style={styles.subtitle}>Script your vision in the present tense, as if it is happening right now.</Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300)} style={styles.content}>
                    <BlurView intensity={12} tint="light" style={styles.inputGlass}>
                        <TextInput
                            style={styles.input}
                            placeholder="I am so grateful now that..."
                            placeholderTextColor="rgba(255, 255, 255, 0.2)"
                            multiline
                            textAlignVertical="top"
                            value={dreamText}
                            onChangeText={setDreamText}
                            cursorColor="#FCD34D"
                        />
                    </BlurView>

                    <View style={styles.guidanceContainer}>
                        <Ionicons name="sparkles-outline" size={16} color="#FCD34D" />
                        <Text style={styles.guidanceText}>
                            Use words like "I am", "I feel", and "I have".
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextBtn, dreamText.trim().length < 5 && styles.nextBtnDisabled]}
                    onPress={handleNext}
                    activeOpacity={0.9}
                    disabled={isSaving || dreamText.trim().length < 5}
                >
                    <LinearGradient
                        colors={['#F59E0B', '#D97706']}
                        style={styles.gradientBtn}
                    >
                        <Text style={styles.nextBtnText}>{isSaving ? 'Processing...' : "Lock in Vision"}</Text>
                        <Ionicons name="arrow-forward" size={18} color="white" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.skipStepBtn}
                    onPress={onComplete}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipStepText}>Continue to Goals</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: width < 380 ? 16 : 18,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 28,
        fontFamily: 'Comfortaa_500Medium',
    },
    content: {
        marginVertical: 4,
    },
    inputGlass: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        minHeight: height * 0.45,
        padding: 24,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Comfortaa_400Regular',
        lineHeight: 28,
    },
    guidanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
    },
    guidanceText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        fontFamily: 'Comfortaa_400Regular',
        marginBottom:12
    },
    footer: {
        width: '100%',
        gap: 12,
        paddingHorizontal: 24,
        paddingBottom: 30,
    },
    nextBtn: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    nextBtnDisabled: {
        opacity: 0.5,
    },
    gradientBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    nextBtnText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Comfortaa_700Bold',
        letterSpacing: 1,
    },
    skipStepBtn: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    skipStepText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.3)',
        fontFamily: 'Comfortaa_500Medium',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

export default Step_3_Dream;
