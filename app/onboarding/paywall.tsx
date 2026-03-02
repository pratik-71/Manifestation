import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BreathingBackground } from '../../components/BreathingBackground';
import { AppColors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

const PLANS = [
    {
        id: 'weekly',
        name: 'Weekly Access',
        price: '$2.99',
        period: 'week',
        sub: 'Perfect for a quick reset',
        bestValue: false
    },
    {
        id: 'yearly',
        name: 'Yearly Mastery',
        price: '$49.99',
        period: 'year',
        sub: 'Most popular choice (Save 65%)',
        bestValue: true
    },
] as const;

export default function Paywall() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'yearly'>('yearly');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePurchase = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            router.replace('/guide');
        }, 2000);
    };

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" />

            <BreathingBackground
                colors={AppColors.gradients.purple}
                opacity={0.6}
            />
            <View style={styles.overlay} pointerEvents="none" />

            <SafeAreaView style={styles.safe}>
    
                <View style={styles.content}>
                    {/* Brand Section */}
                    <Animated.View entering={FadeInUp.duration(600)} style={styles.brandSection}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.brandTitle}>Manifest</Text>
                    </Animated.View>

                    {/* Hero Section */}
                    <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.hero}>
                        <Text style={styles.title}>Step Into Your Power</Text>
                        <Text style={styles.tagline}>
                            Unlock the frequency of success. Join 10,000+ souls manifesting their dream life every single day.
                        </Text>
                    </Animated.View>

                    {/* Plans Grid */}
                    <View style={styles.plansContainer}>
                        {PLANS.map((plan, index) => (
                            <View key={plan.id} style={styles.cardWrapper}>
                                {plan.bestValue && (
                                    <Animated.View
                                        entering={FadeInDown.delay(600).duration(400)}
                                        style={styles.floatingBadge}
                                    >
                                        <Text style={styles.bestValueText}>BEST VALUE</Text>
                                    </Animated.View>
                                )}
                                <Animated.View
                                    entering={FadeInDown.delay(400 + index * 100).duration(600)}
                                    style={{ width: '100%' }}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => setSelectedPlan(plan.id)}
                                        style={[
                                            styles.planCard,
                                            selectedPlan === plan.id ? styles.planCardActive : styles.planCardInactive
                                        ]}
                                    >
                                        <View style={styles.radioRow}>
                                            <View style={[
                                                styles.radioCircle,
                                                { borderColor: selectedPlan === plan.id ? '#fb923c' : 'rgba(255,255,255,0.15)' }
                                            ]}>
                                                {selectedPlan === plan.id && <View style={styles.radioInner} />}
                                            </View>
                                            <View style={styles.planInfo}>
                                                <Text style={styles.planName}>{plan.name}</Text>
                                                <Text style={styles.planSubtext}>{plan.sub}</Text>
                                            </View>
                                            <View style={styles.priceContainer}>
                                                <Text style={styles.planPrice}>{plan.price}</Text>
                                                <Text style={styles.planPeriod}>/{plan.period}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        ))}
                    </View>

                    {/* CTA Section */}
                    <View style={styles.footerAction}>
                        <Text style={styles.trialText}> Cancel anytime</Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handlePurchase}
                            disabled={isProcessing}
                            style={styles.subscribeButton}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.subscribeText}>START MY TRANSFORMATION</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.restoreBtn} onPress={() => { }}>
                            <Text style={styles.restoreText}>Restore Purchase</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#000'
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    safe: {
        flex: 1
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        height: 50,
        alignItems: 'flex-end',
    },
    closeButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingBottom: 10,
        paddingTop: 30,
        justifyContent: 'space-between',
    },
    brandSection: {
        alignItems: 'center',
        marginTop: 5,
    },
    logoImage: {
        width: 44,
        height: 44,
        tintColor: '#fff',
        marginBottom: 6,
    },
    brandTitle: {
        fontFamily: 'DancingScript_400Regular',
        fontSize: 28,
        color: '#fff',
        letterSpacing: 0.5,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: 'rgba(251, 146, 60, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },
    tagline: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 15,
    },
    plansContainer: {
        gap: 20,
        marginVertical: 15,
    },
    cardWrapper: {
        width: '100%',
        position: 'relative',
    },
    planCard: {
        width: '100%',
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderRadius: 22,
        borderWidth: 1.2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    planCardActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        borderColor: '#fb923c',
    },
    planCardInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    floatingBadge: {
        position: 'absolute',
        top: -10,
        left: 20,
        backgroundColor: '#fb923c',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        zIndex: 10,
        shadowColor: '#fb923c',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    bestValueText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 9,
        color: '#000',
        letterSpacing: 0.5,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fb923c',
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: '#fff',
        marginBottom: 2,
    },
    planSubtext: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    planPrice: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#fff',
    },
    planPeriod: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
    },
    footerAction: {
        alignItems: 'center',
        gap: 14,
    },
    trialText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        fontStyle: 'italic',
    },
    subscribeButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 30,
        backgroundColor: '#fb923c',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#fb923c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    subscribeText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 15,
        color: '#fff',
        letterSpacing: 1,
    },
    restoreBtn: {
        padding: 4,
    },
    restoreText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
        textDecorationLine: 'underline',
    },
});
