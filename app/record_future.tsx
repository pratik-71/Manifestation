import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { useVideoPlayer, VideoView } from 'expo-video';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
                <BreathingBackground colors={['#0d0015', '#1a0533', '#2d0845']} opacity={1} />
                <ActivityIndicator size="large" color="#e879f9" style={{ flex: 1, alignSelf: 'center' }} />
            </View>
        );
    }

    if (!cameraPermission.granted || !microphonePermission.granted || !mediaLibraryPermission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <StatusBar barStyle="light-content" />
                <BreathingBackground colors={['#0d0015', '#1a0533', '#2d0845']} opacity={1} />
                <View style={styles.permissionOverlay} pointerEvents="none" />

                <SafeAreaView style={styles.permissionSafe}>
                    {isOnboarding && (
                        <TouchableOpacity onPress={handleDone} style={styles.skipNav}>
                            <Text style={styles.skipNavText}>Skip</Text>
                            <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                    )}

                    <Animated.View entering={FadeInDown.duration(800)} style={styles.permissionHero}>
                        <View style={styles.heroIconRing}>
                            <View style={styles.heroIconInner}>
                                <Ionicons name="videocam" size={20} color="#f0abfc" />
                            </View>
                        </View>
                        <Text style={styles.permissionTitle}>Record Your Future</Text>
                        <Text style={styles.permissionSubtitle}>
                            A message from your future self — already living the life you dreamed of.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeIn.delay(400).duration(800)} style={styles.instructionCard}>
                        <Text style={styles.instructionHeading}>How to make it powerful</Text>
                        {[
                            {
                                step: '01',
                                icon: 'sunny-outline' as const,
                                title: 'Find good lighting',
                                tip: 'Sit facing a window or lamp so your face is visible.',
                            },
                            {
                                step: '02',
                                icon: 'mic-outline' as const,
                                title: 'Speak in present tense',
                                tip: '"I wake up grateful every morning..." — as if it already happened.',
                            },
                            {
                                step: '03',
                                icon: 'heart-outline' as const,
                                title: 'Be specific & emotional',
                                tip: 'Describe your home, career, joy. The more vivid, the more powerful.',
                            },
                            {
                                step: '04',
                                icon: 'time-outline' as const,
                                title: 'Aim for 1–3 minutes',
                                tip: 'Short and powerful. You can always record again anytime.',
                            },
                        ].map((item, i, arr) => (
                            <View key={i} style={[styles.instructionRow, i < arr.length - 1 && styles.instructionRowBorder]}>
                                <View style={styles.stepBadge}>
                                    <Text style={styles.stepText}>{item.step}</Text>
                                </View>
                                <View style={styles.instructionContent}>
                                    <View style={styles.instructionTitleRow}>
                                        <Ionicons name={item.icon} size={13} color="#d8b4fe" style={{ marginRight: 5 }} />
                                        <Text style={styles.instructionTitle}>{item.title}</Text>
                                    </View>
                                    <Text style={styles.instructionTip}>{item.tip}</Text>
                                </View>
                            </View>
                        ))}
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(700).duration(800)} style={styles.permissionFooter}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={async () => {
                                await requestCameraPermission();
                                await requestMicrophonePermission();
                                await requestMediaLibraryPermission();
                            }}
                            style={styles.mainActionButton}
                        >
                            <Ionicons name="videocam" size={17} color="#fff" style={{ marginRight: 10 }} />
                            <Text style={styles.actionButtonText}>I'm Ready — Start Recording</Text>
                        </TouchableOpacity>

                    </Animated.View>
                </SafeAreaView>
            </View>
        );
    }

    // Still checking whether video exists
    if (videoExists === null) {
        return (
            <View style={styles.permissionContainer}>
                <BreathingBackground colors={['#0d0015', '#1a0533', '#2d0845']} opacity={1} />
                <ActivityIndicator size="large" color="#e879f9" style={{ flex: 1, alignSelf: 'center' }} />
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
                                handleDone();
                            }}
                        >
                            <LinearGradient
                                colors={['#8b5cf6', '#d946ef']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.doneGradient}
                            >
                                <Text style={styles.doneButtonText}>{isOnboarding ? 'CONTINUE →' : 'AWESOME'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
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
        color: '#c084fc',
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
        paddingTop: 46,
        paddingBottom: 32,
        justifyContent: 'space-between',
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
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 9,
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: 0.5,
    },
    permissionHero: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    heroIconRing: {
        width: 48,
        height: 48,
        borderRadius: 44,
        backgroundColor: 'rgba(232, 121, 249, 0.07)',
        borderWidth: 1,
        borderColor: 'rgba(232, 121, 249, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    heroIconInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(240, 171, 252, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: 'rgba(88, 28, 135, 0.2)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.12)',
        overflow: 'hidden',
        paddingTop: 4,
    },
    instructionHeading: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 11,
        color: '#d8b4fe',
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
        borderBottomColor: 'rgba(167, 139, 250, 0.07)',
    },
    stepBadge: {
        width: 28,
        height: 28,
        borderRadius: 10,
        backgroundColor: 'rgba(167, 139, 250, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
        flexShrink: 0,
    },
    stepText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 9,
        color: '#c084fc',
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
        backgroundColor: '#7c3aed',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 10,
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
