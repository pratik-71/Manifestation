/**
 * ROOT LAYOUT: Total Stabilization Protocol (v3)
 * 
 * We are implementing a extreme serialization of the startup sequence.
 * 1. Absolute Blackout (0-2.5s): No native calls, no bridge activity.
 * 2. Bridge Warmup (2.5-3.5s): Mount basic providers but no UI.
 * 3. Font Loading (3.5-5.5s): Trigger font loading via expo-font.
 * 4. UI Readiness (5.5s+): Reveal the Stack and hide the Splash.
 */

import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Comfortaa_400Regular, Comfortaa_700Bold } from '@expo-google-fonts/comfortaa';
import {
    CormorantGaramond_400Regular,
    CormorantGaramond_700Bold
} from '@expo-google-fonts/cormorant-garamond';
import { 
  DancingScript_700Bold 
} from '@expo-google-fonts/dancing-script';

import "../global.css";

// Prevent auto-hide immediately to take control of splash lifecycle
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

// Delayed load for secondary assets
const GlobalCosmicBackground = React.lazy(() => import('../components/GlobalCosmicBackground').then(m => ({ default: m.GlobalCosmicBackground })));

export default function RootLayout() {
  const [bootStage, setBootStage] = useState(0);

  useEffect(() => {
    // Stage 1: Initial Blackout Period
    // Moves initialization out of the high-stress bridge startup window.
    const timer = setTimeout(() => {
        setBootStage(1);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (bootStage === 0) {
    return <View style={styles.blackout} />;
  }

  return <StabilizedProviders />;
}

function StabilizedProviders() {
    const [providersReady, setProvidersReady] = useState(false);

    useEffect(() => {
        // Stage 2: Provider Warmup
        // We mount providers but give them a moment to settle.
        const timer = setTimeout(() => {
            setProvidersReady(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!providersReady) {
        return <View style={styles.blackout} />;
    }

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <FontLoaderLayer />
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

function FontLoaderLayer() {
    const [fontTriggered, setFontTriggered] = useState(false);
    
    // Stage 3: Font Loading Delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setFontTriggered(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (!fontTriggered) {
        return <View style={styles.blackout} />;
    }

    return <ActualContentLayer />;
}

function ActualContentLayer() {
    const [contentReady, setContentReady] = useState(false);

    // Font loading triggered only after layers of stability
    const [fontsLoaded, fontError] = useFonts({
        Comfortaa_400Regular,
        Comfortaa_700Bold,
        CormorantGaramond_400Regular,
        CormorantGaramond_700Bold,
        DancingScript_700Bold
    });

    useEffect(() => {
        // Stage 4: Final Reveal
        if (fontsLoaded || fontError) {
            const timer = setTimeout(async () => {
                // Stabilize System UI Colors before revealing
                try {
                    await SystemUI.setBackgroundColorAsync("black");
                } catch (e) {}

                // Reveal App
                SplashScreen.hideAsync().catch(() => {});
                setContentReady(true);

                // App Tracking Transparency (Guideline 5.1.2(i))
                // Delayed further to happen after UI is visible to avoid JSI crashes
                if (Platform.OS === 'ios') {
                    try {
                        const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
                        setTimeout(async () => {
                            try {
                                await requestTrackingPermissionsAsync();
                            } catch (e) { }
                        }, 2000);
                    } catch (e) {}
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [fontsLoaded, fontError]);

    if (!contentReady) {
        return <View style={styles.blackout} />;
    }

    return (
        <>
            <Stack screenOptions={{ 
                headerShown: false, 
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'fade' // Switched to fade for maximum stability
            }} />
            <React.Suspense fallback={null}>
                <DelayedCosmic />
            </React.Suspense>
        </>
    );
}

const DelayedCosmic = () => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 4000);
        return () => clearTimeout(t);
    }, []);
    if (!visible) return null;
    return <GlobalCosmicBackground />;
};

const styles = StyleSheet.create({
  blackout: {
    flex: 1,
    backgroundColor: '#000',
  },
});




