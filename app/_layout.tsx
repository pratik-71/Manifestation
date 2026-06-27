import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { Comfortaa_400Regular, Comfortaa_700Bold } from '@expo-google-fonts/comfortaa';
import {
    CormorantGaramond_400Regular,
    CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import { DancingScript_700Bold } from '@expo-google-fonts/dancing-script';

import '../global.css';

// Prevent the native splash from auto-hiding before we are ready
SplashScreen.preventAutoHideAsync().catch(() => {});

// Delayed load for secondary assets — does not block startup
const GlobalCosmicBackground = React.lazy(() =>
    import('../components/GlobalCosmicBackground').then((m) => ({
        default: m.GlobalCosmicBackground,
    }))
);

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Comfortaa_400Regular,
        Comfortaa_700Bold,
        CormorantGaramond_400Regular,
        CormorantGaramond_700Bold,
        DancingScript_700Bold,
    });

    const splashHidden = useRef(false);

    const hideSplash = async () => {
        if (splashHidden.current) return;
        splashHidden.current = true;
        try {
            await SplashScreen.hideAsync();
        } catch (e) {}
    };

    // Hide splash when fonts are ready (or errored)
    useEffect(() => {
        if (fontsLoaded || fontError) {
            hideSplash();
        }
    }, [fontsLoaded, fontError]);

    // Hard safety timeout: hide splash after 3 seconds no matter what
    useEffect(() => {
        const timer = setTimeout(() => {
            hideSplash();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);



    return (
        <SafeAreaProvider>
            <KeyboardProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: 'transparent' },
                            animation: 'slide_from_right',
                        }}
                    />
                    <React.Suspense fallback={null}>
                        <DelayedCosmic />
                    </React.Suspense>
                </GestureHandlerRootView>
            </KeyboardProvider>
        </SafeAreaProvider>
    );
}

// Load the cosmic background only after 4s so it never blocks app startup
const DelayedCosmic = () => {
    const [visible, setVisible] = React.useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 4000);
        return () => clearTimeout(t);
    }, []);
    if (!visible) return null;
    return <GlobalCosmicBackground />;
};
