import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

// ⚠️ REVENUECAT CONFIGURATION
const REVENUECAT_API_KEY = {
    apple: 'appl_NOjdStGqfTaubQSbdVZeZNBWIuQ', // Apple App Store
    google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || 'goog_EXAMPLE_GOOGLE_KEY', // Google Play Store
};

export const ENTITLEMENT_ID = 'Manifestation_Pro'; // Matches your RevenueCat Entitlement Name

// Development environment detection
const isLocalDevelopment = __DEV__ && (
    Platform.OS === 'web' || 
    process.env.NODE_ENV === 'development' ||
    process.env.EXPO_ENV === 'development'
);

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
                console.warn("❌ RC configure failure [Safe String]");
            }
        } catch (e) {
            console.warn("❌ RC: Unexpected error [Safe String]");
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
        console.warn("❌ RevenueCat user ID failed [Safe String]");
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
        console.warn("❌ RevenueCat logout failed [Safe String]");
    }
};

/**
 * Fetch available subscription offerings.
 */
export const getOfferings = async (): Promise<any | null> => {
    try {
        if (!await ensureInitialized()) {
            console.error("❌ RevenueCat not initialized");
            return null;
        }
        
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
            return offerings.current;
        }
        
        console.warn("⚠️ No offerings available");
        return null;
    } catch (e) {
        console.warn("❌ RevenueCat offerings fetch failed [Safe String]");
        return null;
    }
};


/**
 * Check if the user has an active pro subscription.
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
    // Auto-grant subscription for all users (Free Access)
    console.log("🔓 Free Access: Auto-granting subscription");
    return true;
};

/**
 * Purchase a specific package.
 */
export const purchasePackage = async (packageToPurchase: any) => {
    // Mock successful purchase in local development
    if (isLocalDevelopment) {
        console.log("🛠️ Local development: Mocking successful purchase");
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        return { success: true, isMock: true };
    }

    try {
        if (!await ensureInitialized()) {
            console.error("❌ RevenueCat not initialized for purchase");
            return { success: false, error: 'Purchase service not available' };
        }
        
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
            return { success: true, customerInfo };
        }
        return { success: false, error: 'Entitlement not active' };
    } catch (error: any) {
        if (!error.userCancelled) {
            console.warn("❌ Purchase failed [Safe String]");
            return { success: false, error: 'Purchase failed' };
        }
        return { success: false, cancelled: true };
    }
};

/**
 * Get the latest customer info from RevenueCat.
 */
export const getCustomerInfo = async () => {
    // Return mock active subscription for all users (Free Access)
    console.log("🔓 Free Access: Returning active subscription info");
    return {
        entitlements: {
            active: {
                [ENTITLEMENT_ID]: {
                    productIdentifier: 'manifestation_yearly',
                    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 10).toISOString(), // 10 years from now
                }
            }
        },
        latestExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 10).toISOString()
    };
};

/**
 * Restore previously purchased subscriptions.
 */
export const restorePurchases = async () => {
    // Mock successful restore in local development
    if (isLocalDevelopment) {
        console.log("🛠️ Local development: Mocking successful restore");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, isMock: true };
    }

    try {
        if (!await ensureInitialized()) {
            console.error("❌ RevenueCat not initialized for restore");
            return { success: false, error: 'Purchase service not available' };
        }
        
        const customerInfo = await Purchases.restorePurchases();
        return {
            success: !!customerInfo.entitlements.active[ENTITLEMENT_ID],
            customerInfo
        };
    } catch (e: any) {
        console.warn("❌ Restore failed [Safe String]");
        return { success: false, error: 'Restore failed' };
    }
};


