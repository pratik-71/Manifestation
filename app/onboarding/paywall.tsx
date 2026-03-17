import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ActivityIndicator, Dimensions, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { BreathingBackground } from '../../components/BreathingBackground';
import { AppColors } from '../../constants/Colors';
import { ENTITLEMENT_ID, getOfferings, purchasePackage, restorePurchases, checkSubscriptionStatus } from '../../services/purchaseService';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

const { width, height } = Dimensions.get('window');

const TESTIMONIALS_COL1 = [
    { id: '1', name: 'Sarah J.', text: "Manifested my dream career in 3 weeks!", rating: 5 },
    { id: '2', name: 'Michael R.', text: "AI guidance is pinpoint accurate.", rating: 4.5 },
    { id: '3', name: 'Elena T.', text: "My income has doubled since I started.", rating: 4 },
    { id: '4', name: 'David W.', text: "Premium is worth every penny.", rating: 5 },
];

const TESTIMONIALS_COL2 = [
    { id: '5', name: 'Sophie L.', text: "Helps me stay aligned daily. Game changer.", rating: 4.5 },
    { id: '6', name: 'James K.', text: "The future recording is incredibly powerful.", rating: 5 },
    { id: '7', name: 'Anna P.', text: "Finally a toolkit that actually works.", rating: 4 },
    { id: '8', name: 'Chris M.', text: "The energy shift is real. Manifesting now!", rating: 5 },
];

const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
        <View style={styles.starsRow}>
            {[...Array(fullStars)].map((_, i) => (
                <Ionicons key={`full-${i}`} name="star" size={8} color="#fb923c" />
            ))}
            {hasHalfStar && <Ionicons name="star-half" size={8} color="#fb923c" />}
            {[...Array(5 - Math.ceil(rating))].map((_, i) => (
                <Ionicons key={`empty-${i}`} name="star-outline" size={8} color="#fb923c" />
            ))}
        </View>
    );
};

