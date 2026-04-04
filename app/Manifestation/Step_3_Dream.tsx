import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Step_3_Dream = ({ onComplete }: { onComplete?: () => void }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const videoRef = useRef<Video>(null);
    const [isPlaying, setIsPlaying] = useState(true);

    const togglePlay = async () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            await videoRef.current.pauseAsync();
            setIsPlaying(false);
        } else {
            await videoRef.current.playAsync();
            setIsPlaying(true);
        }
    };

    const handleStartRecording = async () => {
        if (!permission?.granted) {
            requestPermission();
            return;
        }

        try {
            setIsRecording(true);
            const video = await cameraRef.current?.recordAsync({
                maxDuration: 60, // 60 seconds max
            });
            if (video?.uri) {
                setVideoUri(video.uri);
            }
        } catch (error) {
            console.error('Error recording video:', error);
            Alert.alert('Error', 'Failed to record video');
        } finally {
            setIsRecording(false);
        }
    };

    const handleStopRecording = () => {
        if (cameraRef.current && isRecording) {
            cameraRef.current.stopRecording();
        }
    };

    const handleRecapture = () => {
        setVideoUri(null);
        setIsRecording(false);
    };

    const handleNext = () => {
        if (!videoUri) {
            return;
        }
        setIsSaving(true);
        // We could save the video to AsyncStorage if needed, for now just move to next
        setTimeout(() => {
            setIsSaving(false);
            onComplete?.();
        }, 600);
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>Requesting camera permissions...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
                <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                    <Text style={styles.subtitle}>Record a video explaining how you see your future in your vision</Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300)} style={styles.content}>
                    {!videoUri ? (
                        <View style={styles.cameraContainer}>
                            <CameraView
                                ref={cameraRef}
                                style={styles.camera}
                                mode="video"
                                facing="front"
                                mute={false}
                            >
                                <View style={styles.cameraOverlay}>
                                    <View style={styles.recordingIndicator}>
                                        {isRecording && (
                                            <>
                                                <View style={styles.recordingDot} />
                                                <Text style={styles.recordingText}>Recording...</Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                            </CameraView>
                        </View>
                    ) : (
                        <View style={styles.videoPreviewContainer}>
                            <Video
                                ref={videoRef}
                                source={{ uri: videoUri }}
                                style={styles.videoPreview}
                                resizeMode={ResizeMode.COVER}
                                isLooping
                                shouldPlay
                                onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                                    if (status.isLoaded) setIsPlaying(status.isPlaying);
                                }}
                            />
                            {/* Centered play/pause */}
                            <TouchableOpacity
                                style={styles.playPauseOverlay}
                                onPress={togglePlay}
                                activeOpacity={1}
                            >
                                {!isPlaying && (
                                    <View style={styles.playBtn}>
                                        <Ionicons name="play" size={36} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                            {/* Dim pill bottom-left */}
                            <TouchableOpacity
                                style={styles.dimPill}
                                onPress={togglePlay}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={isPlaying ? 'pause' : 'play'}
                                    size={14}
                                    color="rgba(255,255,255,0.85)"
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>

            <View style={styles.footer}>
                {!videoUri ? (
                    <TouchableOpacity
                        style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
                        onPress={isRecording ? handleStopRecording : handleStartRecording}
                        activeOpacity={0.9}
                        disabled={isSaving}
                    >
                        <LinearGradient
                            colors={isRecording ? ['#EF4444', '#DC2626'] : ['#F59E0B', '#D97706']}
                            style={styles.gradientBtn}
                        >
                            <Ionicons 
                                name={isRecording ? "stop" : "videocam"} 
                                size={24} 
                                color="white" 
                            />
                            <Text style={styles.recordBtnText}>
                                {isRecording ? 'Stop Recording' : 'Start Recording'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.recaptureBtn}
                            onPress={handleRecapture}
                            activeOpacity={0.9}
                            disabled={isSaving}
                        >
                            <LinearGradient
                                colors={['#6B7280', '#4B5563']}
                                style={styles.gradientBtn}
                            >
                                <Ionicons name="refresh" size={18} color="white" />
                                <Text style={styles.recaptureBtnText}>Recapture</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.nextBtn}
                            onPress={handleNext}
                            activeOpacity={0.9}
                            disabled={isSaving}
                        >
                            <LinearGradient
                                colors={['#F59E0B', '#D97706']}
                                style={styles.gradientBtn}
                            >
                                <Text style={styles.nextBtnText}>{isSaving ? 'Processing...' : 'Continue'}</Text>
                                <Ionicons name="arrow-forward" size={18} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity
                    style={styles.skipStepBtn}
                    onPress={onComplete}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipStepText}>Continue to Goals</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: width < 380 ? 12 : 14,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: 'Comfortaa_500Medium',
    },
    content: {
        flex: 1,
        marginVertical: 4,
    },
    cameraContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 20,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#EF4444',
    },
    recordingText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Comfortaa_500Medium',
    },
    videoPreviewContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        flex: 1,
    },
    videoPreview: {
        flex: 1,
    },
    playPauseOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    dimPill: {
        position: 'absolute',
        bottom: 14,
        left: 14,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    videoSuccessContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 24,
    },
    videoSuccessText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontFamily: 'Comfortaa_700Bold',
        textAlign: 'center',
    },
    videoSuccessSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        fontFamily: 'Comfortaa_500Medium',
        textAlign: 'center',
        marginBottom: 20,
    },
    playVideoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F59E0B',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    playVideoBtnText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Comfortaa_700Bold',
        letterSpacing: 0.5,
    },
    recordBtn: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    recordBtnActive: {
        shadowColor: '#EF4444',
    },
    recordBtnText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Comfortaa_700Bold',
        letterSpacing: 1,
    },
    recaptureBtn: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#6B7280',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    recaptureBtnText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Comfortaa_700Bold',
        letterSpacing: 1,
    },
    permissionText: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'Comfortaa_500Medium',
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Comfortaa_700Bold',
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
        paddingBottom: height < 700 ? 15 : 30,
        marginTop: 20,
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
