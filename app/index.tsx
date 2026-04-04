import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { getCurrentUser } from '../services/authService';

export default function Index() {
    const [destination, setDestination] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Stage 4: Post-Blackout Auth Resolve
        const timer = setTimeout(async () => {
            let nextRoute = '/onboarding/Opening_Page';
            try {
                const user = await getCurrentUser();
                if (user) {
                    // Stage 4.1: Safe Native Sidekick Inits
                    try {
                        const { identifyUser } = await import('../services/purchaseService');
                        await identifyUser(user.id);
                    } catch (rcError) {
                        console.warn("RC identify deferred");
                    }

                    try {
                        const { hasCompletedOnboarding } = await import('../services/profileService');
                        const complete = await hasCompletedOnboarding(user.id);
                        if (complete) {
                            nextRoute = '/home';
                        }
                    } catch (profError) {
                        console.warn("Profile check deferred");
                    }
                }
            } catch (err) {
                // Avoid logging 'err' object itself to prevent Hermes stack-getter crash
                console.warn("Auth check deferred safely");
            } finally {
                setDestination(nextRoute);
                setLoading(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    if (loading || !destination) {
        // Return a blank dark screen while checking auth to prevent UI flicker
        return <View style={{ flex: 1, backgroundColor: '#000' }} />;
    }

    return <Redirect href={destination} />;
}
