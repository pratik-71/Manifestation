import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface CustomAlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    type?: 'success' | 'error' | 'info';
    buttonText?: string;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
    visible,
    title,
    message,
    onClose,
    type = 'info',
    buttonText = 'Okay'
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'info': return 'information-circle';
            default: return 'alert-circle';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'info': return '#fb923c';
            default: return '#fb923c';
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableOpacity 
                    activeOpacity={1} 
                    onPress={onClose} 
                    style={StyleSheet.absoluteFill} 
                />
                
                <Animated.View 
                    entering={FadeInDown.springify()} 
                    style={styles.modalContainer}
                >
                    <View style={styles.solidCard}>
                        <View style={styles.iconContainer}>
                            <Ionicons name={getIcon()} size={48} color={getIconColor()} />
                        </View>
                        
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>
                        
                        <TouchableOpacity 
                            onPress={onClose} 
                            style={styles.button}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#fb923c', '#ea580c']}
                                style={styles.gradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.buttonText}>{buttonText}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContainer: {
        width: width * 0.85,
        borderRadius: 32,
        overflow: 'hidden',
    },
    solidCard: {
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: '#050505',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 22,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    button: {
        width: '100%',
        height: 54,
        borderRadius: 27,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#fff',
        letterSpacing: 0.5,
    }
});
