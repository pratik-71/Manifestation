import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Linking,
    Modal,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { BreathingBackground } from '../components/BreathingBackground';

const { width } = Dimensions.get('window');

// ─── Choice screen styles (must be before component for Hermes) ───────────────
const choiceStyles = StyleSheet.create({
    safe: {
        flex: 1,
        paddingHorizontal: 26,
        paddingTop: 16,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        paddingVertical: 6,
        marginTop: 22,
        marginBottom: 8,
    },
    backText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.35)',
    },
    hero: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
    },

    heading: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#fff8f0',
        textAlign: 'center',
        letterSpacing: -0.2,
    },
    subheading: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.35)',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: '80%',
    },
    actions: {
        gap: 14,
        marginBottom: 28,
    },
    // PRIMARY — Watch (solid amber)
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#f97316',
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 22,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    primaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 15,
        color: '#fff',
        marginBottom: 2,
    },
    primaryHint: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.65)',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 4,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    dividerText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.18)',
        letterSpacing: 1,
    },
    // SECONDARY — Record (warm amber outline)
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: 'rgba(180,83,9,0.08)',
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: 'rgba(249,115,22,0.35)',
        paddingVertical: 16,
        paddingHorizontal: 22,
    },
    secondaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(249,115,22,0.14)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.3)',
    },
    secondaryLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 15,
        color: '#fff',
        marginBottom: 2,
    },
    secondaryHint: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
    },
    footer: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 11,
        color: 'rgba(255,255,255,0.18)',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
});
// ─────────────────────────────────────────────────────────────────────────────

