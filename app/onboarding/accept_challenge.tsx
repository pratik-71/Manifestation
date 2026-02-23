import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';

const { width } = Dimensions.get('window');

export default function AcceptChallenge() {
    const router = useRouter();
    const signatureRef = useRef<SignatureViewRef>(null);
    const [hasSigned, setHasSigned] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSignature = (signature: string) => {
        if (isProcessing) return;
        setIsProcessing(true);
        console.log("Signature captured");
        router.replace('/onboarding/google_signin');
        setTimeout(() => setIsProcessing(false), 1000);
    };

    const handleEmpty = () => {
        console.log("Empty signature");
        setHasSigned(false);
    };

    const handleClear = () => {
        signatureRef.current?.clearSignature();
        setHasSigned(true); // Small hack to reset state
        setTimeout(() => setHasSigned(false), 50);
    };

    const handleEnd = () => {
        setHasSigned(true);
    };

    const handleOK = () => {
        signatureRef.current?.readSignature();
    };

    // Custom CSS for the signature canvas to make it black with white ink
    const style = `
        .m-signature-pad { 
            box-shadow: none; 
            border: none; 
            background-color: #000; 
        }
        .m-signature-pad--body { 
            border: none;
            background-color: #000;
        }
        .m-signature-pad--footer { 
            display: none; 
            margin: 0px; 
        }
        body, html { 
            background-color: #000; 
        }
    `;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Deep Emerald Gradient - Black -> Deep Emerald */}
            <LinearGradient
                colors={['#000000', '#022c22', '#064e3b']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1.2 }}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => !isProcessing && router.back()}
                        disabled={isProcessing}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.titleContainer}>
                        <Text style={styles.title}>Commit Yourself</Text>
                        <Text style={styles.subtitle}>
                            Sign below to accept this challenge and begin your journey to making your dreams a reality.
                        </Text>
                    </Animated.View>

                    {/* Professional Signature Canvas */}
                    <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.canvasContainer}>
                        <View style={styles.canvasWrapper}>
                            <SignatureScreen
                                ref={signatureRef}
                                onEnd={handleEnd}
                                onOK={handleSignature}
                                onEmpty={handleEmpty}
                                bgWidth={width - 64}
                                bgHeight={(width - 64) / 1.3}
                                webStyle={style}
                                penColor="#ffffff"
                                backgroundColor="#000000"
                                scrollable={false}
                            />

                            {!hasSigned && (
                                <View style={styles.placeholderContainer} pointerEvents="none">
                                    <Text style={styles.placeholderText}>Sign on the line</Text>
                                    <View style={styles.signatureLine} />
                                </View>
                            )}
                        </View>

                        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                            <Ionicons name="refresh" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                            <Text style={styles.clearButtonText}>RESET</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={styles.instructionContainer}>
                        <Ionicons name="shield-checkmark" size={18} color="#10b981" />
                        <Text style={styles.instructionText}>Your privacy is protected. Signature is only stored on your mobile phone only.</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={() => {
                            if (hasSigned && !isProcessing) {
                                handleOK();
                            }
                        }}
                        disabled={!hasSigned || isProcessing}
                        style={[
                            styles.completeButton,
                            hasSigned && !isProcessing ? styles.buttonActive : styles.buttonInactive
                        ]}
                    >
                        <Text style={[
                            styles.completeButtonText,
                            { color: hasSigned ? '#fff' : 'rgba(255,255,255,0.3)' }
                        ]}>
                            Confirm Commitment
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 30,
    },
    titleContainer: {
        marginBottom: 30,
    },
    title: {
        fontFamily: 'CormorantGaramond_600SemiBold',
        fontSize: 32,
        color: '#fff',
        lineHeight: 48,
        marginBottom: 12,
    },
    subtitle: {
        fontFamily: 'CormorantGaramond_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 26,
    },
    canvasContainer: {
        width: '100%',
        aspectRatio: 1.3,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    canvasWrapper: {
        flex: 1,
        backgroundColor: '#000',
    },
    placeholderContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1, // Behind the canvas but shows through if canvas is transparent or handled
    },
    placeholderText: {
        fontFamily: 'CormorantGaramond_400Regular',
        fontSize: 20,
        color: '#fff',
        fontStyle: 'italic',
        marginBottom: 8,
        opacity: 0.2,
    },
    signatureLine: {
        width: '80%',
        height: 1,
        backgroundColor: '#fff',
        opacity: 0.1,
    },
    instructionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        paddingHorizontal: 4,
    },
    instructionText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        marginLeft: 8,
        fontFamily: 'CormorantGaramond_400Regular',
    },
    clearButton: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    footer: {
        paddingHorizontal: 32,
        paddingBottom: 40,
    },
    completeButton: {
        width: '100%',
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonActive: {
        backgroundColor: '#10b981',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonInactive: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    completeButtonText: {
        fontFamily: 'CormorantGaramond_600SemiBold',
        fontSize: 16,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
});
