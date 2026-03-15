import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BreathingBackground } from '../../components/BreathingBackground';

export default function PrivacyPolicy() {
    const router = useRouter();

    const Section = ({ title, content }: { title: string; content: string }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionContent}>{content}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <BreathingBackground
                colors={['#0f172a', '#1c1917', '#451a03']}
                opacity={0.8}
            />
            
            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>PRIVACY POLICY</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(800)}>
                        <Text style={styles.lastUpdated}>Last Updated: March 15, 2026</Text>
                        
                        <Section 
                            title="Introduction" 
                            content="Welcome to Manifest. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us."
                        />

                        <Section 
                            title="Information We Collect" 
                            content="We collect personal information that you voluntarily provide to us when you register on the App, express an interest in obtaining information about us or our products and services, when you participate in activities on the App or otherwise when you contact us. The personal information we collect may include: Name, Email Address, and any Manifestation data you enter into the app."
                        />

                        <Section 
                            title="Manifestation Data" 
                            content="Your dream scripts, affirmations, and voice/video recordings are stored securely in our private storage. We do not share this deeply personal data with any third parties for marketing purposes. This information is used solely to provide and improve your manifestation experience."
                        />

                        <Section 
                            title="How We Use Your Information" 
                            content="We use personal information collected via our App for a variety of business purposes described below: To facilitate account creation and logon process, to send administrative information to you, and to fulfill and manage your orders/subscriptions."
                        />

                        <Section 
                            title="Will Your Information Be Shared?" 
                            content="We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We use Supabase for authentication and database management, and RevenueCat for subscription handling."
                        />

                        <Section 
                            title="Data Security" 
                            content="We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure."
                        />

                        <Section 
                            title="App Store Compliance" 
                            content="Manifest complies with Apple's App Store guidelines regarding data privacy and security. We do not use your data for advertising tracking without your explicit permission."
                        />

                        <Section 
                            title="Your Privacy Rights" 
                            content="In some regions, such as the European Economic Area, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time via the Profile settings."
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Contact us: privacy@manifestapp.com</Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    safe: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 14,
        color: '#fff',
        letterSpacing: 2,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    lastUpdated: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 30,
        textAlign: 'center',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 18,
        color: '#fb923c',
        marginBottom: 12,
    },
    sectionContent: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 24,
    },
    footer: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    footerText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
    },
});