export default function RecordFuture() {
    const router = useRouter();
    const { fromOnboarding } = useLocalSearchParams<{ fromOnboarding?: string }>();
    const isOnboarding = fromOnboarding === '1';
    const cameraRef = useRef<CameraView>(null);

    const handleDone = () => {
        if (isOnboarding) {
            router.push('/onboarding/accept_challenge');
        } else {
            router.back();
        }
    };

    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
    const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();

    const [isRecording, setIsRecording] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [recordTime, setRecordTime] = useState(0);
    const [facing, setFacing] = useState<'front' | 'back'>('front');

    // Video-exists state
    const [videoExists, setVideoExists] = useState<boolean | null>(null); // null = checking
    const [showCamera, setShowCamera] = useState(false);   // true once user picks "Record New"
    const [watchUri, setWatchUri] = useState<string | null>(null);        // set when watching

    // Permission modal state
    const [modalDismissed, setModalDismissed] = useState(false);
    const wasMissingInitiallyRef = useRef<boolean | null>(null);

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

    // Check whether a saved video already exists (runs after permissions resolved)
    useEffect(() => {
        const allGranted =
            cameraPermission?.granted &&
            microphonePermission?.granted &&
            mediaLibraryPermission?.granted;
        if (!allGranted) return;

        const videoPath = `${FileSystem.documentDirectory}future_messages/latest_message.mp4`;
        FileSystem.getInfoAsync(videoPath).then(info => {
            setVideoExists(info.exists);
            // If no video yet, go straight to camera
            if (!info.exists) setShowCamera(true);
        }).catch(() => {
            setVideoExists(false);
            setShowCamera(true);
        });
    }, [cameraPermission?.granted, microphonePermission?.granted, mediaLibraryPermission?.granted]);

    if (!cameraPermission || !microphonePermission || !mediaLibraryPermission) {
        return (
            <View style={styles.permissionContainer}>
                <BreathingBackground colors={['#02010a', '#0f172a', '#451a03']} opacity={1} />
                <ActivityIndicator size="large" color="#f59e0b" style={{ flex: 1, alignSelf: 'center' }} />
            </View>
        );
    }

    const anyPermissionMissing = !cameraPermission.granted || !microphonePermission.granted || !mediaLibraryPermission.granted;
    
    // Force the modal to stay open if they started with missing permissions, until they click Continue
    if (wasMissingInitiallyRef.current === null) {
        wasMissingInitiallyRef.current = anyPermissionMissing;
    }
    const isModalVisible = (anyPermissionMissing || wasMissingInitiallyRef.current) && !modalDismissed;

    if (isModalVisible) {
        return (
            <Modal visible={isModalVisible} animationType="slide" transparent={false}>
                <View style={styles.permissionContainer}>
                    <StatusBar barStyle="light-content" />
                    <BreathingBackground colors={['#02010a', '#0f172a', '#451a03']} opacity={1} />
                    <View style={styles.permissionOverlay} pointerEvents="none" />

                    <SafeAreaView style={styles.permissionSafe}>
                        <View>
                            <View style={styles.permissionHeader}>
                                <TouchableOpacity onPress={() => router.back()} style={styles.miniBackButton}>
                                    <Ionicons name="chevron-back" size={24} color="#fff" />
                                </TouchableOpacity>

                                {isOnboarding && (
                                    <TouchableOpacity onPress={handleDone} style={styles.skipNav}>
                                        <Text style={styles.skipNavText}>Skip</Text>
                                        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <Animated.View entering={FadeInDown.duration(800)} style={styles.permissionHero}>
                                <View style={styles.heroIconInner}>
                                    <Ionicons name="lock-open-outline" size={28} color="#f59e0b" />
                                </View>
                                <Text style={styles.permissionTitle}>Permissions Needed</Text>
                                <Text style={styles.permissionSubtitle}>
                                    To record your future self, we need access to your camera and audio. We value your privacy above all.
                                </Text>
                            </Animated.View>
                        </View>

                        <Animated.View entering={FadeIn.delay(400).duration(800)} style={styles.instructionCard}>
                            <Text style={styles.instructionHeading}>Permission Checklist:</Text>
                            
                            <View style={styles.permissionReasonRow}>
                                <View style={[styles.permissionIconCircle, cameraPermission.granted && { backgroundColor: 'rgba(52, 211, 153, 0.15)', borderColor: '#34d399' }]}>
                                    <Ionicons name="camera" size={20} color={cameraPermission.granted ? "#34d399" : "#f59e0b"} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.permissionReasonTitle}>Camera Access</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={async () => {
                                        if (!cameraPermission.granted) await requestCameraPermission();
                                    }} 
                                    disabled={cameraPermission.granted}
                                    style={[styles.checklistButton, cameraPermission.granted && styles.checklistButtonGranted]}
                                >
                                    {cameraPermission.granted ? (
                                        <Ionicons name="checkmark" size={20} color="#34d399" />
                                    ) : (
                                        <Text style={styles.checklistButtonText}>Enable</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.permissionReasonRow}>
                                <View style={[styles.permissionIconCircle, microphonePermission.granted && { backgroundColor: 'rgba(52, 211, 153, 0.15)', borderColor: '#34d399' }]}>
                                    <Ionicons name="mic" size={20} color={microphonePermission.granted ? "#34d399" : "#f59e0b"} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.permissionReasonTitle}>Microphone Access</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={async () => {
                                        if (!microphonePermission.granted) await requestMicrophonePermission();
                                    }} 
                                    disabled={microphonePermission.granted}
                                    style={[styles.checklistButton, microphonePermission.granted && styles.checklistButtonGranted]}
                                >
                                    {microphonePermission.granted ? (
                                        <Ionicons name="checkmark" size={20} color="#34d399" />
                                    ) : (
                                        <Text style={styles.checklistButtonText}>Enable</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.permissionReasonRow}>
                                <View style={[styles.permissionIconCircle, mediaLibraryPermission.granted && { backgroundColor: 'rgba(52, 211, 153, 0.15)', borderColor: '#34d399' }]}>
                                    <Ionicons name="images" size={20} color={mediaLibraryPermission.granted ? "#34d399" : "#f59e0b"} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.permissionReasonTitle}>Storage Access</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={async () => {
                                        if (!mediaLibraryPermission.granted) await requestMediaLibraryPermission();
                                    }} 
                                    disabled={mediaLibraryPermission.granted}
                                    style={[styles.checklistButton, mediaLibraryPermission.granted && styles.checklistButtonGranted]}
                                >
                                    {mediaLibraryPermission.granted ? (
                                        <Ionicons name="checkmark" size={20} color="#34d399" />
                                    ) : (
                                        <Text style={styles.checklistButtonText}>Enable</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.privacyTipRow}>
                                <Ionicons name="shield-checkmark" size={14} color="#34d399" />
                                <Text style={styles.privacyTipText}>Your videos stay private on your device.</Text>
                            </View>
                        </Animated.View>

                        <View style={styles.permissionFooter}>
                            {anyPermissionMissing ? (
                                <View style={styles.permissionRequiredContainer}>
                                    <Text style={styles.permissionRequiredText}>Grant all permissions to proceed</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => setModalDismissed(true)}
                                    style={styles.mainActionButton}
                                >
                                    <Text style={styles.actionButtonText}>Continue</Text>
                                    <Ionicons name="arrow-forward" size={17} color="#fff" style={{ marginLeft: 10 }} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        );
    }

    // Still checking whether video exists
    if (videoExists === null) {
        return (
            <View style={styles.permissionContainer}>
                <BreathingBackground colors={['#02010a', '#0f172a', '#451a03']} opacity={1} />
                <ActivityIndicator size="large" color="#f59e0b" style={{ flex: 1, alignSelf: 'center' }} />
            </View>
        );
    }

    // ─── CHOICE SCREEN (video already exists, user hasn't chosen yet) ─────────
    if (videoExists && !showCamera) {
        return (
            <View style={styles.permissionContainer}>
                <StatusBar barStyle="light-content" />
                <BreathingBackground colors={['#0f172a', '#1c1917', '#451a03']} opacity={0.9} />

                <SafeAreaView style={choiceStyles.safe}>
                    {/* Top nav */}
                    <TouchableOpacity onPress={handleDone} style={choiceStyles.backRow}>
                        <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.4)" />
                        <Text style={choiceStyles.backText}>Back</Text>
                    </TouchableOpacity>

                    {/* Hero */}
                    <View style={choiceStyles.hero}>

                        <Ionicons name="film-outline" size={32} color="#fb923c" />

                        <Text style={choiceStyles.heading}>Your Future Message</Text>
                        <Text style={choiceStyles.subheading}>
                            A message from the version of you{`\n`}who already made it.
                        </Text>
                    </View>

                    {/* Actions */}
                    <View style={choiceStyles.actions}>

                        {/* Primary: Watch */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={choiceStyles.primaryBtn}
                            onPress={() => {
                                const videoPath = `${FileSystem.documentDirectory}future_messages/latest_message.mp4`;
                                setWatchUri(videoPath);
                            }}
                        >
                            <View style={choiceStyles.primaryIcon}>
                                <Ionicons name="play" size={18} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={choiceStyles.primaryLabel}>Watch Your Future</Text>
                                <Text style={choiceStyles.primaryHint}>Play your recorded commitment</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={choiceStyles.dividerRow}>
                            <View style={choiceStyles.dividerLine} />
                            <Text style={choiceStyles.dividerText}>or</Text>
                            <View style={choiceStyles.dividerLine} />
                        </View>

                        {/* Secondary: Record new */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={choiceStyles.secondaryBtn}
                            onPress={() => setShowCamera(true)}
                        >
                            <View style={choiceStyles.secondaryIcon}>
                                <Ionicons name="radio-button-on" size={16} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={choiceStyles.secondaryLabel}>Record a New Message</Text>
                                <Text style={choiceStyles.secondaryHint}>Your vision has grown — capture it</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                    </View>

                    <Text style={choiceStyles.footer}>
                        You made a promise to yourself. Keep it.
                    </Text>
                </SafeAreaView>

                {/* In-app video player */}
                {watchUri ? (
                    <ExistingVideoModal
                        uri={watchUri}
                        onClose={() => setWatchUri(null)}
                    />
                ) : null}
            </View>
        );
    }
    // ─────────────────────────────────────────────────────────────────────────

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
            console.warn("Recording error: [Safe String]");
            setIsRecording(false);
            Alert.alert("Error", "Failed to record video.");
        }
    };

    const stopRecording = () => {
        if (!cameraRef.current) return;
        cameraRef.current.stopRecording();
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
            console.warn("Saving error: [Safe String]");
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
                        <TouchableOpacity onPress={handleDone} style={styles.backButton} disabled={isRecording}>
                            {isOnboarding
                                ? <Text style={{ fontFamily: 'Comfortaa_600SemiBold', fontSize: 14, color: isRecording ? 'transparent' : '#fff', letterSpacing: 0.5 }}>Skip</Text>
                                : <Ionicons name="close" size={28} color={isRecording ? 'transparent' : '#fff'} />
                            }
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
                            <Ionicons name="shield-checkmark" size={64} color="#10b981" />
                        </View>

                        <Text style={styles.successTitle}>Vision Captured</Text>
                        <Text style={styles.successText}>
                            Your future self's message has been securely locked in your vault.
                        </Text>

                        <View style={styles.modalActionCol}>
                            <TouchableOpacity
                                style={styles.doneButton}
                                onPress={() => {
                                    setShowSuccessModal(false);
                                    handleDone();
                                }}
                            >
                                <LinearGradient
                                    colors={['#10b981', '#059669']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.doneGradient}
                                >
                                    <Text style={styles.doneButtonText}>{isOnboarding ? 'CONTINUE →' : 'AWESOME'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.retakeButton}
                                onPress={() => setShowSuccessModal(false)}
                            >
                                <Ionicons name="refresh" size={16} color="rgba(255,255,255,0.7)" />
                                <Text style={styles.retakeButtonText}>Retake</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

// ─── In-App Existing-Video Player ────────────────────────────────────────────
function ExistingVideoModal({ uri, onClose }: { uri: string; onClose: () => void }) {
    const player = useVideoPlayer(uri, p => {
        p.loop = false;
        p.play();
    });
    return (
        <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={evStyles.backdrop}>
                <View style={evStyles.topBar}>
                    <Text style={evStyles.topLabel}>Your Future Message 🔥</Text>
                    <TouchableOpacity onPress={onClose} style={evStyles.closeBtn}>
                        <Ionicons name="close" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={evStyles.playerWrapper}>
                    <VideoView
                        player={player}
                        style={evStyles.video}
                        allowsFullscreen
                        allowsPictureInPicture
                        contentFit="contain"
                    />
                </View>
                <Text style={evStyles.reminder}>
                    Remember why you started.
                </Text>
            </View>
        </Modal>
    );
}

const evStyles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.97)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    topBar: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    topLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: '#f59e0b',
        flex: 1,
    },
    closeBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 12,
    },
    playerWrapper: {
        width: width - 32,
        aspectRatio: 9 / 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    video: { flex: 1 },
    reminder: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 22,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0d0015',
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#0d0015',
    },
    permissionOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    permissionSafe: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 0,
        paddingBottom: 32,
        justifyContent: 'space-between',
    },
    permissionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
        marginBottom: 0,
    },
    miniBackButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipNav: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    skipNavText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 0.5,
    },
    permissionHero: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    heroIconInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    permissionTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 22,
        color: '#fdf4ff',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.3,
    },
    permissionSubtitle: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: '88%',
    },
    // ─── Choice screen styles ────────────────────────────────────────────
    choiceContainer: {
        gap: 14,
        width: '100%',
    },
    choiceCard: {
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    choiceGradient: {
        padding: 22,
        alignItems: 'center',
        gap: 10,
    },
    choiceIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    choiceTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 17,
        color: '#fdf4ff',
        textAlign: 'center',
    },
    choiceSub: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.45)',
        textAlign: 'center',
        lineHeight: 20,
    },
    choiceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginTop: 4,
    },
    choiceChipText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
        letterSpacing: 0.5,
    },
    // ─────────────────────────────────────────────────────────────────────
    // Instruction card styles
    instructionCard: {
        backgroundColor: 'rgba(69, 26, 3, 0.15)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.12)',
        overflow: 'hidden',
        paddingTop: 4,
    },
    instructionHeading: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 11,
        color: '#fcd34d',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
        opacity: 0.7,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
        paddingHorizontal: 18,
        gap: 14,
    },
    instructionRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(245, 158, 11, 0.07)',
    },
    stepBadge: {
        width: 28,
        height: 28,
        borderRadius: 10,
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
        flexShrink: 0,
    },
    stepText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 9,
        color: '#f59e0b',
        letterSpacing: 0.5,
    },
    instructionContent: {
        flex: 1,
    },
    instructionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    instructionTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 13,
        color: '#f3e8ff',
    },
    instructionTip: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.38)',
        lineHeight: 17,
    },
    permissionFooter: {
        gap: 14,
    },
    mainActionButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f97316',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 10,
    },
    permissionRequiredContainer: {
        width: '100%',
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionRequiredText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 0.5,
    },
    permissionReasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    permissionIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionReasonTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: '#fff',
        marginBottom: 2,
    },
    permissionReasonText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 18,
    },
    privacyTipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    privacyTipText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 10,
        color: '#34d399',
        letterSpacing: 0.5,
    },
    actionButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 15,
        color: '#fdf4ff',
        letterSpacing: 0.3,
    },
    secondaryActionButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    secondaryActionText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 0.5,
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
        paddingTop: Platform.OS === 'ios' ? 12 : 36,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    flipButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
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
    // Viewfinder corners
    viewfinderCornerTL: {
        position: 'absolute',
        top: 100,
        left: 40,
        width: 36,
        height: 36,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderColor: 'rgba(255,255,255,0.7)',
        borderTopLeftRadius: 10,
    },
    viewfinderCornerTR: {
        position: 'absolute',
        top: 100,
        right: 40,
        width: 36,
        height: 36,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderColor: 'rgba(255,255,255,0.7)',
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
        height: 52,
        borderRadius: 26,
        overflow: 'hidden',
    },
    doneGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: '#fff',
        letterSpacing: 1,
    },
    modalActionCol: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        marginTop: 10,
    },
    retakeButton: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    retakeButtonText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    checklistButton: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 70,
    },
    checklistButtonGranted: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
    },
    checklistButtonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 11,
        color: '#f59e0b',
    },
});
