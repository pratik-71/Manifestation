import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInRight,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BreathingBackground } from '../components/BreathingBackground';
import { GlobalCosmicBackground } from '../components/GlobalCosmicBackground';
import { AppColors } from '../constants/Colors';
import { getAIResponse } from '../services/aiService';
import { useUserStore } from '../store/userStore';

// Types
interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    isTyping?: boolean;
}

/**
 * Typewriter Animation Component
 */
const TypewriterText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
    const [displayedText, setDisplayedText] = useState("");
    const index = useRef(0);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500);

        const type = () => {
            if (index.current < text.length) {
                setDisplayedText(text.substring(0, index.current + 1));
                index.current += 1;
                const baseSpeed = 20;
                const randomSpeed = Math.random() * 15;
                setTimeout(type, baseSpeed + randomSpeed);
            } else {
                clearInterval(cursorInterval);
                setShowCursor(false);
                onComplete?.();
            }
        };

        type();
        return () => clearInterval(cursorInterval);
    }, [text]);

    return (
        <Text style={styles.messageText}>
            {displayedText}
            {showCursor && <Text style={{ color: AppColors.manifestation.accent }}>|</Text>}
        </Text>
    );
};

/**
 * Universe Chat Screen - WhatsApp Style with adjustResize
 */
export default function UniverseChat() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { incrementMessageCount, canSendMessage } = useUserStore();

    // State
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I am here to help you work on your goals. What would you like to focus on today?',
            sender: 'assistant',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isAssistantTyping, setIsAssistantTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Animations
    // Keyboard handling
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const keyboardDidShowListener = Keyboard.addListener(showEvent, () => {
            setKeyboardVisible(true);
            scrollToBottom();
        });
        const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const pulseAnim = useSharedValue(1);
    const glowOpacity = useSharedValue(0.4);

    useEffect(() => {
        pulseAnim.value = withRepeat(withTiming(1.1, { duration: 1500 }), -1, true);
        glowOpacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
    }, []);

    const animatedPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseAnim.value }],
    }));

    // Auto-scroll
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
    }, []);

    const handleSend = async () => {
        const trimmedText = inputText.trim();
        if (!trimmedText || isAssistantTyping) return;

        // Check daily limit
        if (!canSendMessage()) {
            const limitMsg: Message = {
                id: 'limit-' + Date.now(),
                text: "You have reached your daily limit of 12 messages. Please return tomorrow to continue.",
                sender: 'assistant',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, limitMsg]);
            return;
        }

        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            text: trimmedText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsAssistantTyping(true);
        scrollToBottom();

        try {
            const history = messages
                .filter(msg => !msg.isTyping)
                .map(msg => ({
                    role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
                    content: msg.text
                }));

            const aiResponse = await getAIResponse(trimmedText, history);

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                sender: 'assistant',
                timestamp: new Date(),
                isTyping: true,
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting right now. Please try again in a moment.",
                sender: 'assistant',
                timestamp: new Date(),
                isTyping: true,
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsAssistantTyping(false);
            await incrementMessageCount();
        }
    };

    const renderMessage = (item: Message, index: number) => (
        <Animated.View
            key={item.id}
            entering={item.sender === 'user' ? FadeInRight.duration(400) : FadeInDown.duration(600)}
            style={[
                styles.messageWrapper,
                item.sender === 'user' ? styles.userWrapper : styles.assistantWrapper
            ]}
        >
            <View style={[
                styles.messageBubble,
                item.sender === 'user' ? styles.userBubble : styles.assistantBubble
            ]}>
                {item.sender === 'assistant' && item.isTyping ? (
                    <TypewriterText
                        text={item.text}
                        onComplete={() => {
                            setMessages(prev => {
                                const next = [...prev];
                                if (next[index]) next[index] = { ...next[index], isTyping: false };
                                return next;
                            });
                        }}
                    />
                ) : (
                    <Text style={styles.messageText}>{item.text}</Text>
                )}
            </View>
            <Text style={styles.timestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </Animated.View>
    );

    const renderTypingIndicator = () => (
        <Animated.View key="typing-indicator" entering={FadeIn.duration(400)} style={styles.typingWrapper}>
            <View style={[styles.messageBubble, styles.assistantBubble, styles.typingIndicator]}>
                <Animated.View style={[styles.typingDot, { opacity: glowOpacity }]} />
                <Animated.View style={[styles.typingDot, { opacity: glowOpacity, marginHorizontal: 4 }]} />
                <Animated.View style={[styles.typingDot, { opacity: glowOpacity }]} />
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <BreathingBackground
                colors={['#0f172a', '#1c1917', '#451a03']}
                opacity={0.7}
            />
            <GlobalCosmicBackground />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={AppColors.manifestation.accent} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                   
                    <Text style={styles.headerTitle}>CHAT</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    <View style={styles.messageList}>
                        {messages.map((item, index) => renderMessage(item, index))}
                        {isAssistantTyping && renderTypingIndicator()}
                    </View>
                </ScrollView>

                <View style={[
                    styles.inputWrapper,
                    { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 15) : 20 }
                ]}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { maxHeight: 100 }]}
                            placeholder="Type your message..."
                            placeholderTextColor="rgba(254, 243, 199, 0.3)"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            onFocus={scrollToBottom}
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!inputText.trim() || isAssistantTyping}
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || isAssistantTyping) && { opacity: 0.5 }
                            ]}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="send" size={18} color="#170b29" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#051139',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: 'rgba(15, 5, 24, 0.85)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(251, 191, 36, 0.08)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(251, 191, 36, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.1)',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: AppColors.manifestation.accent,
        letterSpacing: 4,
    },
    headerSubtitle: {
        fontFamily: 'Comfortaa_300Light',
        fontSize: 9,
        color: 'rgba(251, 191, 36, 0.6)',
        letterSpacing: 1,
        marginTop: 2,
    },
    titleGlow: {
        position: 'absolute',
        width: 80,
        height: 25,
        backgroundColor: AppColors.manifestation.accent,
        borderRadius: 15,
        opacity: 0.05,
        shadowColor: AppColors.manifestation.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
    },
    chatContainer: {
        flex: 1,
    },
    messageList: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    scrollContent: {
        flexGrow: 1,
    },
    messageWrapper: {
        marginBottom: 20,
        maxWidth: '85%',
    },
    userWrapper: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    assistantWrapper: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    messageBubble: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 22,
        borderWidth: 1,
    },
    userBubble: {
        backgroundColor: '#7c3aed',
        borderColor: 'rgba(251, 191, 36, 0.2)',
        borderBottomRightRadius: 4,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    assistantBubble: {
        backgroundColor: 'rgba(23, 11, 41, 0.9)',
        borderColor: 'rgba(251, 191, 36, 0.15)',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        color: AppColors.manifestation.text,
        lineHeight: 22,
    },
    timestamp: {
        fontFamily: 'Comfortaa_300Light',
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.3)',
        marginTop: 4,
        marginHorizontal: 5,
    },
    typingWrapper: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    typingIndicator: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 60,
    },
    typingDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: AppColors.manifestation.accent,
    },
    inputWrapper: {
        paddingHorizontal: 16,
        paddingTop: 8,
        backgroundColor: 'transparent',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(23, 11, 41, 0.95)',
        borderRadius: 28,
        paddingHorizontal: 6,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.2)',
        shadowColor: AppColors.manifestation.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    input: {
        flex: 1,
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 15,
        color: AppColors.manifestation.text,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: AppColors.manifestation.accent,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 2,
    },
});
