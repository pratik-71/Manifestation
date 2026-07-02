import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Image, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { requestNotificationPermissions } from '../services/notificationService';

interface NotificationPermissionModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({ isVisible, onClose }) => {
    const handleEnable = async () => {
        const granted = await requestNotificationPermissions();
        if (granted) {
            onClose();
        } else {
            // If they still deny, suggest opening settings
            Linking.openSettings();
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <BlurView 
                    intensity={80} 
                    tint="dark" 
                    style={StyleSheet.absoluteFill} 
                    experimentalBlurMethod="dimezisBlurView"
                />

                <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    style={styles.modalView}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.modalTitle}>Daily Reminders</Text>
                    <Text style={styles.modalText}>
                        Enable notifications to never miss your manifestation rituals and stay aligned with your goals.
                    </Text>

                    <TouchableOpacity
                        style={styles.buttonPrimary}
                        onPress={handleEnable}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#fb923c', '#ea580c']}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.textStyle}>Continue</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buttonSecondary}
                        onPress={onClose}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.textStyleSecondary}>Maybe Later</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(251, 146, 60, 0.4)',
        width: '75%',
        overflow: 'hidden',
    },
    iconContainer: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    logoImage: {
        width: 48,
        height: 48,
    },
    modalTitle: {
        fontFamily: 'Comfortaa_700Bold',
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 20,
        color: '#fff',
        letterSpacing: 0.5,
    },
    modalText: {
        fontFamily: 'Comfortaa_400Regular',
        marginBottom: 24,
        textAlign: 'center',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 20,
    },
    buttonPrimary: {
        width: '100%',
        marginBottom: 10,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#fb923c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradientButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        paddingVertical: 8,
        width: '100%',
    },
    textStyle: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Comfortaa_600SemiBold',
        letterSpacing: 0.5,
    },
    textStyleSecondary: {
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
        letterSpacing: 0.5,
    },
});
