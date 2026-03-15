import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BreathingBackground } from '../../components/BreathingBackground';
import { TimeValue, TimeWheelPicker } from '../../components/TimeWheelPicker';
import { AppColors } from '../../constants/Colors';
import { requestNotificationPermissions, scheduleManifestationNotifications } from '../../services/notificationService';
import { useOnboardingStore } from '../../store/onboardingStore';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 3;

type HeaderProps = {
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
};

const Header = memo(({ currentStep, totalSteps, onBack }: HeaderProps) => (
    <View style={styles.header}>
        {currentStep > 1 ? (
            <TouchableOpacity
                onPress={onBack}
                style={{ padding: 8, marginRight: 8, marginLeft: -8 }}
            >
                <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
        ) : (
            <View style={{ width: 28, marginRight: 8, marginLeft: -8 }} />
        )}
        <View style={styles.progressBarContainer}>
            <View
                style={[styles.progressBar, { width: `${(currentStep / totalSteps) * 100}%` }]}
            />
        </View>
    </View>
));

type FooterProps = {
    footerText: string;
    isValid: boolean;
    isLastStep: boolean;
    onNext: () => void;
};

const Footer = memo(({ footerText, isValid, isLastStep, onNext }: FooterProps) => (
    <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
            <Text style={styles.footerText}>{footerText}</Text>
        </View>
        <TouchableOpacity
            onPress={onNext}
            style={[
                styles.nextButton,
                isValid ? styles.nextButtonActive : styles.nextButtonInactive
            ]}
        >
            <Text style={[
                styles.nextButtonText,
                isValid ? { color: '#ffffff' } : { color: 'rgba(255,255,255,0.3)' }
            ]}>
                {isLastStep ? 'Complete' : 'Next'}
            </Text>
        </TouchableOpacity>
    </View>
));

type StepOneProps = {
    username: string;
    onChangeUsername: (value: string) => void;
};

const StepOne = memo(({ username, onChangeUsername }: StepOneProps) => (
    <View style={styles.stepContainer}>
        <View style={styles.questionContainer}>
            <Text style={styles.questionText} numberOfLines={2}>
                What should we call you?
            </Text>
        </View>

        <View style={styles.inputWrapper}>
            <TextInput
                value={username}
                onChangeText={onChangeUsername}
                placeholder="Enter your preferred name"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                style={styles.input}
                autoFocus
                maxLength={10}
                returnKeyType="done"
            />
            <View style={styles.helperRow}>
                <Text style={styles.helperText}>
                    Choose a name 3-10 characters long
                </Text>
                <Text style={[styles.helperText, { color: username.length >= 10 ? '#fb923c' : '#9ca3af' }]}>
                    {username.length}/10
                </Text>
            </View>
        </View>
    </View>
));

type StepTwoProps = {
    wakeTime: TimeValue;
    sleepTime: TimeValue;
    onChangeWake: (value: TimeValue) => void;
    onChangeSleep: (value: TimeValue) => void;
};

const StepTwo = memo(({ wakeTime, sleepTime, onChangeWake, onChangeSleep }: StepTwoProps) => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        // Increase delay even further to 500ms for absolute stability on Android
        const timer = setTimeout(() => setIsMounted(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.stepContainer}>
            <View style={styles.questionContainer}>
                <Text style={styles.questionText}>
                    Your daily rhythm
                </Text>
            </View>

            {isMounted ? (
                <>
                    <Animated.View entering={FadeInRight.duration(400)} style={styles.timeSection}>
                        <Text style={styles.timeSectionLabel}>Wake up time</Text>
                        <TimeWheelPicker value={wakeTime} onChange={onChangeWake} />
                    </Animated.View>

                    <Animated.View entering={FadeInRight.delay(100).duration(400)} style={styles.timeSection}>
                        <Text style={styles.timeSectionLabel}>Sleep time</Text>
                        <TimeWheelPicker value={sleepTime} onChange={onChangeSleep} />
                    </Animated.View>
                </>
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[styles.helperText, { fontSize: 16 }]}>Preparing your rhythm...</Text>
                </View>
            )}
        </View>
    );
}, (prev, next) =>
    prev.wakeTime.hour === next.wakeTime.hour &&
    prev.wakeTime.minute === next.wakeTime.minute &&
    prev.wakeTime.ampm === next.wakeTime.ampm &&
    prev.sleepTime.hour === next.sleepTime.hour &&
    prev.sleepTime.minute === next.sleepTime.minute &&
    prev.sleepTime.ampm === next.sleepTime.ampm
);

type StepThreeProps = {
    manifestTime: TimeValue;
    onChangeManifest: (value: TimeValue) => void;
};

