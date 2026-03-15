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

export default function TermsAndConditions() {
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
                    <Text style={styles.headerTitle}>TERMS & CONDITIONS</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(800)}>
                        <Text style={styles.lastUpdated}>Last Updated: March 15, 2026</Text>
                        
                        <Section 
                            title="Agreement to Terms" 
                            content="These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ('you') and Manifest ('we,' 'us' or 'our'), concerning your access to and use of our mobile application."
                        />

                        <Section 
                            title="Standard Apple EULA" 
                            content="Manifest also adheres to the standard Apple Licensed Application End User License Agreement. By using this App, you agree to the terms set forth by Apple for licensed applications."
                        />

                        <Section 
                            title="Subscription Policy" 
                            content="Manifest offers auto-renewable subscriptions. Payment will be charged to your Apple ID account at the confirmation of purchase. The subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period."
                        />

                        <Section 
                            title="Managing Subscriptions" 
                            content="You can manage and cancel your subscriptions by going to your App Store account settings after purchase. No cancellation of the current subscription is allowed during the active subscription period."
                        />

                        <Section 
                            title="User Content" 
                            content="You are responsible for the manifestation scripts, goals, and recordings you create. We do not claim ownership of your personal manifestation content. However, you must ensure your content does not violate any laws or third-party rights."
                        />

                        <Section 
                            title="Prohibited Activities" 
                            content="You may not access or use the App for any purpose other than that for which we make the App available. The App may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us."
                        />

                        <Section 
                            title="Limitation of Liability" 
                            content="To the maximum extent permitted by law, Manifest shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly."
                        />

                        <Section 
                            title="Changes to Terms" 
                            content="We reserve the right, in our sole discretion, to make changes or modifications to these Terms and Conditions at any time. We will alert you about any changes by updating the 'Last updated' date of these Terms and Conditions."
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Contact us: terms@manifestapp.com</Text>
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
