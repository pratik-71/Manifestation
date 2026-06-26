import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

// ⚠️ REVENUECAT CONFIGURATION
const REVENUECAT_API_KEY = {
    apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || 'appl_NOjdStGqfTaubQSbdVZeZNBWIuQ', // Apple App Store
    google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || 'goog_RSnVacpNQodPpCBoQTNvEantAmS', // Google Play Store
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
            if (!apiKey) {
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
const ensureInitialized = async (userId?: string) => {
    if (!isInitialized && !initializationPromise) {
        await initializePurchases(userId);
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
        // Pass the userId into configuration so it configures WITH the ID directly
        if (!await ensureInitialized(userId)) return null;
        
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
    if (Platform.OS === 'android') {
        return {
            availablePackages: [
                {
                    identifier: 'monthly',
                    packageType: 'MONTHLY',
                    product: {
                        identifier: 'manifestation_pro_monthly',
                        title: 'Manifestation Pro Monthly',
                        priceString: '$9.99',
                        price: 9.99,
                        currencyCode: 'USD'
                    }
                },
                {
                    identifier: 'yearly',
                    packageType: 'ANNUAL',
                    product: {
                        identifier: 'manifestation_pro_yearly',
                        title: 'Manifestation Pro Yearly',
                        priceString: '$49.99',
                        price: 49.99,
                        currencyCode: 'USD'
                    }
                }
            ]
        };
    }

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
    try {
        if (!await ensureInitialized()) return false;
        const customerInfo = await Purchases.getCustomerInfo();
        return Object.keys(customerInfo.entitlements.active).length > 0;
    } catch (e) {
        console.warn("❌ Subscription check failed [Safe String]");
        return false;
    }
};

/**
 * Purchase a specific package.
 */
export const purchasePackage = async (packageToPurchase: any) => {
    // Mock successful purchase in local development or Android
    if (isLocalDevelopment || Platform.OS === 'android') {
        console.log("🛠️ Mocking successful purchase for Android/Local");
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        return { success: true, isMock: true };
    }

    try {
        if (!await ensureInitialized()) {
            console.error("❌ RevenueCat not initialized for purchase");
            return { success: false, error: 'Purchase service not available' };
        }
        
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        if (Object.keys(customerInfo.entitlements.active).length > 0) {
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
    try {
        if (!await ensureInitialized()) return null;
        return await Purchases.getCustomerInfo();
    } catch (e) {
        console.warn("❌ Failed to get customer info [Safe String]");
        return null;
    }
};

/**
 * Restore previously purchased subscriptions.
 */
export const restorePurchases = async () => {
    // Mock successful restore in local development or Android
    if (isLocalDevelopment || Platform.OS === 'android') {
        console.log("🛠️ Mocking successful restore for Android/Local");
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
            success: Object.keys(customerInfo.entitlements.active).length > 0,
            customerInfo
        };
    } catch (e: any) {
        console.warn("❌ Restore failed [Safe String]");
        return { success: false, error: 'Restore failed' };
    }
};


