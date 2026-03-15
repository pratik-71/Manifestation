import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesOffering } from 'react-native-purchases';

// ⚠️ REVENUECAT CONFIGURATION
// Replace these with your actual keys from the RevenueCat dashboard
const REVENUECAT_API_KEY = {
    apple: 'appl_NOjdStGqfTaubQSbdVZeZNBWIuQ', // Apple App Store
    google: 'goog_EXAMPLE_GOOGLE_KEY', // Google Play Store
};

const ENTITLEMENT_ID = 'Manifestation_Pro'; // Matches your RevenueCat Entitlement Name

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
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
    try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null) {
            return offerings.current;
        }
        return null;
    } catch (e) {
        console.error("❌ Failed to fetch offerings:", e);
        return null;
    }
};

/**
 * Check if the user has an active pro subscription.
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
    try {
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
