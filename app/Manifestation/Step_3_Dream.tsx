import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BreathingBackground } from '../../components/BreathingBackground';

const { width } = Dimensions.get('window');

const Step_3_Dream = ({ onComplete }: { onComplete?: () => void }) => {
    return (
        <View style={styles.container}>
            {/* Elegant ambient background replacing the orbs */}
            <BreathingBackground
                colors={['#000000', '#09081a', '#170b36', '#320b1b']}
                opacity={0.6}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.inner}>
                    <View style={styles.content}>
                        <Animated.View entering={FadeInDown.duration(800)} style={styles.headerArea}>
                            <Text style={styles.title}>The Stage Is Yours</Text>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(300).duration(1000)} style={styles.promptWrapper}>
                            <Text style={styles.promptText}>
                                Close your eyes.{'\n\n'}
                                Imagine lakhs of people are watching you.{'\n\n'}
                                Share your success story with them.{'\n\n'}
                                Let the feeling wash over you.
                            </Text>
                        </Animated.View>
                    </View>

                    <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.footer}>
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={() => onComplete?.()}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.nextButtonText}>I Have Shared My Story</Text>
                            <Ionicons name="sparkles" size={20} color="#000" />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#02010a',
    },
    safeArea: {
        flex: 1,
    },
    inner: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    headerArea: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: Math.min(width * 0.09, 36),
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    promptWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    promptText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: Math.min(width * 0.042, 17),
        color: 'rgba(255,255,255,0.85)',
        lineHeight: Math.min(width * 0.08, 30),
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    footer: {
        paddingHorizontal: 30,
        paddingBottom: 10,
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
    nextButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 15,
        color: '#000',
        letterSpacing: 1,
    },
});

export default Step_3_Dream;
