import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ActivityIndicator, Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BreathingBackground } from '../../components/BreathingBackground';
import { AppColors } from '../../constants/Colors';
import { getOfferings, purchasePackage } from '../../services/purchaseService';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

const { width, height } = Dimensions.get('window');

export default function Paywall() {
    const router = useRouter();
    const [offerings, setOfferings] = React.useState<PurchasesPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const loadOfferings = async () => {
            try {
                const currentOffering = await getOfferings();
                if (currentOffering && currentOffering.availablePackages) {
                    setOfferings(currentOffering.availablePackages);
                    // Select yearly by default if available, else first one
                    const yearly = currentOffering.availablePackages.find(p => p.packageType === 'ANNUAL');
                    setSelectedPackage(yearly || currentOffering.availablePackages[0]);
                }
            } catch (err) {
                console.error("Failed to load offerings", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadOfferings();
    }, []);

    const handlePurchase = async () => {
        if (!selectedPackage || isProcessing) return;
        
        setIsProcessing(true);
        try {
            const result = await purchasePackage(selectedPackage);
            if (result.success) {
                router.replace('/home');
            } else if (!result.cancelled) {
                Alert.alert('Purchase Failed', result.error || 'Please try again later.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRestore = async () => {
        try {
            const customerInfo = await Purchases.restorePurchases();
            if (customerInfo.entitlements.active['pro']) {
                Alert.alert('Success', 'Your purchase has been restored.', [
                    { text: 'OK', onPress: () => router.replace('/home') }
                ]);
            } else {
                Alert.alert('Restore Failed', 'No active subscriptions found for your account.');
            }
        } catch (err) {
            console.error(err);
        }
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
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#fb923c" />
                        ) : offerings.length > 0 ? (
                            offerings.map((pkg, index) => {
                                const isBestValue = pkg.packageType === 'ANNUAL';
                                return (
                                    <View key={pkg.identifier} style={styles.cardWrapper}>
                                        {isBestValue && (
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
                                                onPress={() => setSelectedPackage(pkg)}
                                                style={[
                                                    styles.planCard,
                                                    selectedPackage?.identifier === pkg.identifier ? styles.planCardActive : styles.planCardInactive
                                                ]}
                                            >
                                                <View style={styles.radioRow}>
                                                    <View style={[
                                                        styles.radioCircle,
                                                        { borderColor: selectedPackage?.identifier === pkg.identifier ? '#fb923c' : 'rgba(255,255,255,0.15)' }
                                                    ]}>
                                                        {selectedPackage?.identifier === pkg.identifier && <View style={styles.radioInner} />}
                                                    </View>
                                                    <View style={styles.planInfo}>
                                                        <Text style={styles.planName}>{pkg.product.title}</Text>
                                                        <Text style={styles.planSubtext}>{pkg.product.description}</Text>
                                                    </View>
                                                    <View style={styles.priceContainer}>
                                                        <Text style={styles.planPrice}>{pkg.product.priceString}</Text>
                                                        <Text style={styles.planPeriod}>{pkg.packageType === 'ANNUAL' ? '/year' : '/period'}</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    </View>
                                );
                            })
                        ) : (
                            <Text className="text-white/50 text-center italic">No active offerings available.</Text>
                        )}
                    </View>

                    {/* CTA Section */}
                    <View style={styles.footerAction}>
                        <Text style={styles.trialText}> Cancel anytime</Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handlePurchase}
                            disabled={isProcessing || !selectedPackage}
                            style={styles.subscribeButton}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.subscribeText}>START MY TRANSFORMATION</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
                            <Text style={styles.restoreText}>Restore Purchase</Text>
                        </TouchableOpacity>

                        <View style={styles.legalLinks}>
                            <TouchableOpacity onPress={() => Linking.openURL('https://zenvy-venture.vercel.app/manifest/privacy-policy')}>
                                <Text style={styles.legalText}>Privacy Policy</Text>
                            </TouchableOpacity>
                            <Text style={styles.legalDot}>•</Text>
                            <TouchableOpacity onPress={() => Linking.openURL('https://zenvy-venture.vercel.app/manifest/terms-conditions')}>
                                <Text style={styles.legalText}>EULA & Terms</Text>
                            </TouchableOpacity>
                            <Text style={styles.legalDot}>•</Text>
                            <TouchableOpacity onPress={() => router.push('/legal/features' as any)}>
                                <Text style={styles.legalText}>Features</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.disclosureSection}>
                            <Text style={styles.disclosureText}>
                                • Payment will be charged to your iTunes Account at confirmation of purchase.{"\n"}
                                • Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.{"\n"}
                                • Account will be charged for renewal within 24-hours prior to the end of the current period at the rate of the selected plan.{"\n"}
                                • Subscriptions may be managed and auto-renewal turned off by going to your Account Settings after purchase.
                            </Text>
                        </View>
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
    legalLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 5,
        paddingBottom: 10,
    },
    legalText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
    },
    legalDot: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.2)',
    },
    disclosureSection: {
        marginTop: 15,
        paddingHorizontal: 10,
    },
    disclosureText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 9,
        color: 'rgba(255,255,255,0.25)',
        lineHeight: 14,
        textAlign: 'center',
    },
});
