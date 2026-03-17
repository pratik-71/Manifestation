import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Linking,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BottomBar } from '../components/BottomBar';
import { BreathingBackground } from '../components/BreathingBackground';
import { deleteAccount, getCurrentUser, signOut } from '../services/authService';
import { supabase } from '../services/supabase';
import { useUserStore } from '../store/userStore';

const { width } = Dimensions.get('window');

export default function Profile() {
    const router = useRouter();
    const { profile, fetchProfile } = useUserStore();
    const [email, setEmail] = useState<string>('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    // Deletion states
    const [isDeleteStep1Visible, setIsDeleteStep1Visible] = useState(false);
    const [isDeleteStep2Visible, setIsDeleteStep2Visible] = useState(false);

    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [feedbackName, setFeedbackName] = useState('');
    const [feedbackTitle, setFeedbackTitle] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    const submitFeedback = async () => {
        if (!feedbackName.trim() || !feedbackTitle.trim() || !feedbackMessage.trim()) {
            Alert.alert("Missing Fields", "Please complete all fields to submit your feedback.");
            return;
        }
        setIsSubmittingFeedback(true);
        try {
            const user = await getCurrentUser();
            if (!user) throw new Error("Not logged in");
            const { error } = await supabase.from('feedback').insert({
                user_id: user.id,
                name: feedbackName.trim(),
                title: feedbackTitle.trim(),
                message: feedbackMessage.trim(),
            });
            if (error) throw error;
            Alert.alert("Feedback Received", "Thank you for sharing your thoughts with us!");
            setIsFeedbackVisible(false);
            setFeedbackName('');
            setFeedbackTitle('');
            setFeedbackMessage('');
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not submit feedback at this time.");
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const user = await getCurrentUser();
            if (user) {
                setEmail(user.email || '');
                if (!profile) {
                    await fetchProfile(user.id);
                }
            } else {
                router.replace('/onboarding/google_signin');
            }
        };
        init();
    }, []);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Stay", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            await signOut();
                            useUserStore.getState().clearProfile();
                            router.replace('/onboarding/google_signin');
                        } catch (error) {
                            Alert.alert("Error", "Failed to sign out.");
                        } finally {
                            setIsLoggingOut(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = async () => {
        setIsDeleteStep1Visible(true);
    };

    const confirmDeleteFinal = async () => {
        setIsDeleteStep2Visible(false);
        setIsLoggingOut(true);
        try {
            await deleteAccount();
            useUserStore.getState().clearProfile();
            router.replace('/onboarding/google_signin');
        } catch (error) {
            Alert.alert("Error", "Failed to delete account.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const MenuRow = ({ icon, label, onPress, showBorder = true, color = '#fff' }: any) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.menuRow, !showBorder && { borderBottomWidth: 0 }]}
        >
            <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, color !== '#fff' && { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={[styles.menuLabel, { color }]}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={['#0f172a', '#1c1917', '#451a03']}
                opacity={0.8}
            />

            <SafeAreaView style={styles.safe}>
                <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
                    <Text style={styles.headerTitle}>PROFILE</Text>
                </Animated.View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Profile Hero */}
                    <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.heroContainer}>


                        <Text style={styles.username}>{profile?.username || 'Seeker'}</Text>
                        <Text style={styles.emailTag}>{email}</Text>

                        <View style={styles.streakBadge}>
                            <Ionicons name="flame" size={14} color="#f97316" />
                            <Text style={styles.streakText}>{profile?.streak_count || 0} Day Streak</Text>
                        </View>
                    </Animated.View>

                    {/* Settings Section */}
                    <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.sectionWrapper}>
                        <BlurView intensity={25} tint="dark" style={styles.glassCard}>
                            <MenuRow
                                icon="person-outline"
                                label="Personal Information"
                                onPress={() => router.push('/edit_profile')}
                            />
                            <MenuRow
                                icon="videocam-outline"
                                label="Talk to Future Self"
                                onPress={() => router.push('/record_future' as any)}
                            />
                            <MenuRow
                                icon="card-outline"
                                label="Subscription"
                                onPress={() => router.push('/onboarding/paywall')}
                            />
                            <MenuRow
                                icon="chatbubble-outline"
                                label="Feedback"
                                onPress={() => setIsFeedbackVisible(true)}
                            />
        
                            <MenuRow
                                icon="log-out-outline"
                                label="Logout"
                                onPress={handleLogout}
                            />
                            <MenuRow
                                icon="trash-outline"
                                label="Delete Account"
                                onPress={handleDeleteAccount}
                                color="#ef4444"
                                showBorder={false}
                            />
                        </BlurView>
                    </Animated.View>

                    <View style={styles.footer}>
                        <Text style={styles.versionText}>v1.0.1 (Build 1)</Text>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </SafeAreaView>

            <BottomBar />

            {isLoggingOut && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator color="#fff" size="large" />
                </View>
            )}

            {/* Feedback Modal */}
            <Modal visible={isFeedbackVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsFeedbackVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
                    <StatusBar barStyle="light-content" />
                    <BreathingBackground colors={['#0f172a', '#1c1917', '#451a03']} opacity={0.8} />
                    <SafeAreaView style={styles.modalSafe}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setIsFeedbackVisible(false)} style={styles.modalBackButton}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.modalHeaderTitle}>FEEDBACK</Text>
                            <View style={{ width: 40 }} />
                        </View>
                        <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
                            <Text style={styles.modalDescription}>We value your thoughts. Let us know how we can improve your manifestation journey.</Text>

                            <Text style={styles.inputLabel}>NAME</Text>
                            <BlurView intensity={20} tint="dark" style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Your Name"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={feedbackName}
                                    onChangeText={setFeedbackName}
                                />
                            </BlurView>

                            <Text style={styles.inputLabel}>TITLE</Text>
                            <BlurView intensity={20} tint="dark" style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Brief summary"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={feedbackTitle}
                                    onChangeText={setFeedbackTitle}
                                />
                            </BlurView>

                            <Text style={styles.inputLabel}>MESSAGE</Text>
                            <BlurView intensity={20} tint="dark" style={[styles.inputWrapper, { height: 160 }]}>
                                <TextInput
                                    style={[styles.modalInput, styles.modalTextArea]}
                                    placeholder="Tell us everything..."
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    multiline
                                    value={feedbackMessage}
                                    onChangeText={setFeedbackMessage}
                                    textAlignVertical="top"
                                />
                            </BlurView>

                        </ScrollView>

                        <View style={styles.floatingButtonContainer}>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={submitFeedback}
                                disabled={isSubmittingFeedback}
                                activeOpacity={0.8}
                            >
                                <LinearGradient colors={['#8b5cf6', '#d946ef', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
                                    {isSubmittingFeedback ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitText}>SEND FEEDBACK</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </Modal>

            {/* Delete Account Step 1: Initial Ask */}
            <Modal visible={isDeleteStep1Visible} transparent animationType="fade" onRequestClose={() => setIsDeleteStep1Visible(false)}>
                <View style={styles.alertOverlay}>
                    <Animated.View entering={FadeInUp} style={styles.alertCard}>
                        <View style={styles.alertIconBg}>
                            <Ionicons name="alert-circle" size={32} color="#ef4444" />
                        </View>
                        <Text style={styles.alertTitle}>Delete Account</Text>
                        <Text style={styles.alertMessage}>Are you sure you want to do it?</Text>
                        
                        <View style={styles.alertActions}>
                            <TouchableOpacity 
                                style={[styles.alertButton, styles.cancelBtn]} 
                                onPress={() => setIsDeleteStep1Visible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.alertButton, styles.proceedBtn]} 
                                onPress={() => {
                                    setIsDeleteStep1Visible(false);
                                    setIsDeleteStep2Visible(true);
                                }}
                            >
                                <Text style={styles.proceedBtnText}>Proceed</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {/* Delete Account Step 2: Final Warning */}
            <Modal visible={isDeleteStep2Visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setIsDeleteStep2Visible(false)}>
                <View style={styles.fullDeleteContainer}>
                    <BreathingBackground colors={['#1c1917', '#450a0a', '#000000']} opacity={1} />
                    <SafeAreaView style={styles.fullDeleteSafe}>
                        <View style={styles.fullDeleteContent}>
                            <Ionicons name="warning" size={80} color="#ef4444" style={{ marginBottom: 30 }} />
                            <Text style={styles.fullDeleteTitle}>FINAL WARNING</Text>
                            <Text style={styles.fullDeleteMessage}>
                                You will lose ALL data, progress, and settings. This action is irreversible.
                            </Text>
                            <Text style={styles.fullDeleteAsk}>Are you absolutely sure you want to delete your account?</Text>

                            <TouchableOpacity 
                                style={styles.finalDeleteBtn} 
                                onPress={confirmDeleteFinal}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.finalDeleteText}>YES, DELETE IT</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.finalCancelBtn} 
                                onPress={() => setIsDeleteStep2Visible(false)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.finalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#0f172a' },
    safe: { flex: 1 },
    header: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 3,
        paddingTop: 24,
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    heroContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarOutline: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    avatarGradient: {
        flex: 1,
        borderRadius: 47,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 42,
        color: '#fff',
    },
    username: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#fff',
        marginBottom: 4,
    },
    emailTag: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 16,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    streakText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    sectionWrapper: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    glassCard: {
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        marginBottom: 8,
    },
    cardTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    aboutText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 22,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLabel: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    versionText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 10,
        color: 'rgba(255,255,255,0.1)',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContainer: { flex: 1, backgroundColor: '#0f172a' },
    modalSafe: { flex: 1 },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 16,
    },
    modalBackButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalHeaderTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    modalContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 100,
    },
    modalDescription: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 32,
        lineHeight: 22,
        textAlign: 'center',
    },
    inputLabel: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 2,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        marginBottom: 20,
    },
    modalInput: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 16,
        color: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    modalTextArea: {
        height: '100%',
        paddingTop: 16,
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 40 : 24,
        left: 24,
        right: 24,
    },
    submitButton: {
        borderRadius: 30,
        overflow: 'hidden',
        height: 56,
        shadowColor: '#d946ef',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    submitGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: '#fff',
        letterSpacing: 2,
    },

    // Custom Alert Modals
    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        padding: 30,
    },
    alertCard: {
        backgroundColor: '#1e293b',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    alertIconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    alertTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 18,
        color: '#fff',
        marginBottom: 8,
    },
    alertMessage: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 24,
    },
    alertActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    alertButton: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cancelBtnText: {
        fontFamily: 'Comfortaa_600SemiBold',
        color: '#fff',
        fontSize: 14,
    },
    proceedBtn: {
        backgroundColor: '#ef4444',
    },
    proceedBtnText: {
        fontFamily: 'Comfortaa_700Bold',
        color: '#fff',
        fontSize: 14,
    },

    // Full Screen Delete
    fullDeleteContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    fullDeleteSafe: {
        flex: 1,
    },
    fullDeleteContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    fullDeleteTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#ef4444',
        letterSpacing: 4,
        marginBottom: 20,
    },
    fullDeleteMessage: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    fullDeleteAsk: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        marginBottom: 60,
    },
    finalDeleteBtn: {
        width: '100%',
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    finalDeleteText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#fff',
        letterSpacing: 2,
    },
    finalCancelBtn: {
        width: '100%',
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    finalCancelText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 16,
        color: '#fff',
    },
});