// Helper for vertical loop
const VerticalTicker = ({ items, direction = 'down' }: { items: any[], direction?: 'up' | 'down' }) => {
    const scrollY = useSharedValue(0);
    const ITEM_CONTENT_HEIGHT = 80;
    const GAP = 12; // Increased gap for better spacing
    const TOTAL_ITEM_HEIGHT = ITEM_CONTENT_HEIGHT + GAP;
    const TOTAL_LIST_HEIGHT = items.length * TOTAL_ITEM_HEIGHT;

    React.useEffect(() => {
        // Animation duration - speed adjustment
        const duration = 25000;
        
        scrollY.value = withRepeat(
            withTiming(direction === 'down' ? TOTAL_LIST_HEIGHT : -TOTAL_LIST_HEIGHT, {
                duration,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, [TOTAL_LIST_HEIGHT]);

    const animatedStyle = useAnimatedStyle(() => {
        // Offset by one full list height initially to ensure we have content above/below
        const baseOffset = direction === 'down' ? -TOTAL_LIST_HEIGHT : 0;
        const val = scrollY.value % TOTAL_LIST_HEIGHT;
        return {
            transform: [{ translateY: baseOffset + val }],
        };
    });

    return (
        <View style={{ flex: 1, height: 200, overflow: 'hidden' }}>
            <Animated.View style={[animatedStyle, { gap: GAP }]}>
                {/* Render list 4 times to guarantee zero gaps at any scroll position */}
                {[...items, ...items, ...items, ...items].map((item, i) => (
                    <View key={i} style={styles.vTestimonialCard}>
                        <StarRating rating={item.rating} />
                        <Text numberOfLines={2} style={styles.vTestimonialText}>{item.text}</Text>
                        <Text style={styles.vTestimonialName}>— {item.name}</Text>
                    </View>
                ))}
            </Animated.View>
        </View>
    );
};

export default function Paywall() {
    const router = useRouter();
    const [offerings, setOfferings] = React.useState<PurchasesPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSubStatus, setCurrentSubStatus] = useState<'none' | 'monthly' | 'yearly'>('none');

    const checkStatus = async () => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const activeEntitlements = customerInfo.entitlements.active;
            
            if (activeEntitlements[ENTITLEMENT_ID]) {
                const sub = activeEntitlements[ENTITLEMENT_ID];
                // Check if it's monthly vs annual based on product identifier or package type
                // In mock mode we use identifiers 'monthly'/'yearly'
                if (sub.productIdentifier.includes('monthly') || sub.productIdentifier.includes('MONTHLY')) {
                    setCurrentSubStatus('monthly');
                } else {
                    setCurrentSubStatus('yearly');
                }
            } else {
                setCurrentSubStatus('none');
            }
        } catch (e) {
            console.error("Status check failed", e);
        }
    };

    React.useEffect(() => {
        const initPaywall = async () => {
            try {
                await checkStatus();
                
                // Load offerings
                const currentOffering = await getOfferings();
                if (currentOffering && currentOffering.availablePackages) {
                    setOfferings(currentOffering.availablePackages);
                    // Select yearly by default if available, else first one
                    const yearly = currentOffering.availablePackages.find((p: any) => p.packageType === 'ANNUAL');
                    setSelectedPackage(yearly || currentOffering.availablePackages[0]);
                }
            } catch (err) {
                console.error("Failed to initialize paywall", err);
            } finally {
                setIsLoading(false);
            }
        };
        initPaywall();
    }, []);

    const handlePurchase = async (pkg: PurchasesPackage) => {
        if (isProcessing) return;
        
        const isMonthly = pkg.packageType === 'MONTHLY' || pkg.identifier === 'monthly';
        setSelectedPackage(pkg);
        setIsProcessing(true);
        
        try {
            const result = await purchasePackage(pkg);
            if (result.success) {
                // Instantly update UI for testing
                if (isMonthly) {
                    setCurrentSubStatus('monthly');
                } else {
                    setCurrentSubStatus('yearly');
                }
            } else if (!result.cancelled) {
                Alert.alert('Purchase Failed', result.error || 'Please try again later.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const monthlyPkg = offerings.find(p => p.packageType === 'MONTHLY' || p.identifier === 'monthly');
    const yearlyPkg = offerings.find(p => p.packageType === 'ANNUAL' || p.identifier === 'yearly');

    const handleRestore = async () => {
        setIsProcessing(true);
        try {
            const result = await restorePurchases();
            if (result.success) {
                Alert.alert('Success', 'Your purchase has been restored.', [
                    { text: 'OK', onPress: () => router.replace('/home') }
                ]);
            } else {
                Alert.alert('Notice', 'No active subscriptions found for your account.');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'An unexpected error occurred during restore.');
        } finally {
            setIsProcessing(false);
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
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
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
                        <Text style={styles.title}>
                            {currentSubStatus === 'none' ? 'Step Into Your Dream' : 'WOWWWW'}
                        </Text>
                        {currentSubStatus !== 'none' && (
                            <Animated.View entering={FadeInUp.delay(400)}>
                                <Ionicons name="heart" size={32} color="#fb923c" style={styles.heartIcon} />
                            </Animated.View>
                        )}
                        <Text style={styles.tagline}>
                            {currentSubStatus === 'none' 
                                ? 'Unlock the frequency of success. Join 10,000+ souls manifesting their dream life every single day.'
                                : currentSubStatus === 'monthly'
                                    ? 'You Have Monthly Active plan'
                                    : 'Congratulations! You have Yearly Active plan'}
                        </Text>
                    </Animated.View>

                    {currentSubStatus === 'none' && (
                        <View style={styles.dualTickerContainer}>
                            <VerticalTicker items={TESTIMONIALS_COL1} direction="down" />
                            <View style={{ width: 12 }} />
                            <VerticalTicker items={TESTIMONIALS_COL2} direction="up" />
                        </View>
                    )}

                    {/* Content Section based on status */}
                    <View style={styles.plansContainer}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#fb923c" />
                        ) : currentSubStatus === 'none' ? (
                            [...offerings]
                                .sort((a, b) => {
                                    if (a.packageType === 'ANNUAL') return -1;
                                    if (b.packageType === 'ANNUAL') return 1;
                                    return 0;
                                })
                                .map((pkg, index) => {
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
                                                    activeOpacity={0.85}
                                                    onPress={() => handlePurchase(pkg)}
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
                                                            <Text style={styles.planSubtext}>
                                                                {pkg.packageType === 'ANNUAL' ? '3 days free, then full access' : 'Full access'}
                                                            </Text>
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
                            <Animated.View entering={FadeInUp} style={styles.activePlanContainer}>
                                {currentSubStatus === 'monthly' ? (
                                    <View style={styles.upgradeSection}>
                                        <Text style={styles.upgradeTitle}>UPGRADE TO YEARLY</Text>
                                        {yearlyPkg && (
                                            <View style={styles.cardWrapper}>
                                                <Animated.View
                                                    entering={FadeInDown.delay(200).duration(600)}
                                                    style={styles.floatingBadge}
                                                >
                                                    <Text style={styles.bestValueText}>BEST VALUE</Text>
                                                </Animated.View>
                                                <TouchableOpacity
                                                    activeOpacity={0.85}
                                                    onPress={() => handlePurchase(yearlyPkg)}
                                                    style={[styles.planCard, styles.planCardActive, { marginTop: 10 }]}
                                                >
                                                    <View style={styles.radioRow}>
                                                        <View style={styles.radioCircle}>
                                                            <View style={styles.radioInner} />
                                                        </View>
                                                        <View style={styles.planInfo}>
                                                            <Text style={styles.planName}>{yearlyPkg.product.title}</Text>
                                                            <Text style={styles.planSubtext}>Full access • Save 50%</Text>
                                                        </View>
                                                        <View style={styles.priceContainer}>
                                                            <Text style={styles.planPrice}>{yearlyPkg.product.priceString}</Text>
                                                            <Text style={styles.planPeriod}>/year</Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        <TouchableOpacity 
                                            style={[styles.manageBtn, { marginTop: 20 }]} 
                                            onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
                                        >
                                            <Text style={styles.manageBtnText}>Manage Subscription</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.manageBtn} onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}>
                                        <Text style={styles.manageBtnText}>Manage Subscription</Text>
                                    </TouchableOpacity>
                                )}
                                
                                <TouchableOpacity 
                                    style={[styles.manageBtn, { marginTop: 20, borderColor: 'rgba(255,255,255,0.2)' }]} 
                                    onPress={() => router.replace('/home')}
                                >
                                    <Text style={[styles.manageBtnText, { color: '#fff' }]}>CONTINUE TO APP</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </View>

                    {/* CTA Section (Visible only when not subscribed) */}
                    <View style={styles.footerAction}>
                        {currentSubStatus === 'none' && (
                            <>
                                {isProcessing && (
                                    <View style={{ marginBottom: 10 }}>
                                        <ActivityIndicator color="#fb923c" size="small" />
                                        <Text style={[styles.trialText, { marginTop: 8 }]}>Processing your request...</Text>
                                    </View>
                                )}

                                <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
                                    <Text style={styles.restoreText}>Restore Purchase</Text>
                                </TouchableOpacity>

                                <View style={styles.legalLinks}>
                                    <TouchableOpacity onPress={() => Linking.openURL('https://zenvy-venture.vercel.app/manifest/privacy-policy')}>
                                        <Text style={styles.legalText}>Privacy Policy</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.legalDot}>•</Text>
                                    <TouchableOpacity onPress={() => Linking.openURL('https://zenvy-venture.vercel.app/manifest/terms-conditions')}>
                                        <Text style={styles.legalText}>Terms & Conditions</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.legalDot}>•</Text>
                                    <TouchableOpacity onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
                                        <Text style={styles.legalText}>Apple EULA</Text>
                                    </TouchableOpacity>
                                </View>

                            </>
                        )}
                        {/* Subtle Skip button for development/testing */}
                        <TouchableOpacity 
                            style={styles.skipBtn} 
                            onPress={() => router.replace('/home')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.skipBtnText}>Skip for now</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
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
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
    },
    brandSection: {
        alignItems: 'center',
        marginTop: 25,
        marginBottom: 15,
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
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: 'rgba(251, 146, 60, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },
    heartIcon: {
        marginBottom: 10,
        textShadowColor: 'rgba(251, 146, 60, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    tagline: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    dualTickerContainer: {
        flexDirection: 'row',
        height: 200,
        marginTop: 10,
        marginBottom:2
    },
    vTestimonialCard: {
        height: 80,
        backgroundColor: 'rgba(251, 146, 60, 0.04)',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(251, 146, 60, 0.08)',
        justifyContent: 'center',
    },
    vTestimonialText: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 13,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    vTestimonialName: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 9,
        color: '#fb923c',
        opacity: 0.7,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 1,
        marginBottom: 4,
    },
    plansContainer: {
        gap: 12,
        marginTop: 40,
        marginBottom: 10,
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
        right: 20,
        backgroundColor: '#fb923c',
        paddingHorizontal: 12,
        paddingVertical: 4,
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
        textAlign: 'left',
    },
    quickBuyText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: '#fb923c',
    },
    activePlanContainer: {
        alignItems: 'center',
        padding: 20,
        gap: 15,
    },
    upgradeBtn: {
        width: '100%',
        height: 56,
        backgroundColor: '#fb923c',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#fb923c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    upgradeBtnText: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: '#000',
        letterSpacing: 1,
    },
    manageBtn: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(251, 146, 60, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    manageBtnText: {
        fontFamily: 'Comfortaa_600SemiBold',
        fontSize: 14,
        color: '#fb923c',
    },
    skipBtn: {
        marginTop: 30,
        marginBottom: 20,
        padding: 10,
        alignItems: 'center',
    },
    skipBtnText: {
        fontFamily: 'Comfortaa_400Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.2)',
        textDecorationLine: 'underline',
    },
    upgradeSection: {
        width: '100%',
        alignItems: 'center',
    },
    upgradeTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: '#fb923c',
        letterSpacing: 2,
        marginBottom: 15,
        opacity: 0.9,
    },
});
