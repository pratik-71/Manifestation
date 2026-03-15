import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { BreathingBackground } from '../components/BreathingBackground';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RecordFuture() {
    const router = useRouter();
    const cameraRef = useRef<CameraView>(null);

    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
    const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();

    const [isRecording, setIsRecording] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [recordTime, setRecordTime] = useState(0);
    const [facing, setFacing] = useState<'front' | 'back'>('front');

    const pulseAnim = useSharedValue(1);

    useEffect(() => {
        let interval: any;
        if (isRecording) {
            pulseAnim.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
            interval = setInterval(() => {
                setRecordTime(prev => prev + 1);
            }, 1000);
        } else {
            pulseAnim.value = 1;
            setRecordTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseAnim.value }],
    }));

    const [flashProgress, setFlashProgress] = useState(0);

    if (!cameraPermission || !microphonePermission || !mediaLibraryPermission) {
        // Permissions are still loading
        return (
            <View style={styles.loadingContainer}>
                <BreathingBackground colors={['#0f172a', '#1c1917', '#451a03']} opacity={0.8} />
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (!cameraPermission.granted || !microphonePermission.granted || !mediaLibraryPermission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <StatusBar barStyle="light-content" />
                <BreathingBackground colors={['#050505', '#1e1b4b', '#450a0a']} opacity={1} />
                
                <SafeAreaView style={styles.permissionSafe}>
                    <Animated.View entering={FadeInDown.duration(1000)} style={styles.permissionHeader}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="videocam" size={40} color="#fbbf24" />
                        </View>
                        <Text style={styles.permissionTitle}>Record Your Future</Text>
                        <Text style={styles.permissionSubtitle}>A video message for the person you want to become.</Text>
                    </Animated.View>

                    <Animated.View entering={FadeIn.delay(500).duration(1000)} style={styles.permissionCardContainer}>
                        <BlurView intensity={30} tint="dark" style={styles.permissionCard}>
                            <View style={styles.permissionRow}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="videocam" size={20} color="#8b5cf6" />
                                </View>
                                <View style={styles.permissionInfo}>
                                    <Text style={styles.permissionItemTitle}>Camera Access</Text>
                                    <Text style={styles.permissionItemText}>We need your camera to record your video.</Text>
                                </View>
                            </View>
                            
                            <View style={styles.permissionRow}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="mic" size={20} color="#ec4899" />
                                </View>
                                <View style={styles.permissionInfo}>
                                    <Text style={styles.permissionItemTitle}>Voice Recording</Text>
                                    <Text style={styles.permissionItemText}>We need your microphone to record your voice.</Text>
                                </View>
                            </View>

                            <View style={styles.permissionRow}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="images" size={20} color="#f59e0b" />
                                </View>
                                <View style={styles.permissionInfo}>
                                    <Text style={styles.permissionItemTitle}>Save to Phone</Text>
                                    <Text style={styles.permissionItemText}>Save your video directly to your photo gallery.</Text>
                                </View>
                            </View>
                        </BlurView>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(800).duration(1000)} style={styles.permissionFooter}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={async () => {
                                await requestCameraPermission();
                                await requestMicrophonePermission();
                                await requestMediaLibraryPermission();
                            }}
                            style={styles.mainActionButton}
                        >
                            <LinearGradient
                                colors={['#8b5cf6', '#d946ef', '#f97316']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.actionGradient}
                            >
                                <Text style={styles.actionButtonText}>I'M READY</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.secondaryActionButton}
                        >
                            <Text style={styles.secondaryActionText}>Not Now</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </SafeAreaView>
            </View>
        );
    }

    const toggleFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const startRecording = async () => {
        if (!cameraRef.current) return;
        setIsRecording(true);
        try {
            const video = await cameraRef.current.recordAsync({
                maxDuration: 60 * 5, // 5 minutes max
            });
            setIsRecording(false);
            if (video?.uri) {
                saveVideo(video.uri);
            }
        } catch (error) {
            console.error("Recording error:", error);
            setIsRecording(false);
            Alert.alert("Error", "Failed to record video.");
        }
    };

    const stopRecording = () => {
        if (!cameraRef.current) return;
        cameraRef.current.stopRecording();
        setFlashProgress(1);
        setTimeout(() => {
            setFlashProgress(0);
        }, 150);
    };

    const saveVideo = async (uri: string) => {
        setIsSaving(true);
        try {
            const dir = `${FileSystem.documentDirectory}future_messages/`;
            const info = await FileSystem.getInfoAsync(dir);
            if (!info.exists) {
                await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
            }

            const fileName = `message_${Date.now()}.mp4`;
            const newPath = `${dir}${fileName}`;
            
            // Move file to our app folder
            await FileSystem.moveAsync({
                from: uri,
                to: newPath
            });

            // Keep track of the latest for quick access
            await FileSystem.copyAsync({
                from: newPath,
                to: `${dir}latest_message.mp4`
            });

            setShowSuccessModal(true);
        } catch (error) {
            console.error("Saving error:", error);
            Alert.alert("Error", "Failed to save your message internally.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView 
                style={styles.camera} 
                facing={facing} 
                mode="video"
                ref={cameraRef}
            >
                <SafeAreaView style={styles.overlay}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} disabled={isRecording}>
                            <Ionicons name="close" size={28} color={isRecording ? 'transparent' : '#fff'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleFacing} style={styles.flipButton} disabled={isRecording}>
                            <Ionicons name="camera-reverse-outline" size={28} color={isRecording ? 'transparent' : '#fff'} />
                        </TouchableOpacity>
                    </View>

                    {/* Prompt Text */}
                    {!isRecording && !isSaving && (
                        <Animated.View entering={FadeInUp.duration(1200)} style={styles.promptContainer}>
                            <BlurView intensity={20} tint="dark" style={styles.promptGlass}>
                                <Text style={styles.promptTitle}>Talk to Your Future Self</Text>
                                <Text style={styles.promptText}>
                                    Imagine you've already hit your goals. You're living the life you always wanted.{'\n\n'}
                                    Talk to the camera as if it's already happened. Tell yourself <Text style={styles.boldText}>how it feels</Text>, what your life looks like now, the cars, the house, and your success.{'\n\n'}
                                    Be specific and <Text style={styles.highlightText}>speak with confidence</Text>.
                                </Text>
                            </BlurView>
                            <View style={styles.confidenceBadge}>
                                <Ionicons name="shield-checkmark" size={14} color="#34d399" />
                                <Text style={styles.confidenceText}>YOU CAN DO THIS</Text>
                            </View>
                        </Animated.View>
                    )}

                    {/* Recording UI Enhancements */}
                    {isRecording && (
                        <>
                            <View style={styles.viewfinderCornerTL} />
                            <View style={styles.viewfinderCornerTR} />
                            <View style={styles.viewfinderCornerBL} />
                            <View style={styles.viewfinderCornerBR} />
                            
                            <View style={styles.recordingHeader}>
                                <Animated.View style={[styles.redDot, pulseStyle]} />
                                <Text style={styles.recordingText}>Recording {formatTime(recordTime)}</Text>
                            </View>
                        </>
                    )}

                    {/* Controls Footer */}
                    <View style={styles.footer}>
                        {isSaving ? (
                            <View style={styles.savingContainer}>
                                <ActivityIndicator size="large" color="#f97316" />
                                <Text style={styles.savingText}>Processing Video...</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.recordButtonOuter}
                                onPress={isRecording ? stopRecording : startRecording}
                            >
                                <Animated.View style={[
                                    styles.recordButtonInner, 
                                    isRecording ? { borderRadius: 10, width: 32, height: 32 } : {},
                                    isRecording ? pulseStyle : {}
                                ]} />
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>

                {/* Flash Effect */}
                {flashProgress > 0 && (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: flashProgress }]} />
                )}
            </CameraView>

            {/* Success Modal */}
            <Modal
                transparent
                visible={showSuccessModal}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <Animated.View 
                        entering={FadeInDown.springify()}
                        style={styles.successCard}
                    >
                        <View style={styles.successIconContainer}>
                            <Ionicons name="checkmark-circle" size={80} color="#34d399" />
                        </View>
                        
                        <Text style={styles.successTitle}>Message Saved!</Text>
                        <Text style={styles.successText}>
                            Your video has been saved in your app records.
                        </Text>

                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => {
                                setShowSuccessModal(false);
                                router.back();
                            }}
                        >
                            <LinearGradient
                                colors={['#8b5cf6', '#d946ef']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.doneGradient}
                            >
                                <Text style={styles.doneButtonText}>AWESOME</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#050505',
    },
    permissionSafe: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
    },
    permissionHeader: {
        alignItems: 'center',
        marginTop: 20,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
        marginBottom: 24,
    },
    permissionTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 28,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    permissionSubtitle: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    permissionCardContainer: {
        marginVertical: 40,
    },
    permissionCard: {
        borderRadius: 32,
        overflow: 'hidden',
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    permissionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 20,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    permissionInfo: {
        flex: 1,
    },
    permissionItemTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 15,
        color: '#fff',
        marginBottom: 4,
    },
    permissionItemText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 18,
    },
    permissionFooter: {
        width: '100%',
        gap: 16,
        marginBottom: 20,
    },
    mainActionButton: {
        width: '100%',
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#d946ef',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    actionGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    actionButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 18,
        color: '#fff',
        letterSpacing: 2,
    },
    secondaryActionButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    secondaryActionText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.4)', 
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    flipButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    promptContainer: {
        paddingHorizontal: 24,
        alignItems: 'center',
        position: 'absolute',
        top: '20%',
        width: '100%',
    },
    promptGlass: {
        width: '100%',
        padding: 24,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
    },
    promptTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    promptText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 24,
    },
    boldText: {
        fontFamily: 'Comfortaa_700Bold',
        color: '#fff',
    },
    highlightText: {
        color: '#fbbf24',
        fontFamily: 'Comfortaa_700Bold',
    },
    confidenceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.3)',
    },
    confidenceText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
        color: '#34d399',
        letterSpacing: 2,
    },
    recordingHeader: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 70 : 100,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    redDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
    recordingText: {
        fontFamily: 'Comfortaa_700Bold',
        color: '#fff',
        fontSize: 10,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    footer: {
        paddingBottom: 50,
        alignItems: 'center',
    },
    recordButtonOuter: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    recordButtonInner: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#ef4444',
    },
    savingContainer: {
        alignItems: 'center',
        gap: 16,
    },
    savingText: {
        fontFamily: 'Comfortaa_700Bold',
        color: '#fff',
        fontSize: 16,
        letterSpacing: 1,
    },
    // New Styles
    viewfinderCornerTL: {
        position: 'absolute',
        top: 40,
        left: 40,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: 'rgba(255,255,255,0.6)',
        borderTopLeftRadius: 10,
    },
    viewfinderCornerTR: {
        position: 'absolute',
        top: 40,
        right: 40,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: 'rgba(255,255,255,0.6)',
        borderTopRightRadius: 10,
    },
    viewfinderCornerBL: {
        position: 'absolute',
        bottom: 120,
        left: 40,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: 'rgba(255,255,255,0.6)',
        borderBottomLeftRadius: 10,
    },
    viewfinderCornerBR: {
        position: 'absolute',
        bottom: 120,
        right: 40,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: 'rgba(255,255,255,0.6)',
        borderBottomRightRadius: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    successCard: {
        width: width * 0.85,
        backgroundColor: '#121212',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#222',
    },
    successIconContainer: {
        marginBottom: 20,
    },
    successTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    successText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 15,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    doneButton: {
        width: '100%',
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
    },
    doneGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#fff',
        letterSpacing: 2,
    },
});
