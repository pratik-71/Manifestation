import 'react-native-get-random-values';
import { Comfortaa_300Light, Comfortaa_400Regular, Comfortaa_500Medium, Comfortaa_600SemiBold, Comfortaa_700Bold } from '@expo-google-fonts/comfortaa';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
  CormorantGaramond_700Bold_Italic
} from '@expo-google-fonts/cormorant-garamond';
import { 
  DancingScript_400Regular,
  DancingScript_700Bold 
} from '@expo-google-fonts/dancing-script';

import { useFonts } from 'expo-font';
import { useKeepAwake } from 'expo-keep-awake';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// ------------------------------------------------------------------
import { GlobalCosmicBackground } from '../components/GlobalCosmicBackground';
import { initializePurchases } from '../services/purchaseService';
import { initNotifications } from '../services/notificationService';
import "../global.css";

// Stage 0: Splash screen handled inside RootLayout effect to avoid
// race conditions with the New Architecture bridge initialization.
// SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useKeepAwake();
  const [isInitialized, setIsInitialized] = useState(false);
  const [appReady, setAppReady] = useState(false);

  const [loaded, error] = useFonts({
    Comfortaa_300Light,
    Comfortaa_400Regular,
    Comfortaa_500Medium,
    Comfortaa_600SemiBold,
    Comfortaa_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    CormorantGaramond_700Bold_Italic,
    DancingScript_400Regular,
    DancingScript_700Bold
  });

  useEffect(() => {
    // Stage 1: Stabilization Blackout
    // Ensure splash screen is locked native-side before we do anything
    try {
      SplashScreen.preventAutoHideAsync().catch(() => {});
    } catch (e) {
      // Ignored
    }

    // Wait 1200ms BEFORE we allow the React tree to mount AppMain
    // This allows Hermes engine, Fabric native commits, and TurboModules to finish handshake.
    // 800ms was sometimes too short for the New Architecture overhead.
    const initTimer = setTimeout(() => {
      setAppReady(true);
      setIsInitialized(true);
    }, 1200);

    return () => clearTimeout(initTimer);
  }, []);

  useEffect(() => {
    if ((loaded || error) && appReady) {
      const timer = setTimeout(async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("[Layout] Splash hide safely deferred");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loaded, error, appReady]);

  if (!loaded || !isInitialized) {
    return <View style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  return <AppMain />;
}

// ------------------------------------------------------------------
// APP MAIN: Only mounts once the Native Bridge is stable
// ------------------------------------------------------------------
const AppMain = React.memo(() => {
  const rcInitialized = useRef(false);
  const [showCosmic, setShowCosmic] = useState(false);

  useEffect(() => {
    // Phase in the cosmic background AFTER the first paint and initial layout
    // This avoids resource contention with the initial Stack/Screen commit.
    const cosmicTimer = setTimeout(() => setShowCosmic(true), 1500);

    // Stage 2: Background Service Lifecycle
    const t1 = setTimeout(() => {
      try {
        initNotifications();
      } catch (e) {
        // Use a simple string to avoid Hermes error stack generation during fragile JSI init
        console.warn('[Layout] Notifications init failed safely');
      }
    }, 4000);

    // Stage 3: Service Phase-in
    const t2 = setTimeout(async () => {
      if (rcInitialized.current) return;
      rcInitialized.current = true;
      try {
        await initializePurchases();
      } catch (e) {
        console.warn('[Layout] Purchases init failed safely');
      }
    }, 5500);

    return () => {
      clearTimeout(cosmicTimer);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
        {showCosmic && <GlobalCosmicBackground />}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
});
