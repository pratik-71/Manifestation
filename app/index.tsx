import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { getCurrentUser } from '../services/authService';

export default function Index() {
    const [destination, setDestination] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            let nextRoute = '/onboarding/Opening_Page';
            try {
                const user = await getCurrentUser();
                if (user) {
                    const { identifyUser } = await import('../services/purchaseService');
                    await identifyUser(user.id);

                    const { hasCompletedOnboarding } = await import('../services/profileService');
                    const complete = await hasCompletedOnboarding(user.id);
                    if (complete) {
                        nextRoute = '/home';
                    }
                }
            } catch (err) {
                console.error("Auth check failed in Index", err);
            } finally {
                setDestination(nextRoute);
            }
        };

        checkAuth();
    }, []);

    if (!destination) {
        // Return a blank dark screen while checking auth to prevent UI flicker
        return <View style={{ flex: 1, backgroundColor: '#000' }} />;
    }

    return <Redirect href={destination} />;
}
