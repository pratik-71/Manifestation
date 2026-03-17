import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesOffering } from 'react-native-purchases';

// ⚠️ REVENUECAT CONFIGURATION
const REVENUECAT_API_KEY = {
    apple: 'appl_NOjdStGqfTaubQSbdVZeZNBWIuQ', // Apple App Store
    google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || 'goog_EXAMPLE_GOOGLE_KEY', // Google Play Store
};

export const ENTITLEMENT_ID = 'Manifestation_Pro'; // Matches your RevenueCat Entitlement Name

export const initializePurchases = async (userId?: string) => {
    try {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        
        if (Platform.OS === 'android') {
            await Purchases.configure({ apiKey: REVENUECAT_API_KEY.google, appUserID: userId });
        } else if (Platform.OS === 'ios') {
            await Purchases.configure({ apiKey: REVENUECAT_API_KEY.apple, appUserID: userId });
        }
        
        console.log("✅ RevenueCat initialized");
    } catch (e) {
        console.error("❌ Failed to initialize RevenueCat:", e);
    }
};

/**
 * Identify the user in RevenueCat using their Supabase/Google ID.
 * This ensures purchases are linked to their account across devices.
 */
export const identifyUser = async (userId: string) => {
    try {
        const result = await Purchases.logIn(userId);
        console.log("✅ User identified in RevenueCat:", userId);
        return result.customerInfo;
    } catch (e) {
        console.error("❌ Failed to identify user in RevenueCat:", e);
        return null;
    }
};

/**
 * Log out from RevenueCat identity.
 */
export const logoutPurchases = async () => {
    try {
        await Purchases.logOut();
        console.log("✅ Logged out from RevenueCat");
    } catch (e) {
        console.error("❌ Failed to logout from RevenueCat:", e);
    }
};

/**
 * Fetch available subscription offerings.
 */
export const getOfferings = async (): Promise<any | null> => {
    try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
            return offerings.current;
        }
        
        // Fallback Mock Data for UI Testing
        console.log("🛠️ RevenueCat: No real offerings found. Returning mocks.");
        return {
            availablePackages: [
                {
                    identifier: 'monthly',
                    packageType: 'MONTHLY',
                    product: {
                        identifier: 'manifestation_monthly',
                        description: 'Monthly unlimited AI access',
                        title: 'Premium Monthly',
                        price: 4.99,
                        priceString: '$4.99/mo',
                        currencyCode: 'USD',
                    }
                },
                {
                    identifier: 'yearly',
                    packageType: 'ANNUAL',
                    product: {
                        identifier: 'manifestation_yearly',
                        description: 'Yearly vision roadmap + Pro features',
                        title: 'Premium Yearly',
                        price: 29.99,
                        priceString: '$29.99/yr',
                        currencyCode: 'USD',
                    }
                }
            ]
        };
    } catch (e) {
        console.error("❌ Failed to fetch offerings:", e);
        // Fallback even on error
        return {
            availablePackages: [
                {
                    identifier: 'monthly',
                    packageType: 'MONTHLY',
                    product: {
                        identifier: 'manifestation_monthly',
                        description: 'Monthly unlimited AI access',
                        title: 'Premium Monthly',
                        price: 4.99,
                        priceString: '$4.99/mo',
                        currencyCode: 'USD',
                    }
                },
                {
                    identifier: 'yearly',
                    packageType: 'ANNUAL',
                    product: {
                        identifier: 'manifestation_yearly',
                        description: 'Yearly vision roadmap + Pro features',
                        title: 'Premium Yearly',
                        price: 29.99,
                        priceString: '$29.99/yr',
                        currencyCode: 'USD',
                    }
                }
            ]
        };
    }
};

/**
 * Check if the user has an active pro subscription.
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
    try {
        // If no key is set and we're on Android, we're in mock mode
        if (Platform.OS === 'android' && REVENUECAT_API_KEY.google === 'goog_EXAMPLE_GOOGLE_KEY') {
            return false;
        }

        const customerInfo = await Purchases.getCustomerInfo();
        return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    } catch (e) {
        console.error("❌ Failed to check subscription status:", e);
        return false;
    }
};

/**
 * Purchase a specific package.
 */
export const purchasePackage = async (packageToPurchase: any) => {
    try {
        // 🧪 Handle Mock Packages for Dev/Testing
        const isMock = packageToPurchase.identifier === 'monthly' || packageToPurchase.identifier === 'yearly';
        if (isMock || (Platform.OS === 'android' && REVENUECAT_API_KEY.google === 'goog_EXAMPLE_GOOGLE_KEY')) {
            console.log("🛠️ RevenueCat Mock: Simulating successful purchase for", packageToPurchase.identifier);
            return { success: true };
        }

        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
            return { success: true, customerInfo };
        }
        return { success: false, error: 'Entitlement not active' };
    } catch (error: any) {
        if (!error.userCancelled) {
            console.error("❌ Purchase failed:", error);
            return { success: false, error: error.message };
        }
        return { success: false, cancelled: true };
    }
};
/**
 * Restore previously purchased subscriptions.
 */
export const restorePurchases = async () => {
    try {
        const customerInfo = await Purchases.restorePurchases();
        return {
            success: !!customerInfo.entitlements.active[ENTITLEMENT_ID],
            customerInfo
        };
    } catch (e: any) {
        console.error("❌ Restore failed:", e);
        return { success: false, error: e.message };
    }
};
