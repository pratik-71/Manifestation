import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BreathingBackground } from '../../components/BreathingBackground';

// Import our step components
import Step_1_Breath from './Step_1_Breath';
import Step_2_Visualize from './Step_2_Visualize';
import Step_4_Goals from './Step_4_Goals';
import Step_5_Release from './Step_5_Release';

const { height } = Dimensions.get('window');

const ManiHome = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [currentStep, setCurrentStep] = useState(1);

    const stepConfig = {
        1: { title: 'Breathwork', component: Step_1_Breath },
        2: { title: 'Visualization', component: Step_2_Visualize },
        3: { title: 'Daily Goals', component: Step_4_Goals },
        4: { title: 'Final Release', component: Step_5_Release },
    };

    const currentConfig = stepConfig[currentStep as keyof typeof stepConfig];

    const handleStepComplete = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            console.log('Journey Complete!');
            router.replace('/manifestation');
        }
    };

    const renderStep = () => {
        if (currentConfig) {
            const Component = currentConfig.component;
            return <Component onComplete={handleStepComplete} />;
        }
        return (
            <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Next Step Coming Soon...</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={['#050505', '#0A0E1A', '#1A0E0A']} // Midnight -> Void Blue -> Ember Dark
                opacity={0.85}
            />

            <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            if (currentStep > 1) {
                                setCurrentStep(prev => prev - 1);
                            } else {
                                router.back();
                            }
                        }}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back-outline" size={20} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <Text style={styles.headerTitle}>{currentConfig?.title || ''}</Text>
                        <View style={styles.progressContainer}>
                            {[1, 2, 3, 4].map((s) => (
                                <View
                                    key={s}
                                    style={[
                                        styles.progressDot,
                                        s <= currentStep && styles.activeDot,
                                        s === currentStep && styles.pulseDot
                                    ]}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.placeholder_icon} />
                </View>

                {/* Content Area — fills remaining space */}
                <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.contentArea}>
                    {renderStep()}
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a', // Deep dark theme
    },
    safeArea: {
        flex: 1,
    },
    contentArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 16,
    },
    backButton: {
        width: 34,
        height: 34,
        borderRadius: 22,

        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        alignItems: 'center',
    },
    stepIndicator: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        fontFamily: 'Comfortaa_500Medium',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerTitle: {
        fontSize: 14,
        fontFamily: 'Comfortaa_500Medium',
        color: '#FFFFFF',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    progressContainer: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 8,
        alignItems: 'center',
    },
    progressDot: {
        width: 12,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
    },
    activeDot: {
        backgroundColor: 'rgba(252, 211, 77, 0.6)',
        shadowColor: '#FCD34D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 3,
    },
    pulseDot: {
        backgroundColor: '#FCD34D',
        width: 24,
        height: 4,
        borderRadius: 2,
        shadowColor: '#FCD34D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 5,
    },
    placeholder_icon: {
        width: 44,
    },
    scrollContent: {
        paddingBottom: 40,
        minHeight: height * 0.8,
        justifyContent: 'center',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    placeholderText: {
        color: 'white'
    }
});

export default ManiHome;