const StepThree = memo(({ manifestTime, onChangeManifest }: StepThreeProps) => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        // Increase delay even further to 500ms for absolute stability on Android (matching StepTwo)
        const timer = setTimeout(() => setIsMounted(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.stepContainer}>
            <View style={styles.questionContainer}>
                <Text style={styles.questionText}>
                    Your manifestation
                </Text>
            </View>
            {isMounted ? (
                <Animated.View entering={FadeInRight.duration(400)} style={styles.timeSection}>
                    <Text style={styles.timeSectionLabel}>Manifestation time</Text>
                    <TimeWheelPicker value={manifestTime} onChange={onChangeManifest} />
                </Animated.View>
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[styles.helperText, { fontSize: 16 }]}>Setting up your profile...</Text>
                </View>
            )}
        </View>
    );
}, (prev, next) =>
    prev.manifestTime.hour === next.manifestTime.hour &&
    prev.manifestTime.minute === next.manifestTime.minute &&
    prev.manifestTime.ampm === next.manifestTime.ampm
);

// Helper: convert 12-hour TimeValue to "HH:MM" 24-hour string
const timeValueTo24h = (val: { hour: string; minute: string; ampm: 'AM' | 'PM' }): string => {
    let hour = parseInt(val.hour, 10);
    if (val.ampm === 'PM' && hour !== 12) hour += 12;
    if (val.ampm === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${val.minute}`;
};

export default function Questionnaire() {
    const router = useRouter();
    const setOnboardingUserData = useOnboardingStore((s) => s.setUserData);
    const [currentStep, setCurrentStep] = useState(1);

    // Form State
    const [username, setUsername] = useState('');
    const [wakeTime, setWakeTime] = useState<TimeValue>({ hour: '07', minute: '00', ampm: 'AM' });
    const [sleepTime, setSleepTime] = useState<TimeValue>({ hour: '11', minute: '00', ampm: 'PM' });
    const [manifestTime, setManifestTime] = useState<TimeValue>({ hour: '10', minute: '00', ampm: 'AM' });
    const [isProcessing, setIsProcessing] = useState(false);

    // Use refs to access current values without recreating callbacks
    const wakeTimeRef = useRef(wakeTime);
    const sleepTimeRef = useRef(sleepTime);
    const manifestTimeRef = useRef(manifestTime);
    const usernameRef = useRef(username);

    wakeTimeRef.current = wakeTime;
    sleepTimeRef.current = sleepTime;
    manifestTimeRef.current = manifestTime;
    usernameRef.current = username;

    const isStepValid = useCallback(() => {
        if (currentStep === 1) return usernameRef.current.length >= 3 && usernameRef.current.length <= 10;
        if (currentStep === 2) return true;
        if (currentStep === 3) return true;
        return false;
    }, [currentStep]);

    const handleNext = useCallback(async () => {
        if (!isStepValid() || isProcessing) {
            return;
        }

        setIsProcessing(true);
        try {
            if (currentStep < TOTAL_STEPS) {
                setCurrentStep(currentStep + 1);
            } else {
                // Convert TimeValues to 24-hour strings and save to onboarding store
                const wake24 = timeValueTo24h(wakeTimeRef.current);
                const sleep24 = timeValueTo24h(sleepTimeRef.current);
                const manifest24 = timeValueTo24h(manifestTimeRef.current);

                setOnboardingUserData({
                    username: usernameRef.current,
                    wakeTime: wake24,
                    sleepTime: sleep24,
                    manifestTime: manifest24,
                });

                console.log('Onboarding data saved to store:', {
                    username: usernameRef.current,
                    wake24, sleep24, manifest24,
                });

                // Schedule Notifications
                try {
                    const hasPermission = await requestNotificationPermissions();
                    if (hasPermission) {
                        const parseTime = (val: TimeValue) => {
                            let hour = parseInt(val.hour);
                            if (val.ampm === 'PM' && hour !== 12) hour += 12;
                            if (val.ampm === 'AM' && hour === 12) hour = 0;
                            return { hour, minute: parseInt(val.minute) };
                        };

                        await scheduleManifestationNotifications({
                            wakeTime: parseTime(wakeTimeRef.current),
                            sleepTime: parseTime(sleepTimeRef.current),
                            manifestTime: parseTime(manifestTimeRef.current),
                        });
                    }
                } catch (err) {
                    console.error("Failed to schedule notifications", err);
                }

                router.push('/onboarding/goals');
            }
        } catch (err) {
            console.error("Error in handleNext:", err);
        } finally {
            // Delay resetting to prevent quick double taps even after processing
            setTimeout(() => setIsProcessing(false), 500);
        }
    }, [currentStep, isStepValid, router, isProcessing]);

    const handleBack = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    }, [currentStep, router]);

    // Stable callbacks that never change
    const handleUsernameChange = useCallback((value: string) => {
        setUsername(value);
    }, []);

    const handleWakeTimeChange = useCallback((value: TimeValue) => {
        setWakeTime(value);
    }, []);

    const handleSleepTimeChange = useCallback((value: TimeValue) => {
        setSleepTime(value);
    }, []);

    const handleManifestTimeChange = useCallback((value: TimeValue) => {
        setManifestTime(value);
    }, []);

    const renderStepContent = useCallback(() => {
        switch (currentStep) {
            case 1:
                return <StepOne username={username} onChangeUsername={handleUsernameChange} />;
            case 2:
                return (
                    <StepTwo
                        wakeTime={wakeTime}
                        sleepTime={sleepTime}
                        onChangeWake={handleWakeTimeChange}
                        onChangeSleep={handleSleepTimeChange}
                    />
                );
            case 3:
                return <StepThree manifestTime={manifestTime} onChangeManifest={handleManifestTimeChange} />;
            default:
                return null;
        }
    }, [
        currentStep,
        username,
        wakeTime,
        sleepTime,
        manifestTime,
        handleUsernameChange,
        handleWakeTimeChange,
        handleSleepTimeChange,
        handleManifestTimeChange,
    ]);

    const footerText = useMemo(() => {
        if (currentStep === 1) {
            return "Your manifestation journey begins with a name that resonates with your true self.";
        }
        if (currentStep === 2) {
            return "Your daily rhythm helps us personalize your manifestation experience.";
        }
        if (currentStep === 3) {
            return "Pick a time when your intention feels most powerful.";
        }
        return "";
    }, [currentStep]);

    return (
        <View style={[styles.screen, { backgroundColor: AppColors.black }]}>
            <StatusBar barStyle="light-content" />

            {/* Breathing Purple Background */}
            <BreathingBackground
                colors={AppColors.gradients.purple}
                opacity={0.7}
            />

            {/* Subtle overlay for depth */}
            <View style={styles.overlay} pointerEvents="none" />

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[styles.container, { backgroundColor: 'transparent' }]}
                >
                    <Header currentStep={currentStep} totalSteps={TOTAL_STEPS} onBack={handleBack} />

                    {/* Animated Content Area */}
                    <View style={styles.contentArea}>
                        <Animated.View
                            key={currentStep}
                            entering={FadeInRight.duration(300)}
                            exiting={FadeOutLeft.duration(150)}
                            style={{ flex: 1 }}
                        >
                            {renderStepContent()}
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>

                {/* Footer */}
                <Footer
                    footerText={footerText}
                    isValid={isStepValid()}
                    isLastStep={currentStep === TOTAL_STEPS}
                    onNext={handleNext}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 10,
    },
    progressBarContainer: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#fb923c', // Orange-400
        borderRadius: 2,
    },
    contentArea: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 10,
    },
    stepContainer: {
        width: '100%',
        alignItems: 'flex-start',
    },
    questionContainer: {
        marginBottom: 20,
    },
    questionText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 28,
        color: '#fff',
        marginBottom: 12,
        lineHeight: 46,
        textShadowColor: 'rgba(251, 146, 60, 0.3)', // subtle orange shadow
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    belowText: {
        fontFamily: 'Comfortaa_400Regular',
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 20,
    },
    inputWrapper: {
        width: '100%',
    },
    input: {
        fontFamily: 'Comfortaa_500Medium',
        width: '100%',
        color: '#fff',
        textAlign: 'left',
        fontSize: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    helperRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    helperText: {
        fontFamily: 'Comfortaa_400Regular',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '500',
    },
    optionsContainer: {
        width: '100%',
        gap: 16,
    },
    optionButton: {
        width: '100%',
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.05)', // Very clear glass
    },
    optionSelected: {
        backgroundColor: 'rgba(0,0,0,0.6)', // Darker background to isolate from gradient
        borderColor: '#fb923c', // Orange
    },
    optionUnselected: {
        borderColor: 'rgba(255,255,255,0.1)',
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fb923c',
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'Comfortaa_500Medium',
        letterSpacing: 0.5,
    },
    timeSection: {
        width: '100%',
        marginBottom: 20,
    },
    timeSectionLabel: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 10,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    footer: {
        width: '100%',
        paddingHorizontal: 32,
        paddingBottom: 40,
    },
    footerTextContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: 'Comfortaa_400Regular',
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    nextButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        color: '#ffffff',
        alignItems: 'center',
    },
    nextButtonActive: {
        backgroundColor: '#fb923c', // Orange button
        shadowColor: '#fb923c',
        shadowOffset: { width: 0, height: 0 },
        fontWeight: '700',
        shadowOpacity: 0.3,
        color: '#ffffff',
        shadowRadius: 10,
    },
    nextButtonInactive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    nextButtonText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 1.5,
        color: '#ffffff',
        textTransform: 'uppercase',
    },

    // Time Selector Styles
    timePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 16,
        height: 180,
        marginHorizontal: 4,
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    timePickerColumn: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
    },
    timePickerMask: {
        height: '100%',
        width: 100,
        position: 'relative',
        overflow: 'hidden',
    },
    timePickerScroll: {
        height: '100%',
    },
    timePickerSpacer: {
        height: 60,
    },
    timePickerItem: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timePickerText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 22,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    timePickerTextSelected: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: '700',
        textShadowColor: '#fb923c',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    timePickerTextUnselected: {
        color: 'rgba(255, 255, 255, 0.25)',
        fontSize: 20,
    },

    // Selected Time Display
    selectedTimeDisplay: {
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    selectedTimeLabel: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 12,
        textAlign: 'center',
    },
    selectedTimeBox: {
        backgroundColor: 'rgba(251, 146, 60, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(251, 146, 60, 0.3)',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
    },
    selectedTimeText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 20,
        color: '#fb923c',
        letterSpacing: 1,
        textAlign: 'center',
    },
});
