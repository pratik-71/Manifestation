import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesOffering } from 'react-native-purchases';

// ⚠️ REVENUECAT CONFIGURATION
const REVENUECAT_API_KEY = {
    apple: 'appl_NOjdStGqfTaubQSbdVZeZNBWIuQ', // Apple App Store
    google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || 'goog_EXAMPLE_GOOGLE_KEY', // Google Play Store
};

export const ENTITLEMENT_ID = 'Manifestation_Pro'; // Matches your RevenueCat Entitlement Name

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize RevenueCat SDK with appropriate API keys.
 * Uses a singleton promise to ensure configuration attempt happens exactly once
 * and subsequent calls wait for the same result.
 */
export const initializePurchases = async (userId?: string) => {
    if (isInitialized) return;
    if (initializationPromise) return initializationPromise;

    initializationPromise = (async () => {
        try {
            // Avoid double configuration entirely with a local flag check
            if (isInitialized) return;

            // 500ms delay to ensure the native bridge and JS environment are fully stable.
            // This moves the initialization out of the high-stress startup window.
            await new Promise(resolve => setTimeout(resolve, 500));

            const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY.apple : REVENUECAT_API_KEY.google;

            // Simplified check to avoid string prototype calls (like .includes) 
            // during the delicate JSI heap initialization phase.
            if (!apiKey || apiKey === 'goog_EXAMPLE_GOOGLE_KEY') {
                return;
            }

            // CRITICAL: We call configure() with a clean, hardcoded-style configuration object.
            try {
                const config: any = { apiKey };
                if (userId && userId.trim()) {
                    config.appUserID = userId;
                }
                
                // Final safeguard: ensure no other native methods are called before/after
                Purchases.configure(config);
                isInitialized = true;
                console.log("✅ RevenueCat initialized");
            } catch (err) {
                console.error("❌ RC configure error:", err);
            }
        } catch (e) {
            console.error("❌ RC: Unexpected error in init():", e);
        } finally {
            initializationPromise = null;
        }
    })();

    return initializationPromise;
};

/**
 * Helper to ensure the SDK is configured before calling any other methods.
 */
const ensureInitialized = async () => {
    if (!isInitialized && !initializationPromise) {
        await initializePurchases();
    }
    if (initializationPromise) {
        await initializationPromise;
    }
    return isInitialized;
};

/**
 * Identify the user in RevenueCat using their Supabase/Google ID.
 */
export const identifyUser = async (userId: string) => {
    try {
        if (!await ensureInitialized()) return null;
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
        if (!await ensureInitialized()) return;
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
        if (!await ensureInitialized()) {
            console.warn("🛠️ RevenueCat: Not initialized. Returning mocks.");
            return getFallbackOfferings();
        }
        
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
            return offerings.current;
        }
        
        return getFallbackOfferings();
    } catch (e) {
        console.error("❌ Failed to fetch offerings:", e);
        return getFallbackOfferings();
    }
};

const getFallbackOfferings = () => ({
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
});

/**
 * Check if the user has an active pro subscription.
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
    try {
        if (!await ensureInitialized()) return false;
        
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
 * Includes a development mock mode if the service is not initialized or uses example keys.
 */
export const purchasePackage = async (packageToPurchase: any) => {
    try {
        if (!await ensureInitialized()) {
            console.warn("🛠️ RevenueCat: Mocking purchase for development");
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
            return { success: true, isMock: true };
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
 * Get the latest customer info from RevenueCat.
 */
export const getCustomerInfo = async () => {
    try {
        if (!await ensureInitialized()) {
            // Return a mock customerInfo with no active entitlements
            return { entitlements: { active: {} }, latestExpirationDate: null };
        }
        return await Purchases.getCustomerInfo();
    } catch (e) {
        console.error("❌ Failed to get customer info:", e);
        return null;
    }
};

/**
 * Restore previously purchased subscriptions.
 * Includes a development mock mode if the service is not initialized.
 */
export const restorePurchases = async () => {
    try {
        if (!await ensureInitialized()) {
            console.warn("🛠️ RevenueCat: Mocking restore for development - simulating failure to match actual logic");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: false, isMock: true };
        }
        
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


