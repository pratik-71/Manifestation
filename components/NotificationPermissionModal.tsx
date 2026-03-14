import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Image, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

                <View style={styles.modalView}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.modalTitle}>Enable Ritual Reminders</Text>
                    <Text style={styles.modalText}>
                        Don't miss your manifestation portals. We'll remind you 5 minutes after you wake up, before bed, and at your sacred ritual time.
                    </Text>

                    <TouchableOpacity
                        style={styles.buttonPrimary}
                        onPress={handleEnable}
                    >
                        <Text style={styles.textStyle}>Enable Notifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buttonSecondary}
                        onPress={onClose}
                    >
                        <Text style={styles.textStyleSecondary}>Maybe Later</Text>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: '#1e293b',
        borderRadius: 32,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(251, 146, 60, 0.3)',
        width: '85%',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoImage: {
        width: 44,
        height: 44,
    },
    modalTitle: {
        fontFamily: 'Comfortaa_700Bold',
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 22,
        color: '#fff',
    },
    modalText: {
        fontFamily: 'Comfortaa_400Regular',
        marginBottom: 30,
        textAlign: 'center',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 22,
    },
    buttonPrimary: {
        backgroundColor: '#fb923c',
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 24,
        elevation: 2,
        width: '100%',
        marginBottom: 12,
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        paddingVertical: 10,
        width: '100%',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Comfortaa_600SemiBold',
    },
    textStyleSecondary: {
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 13,
    },
});
