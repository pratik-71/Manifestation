import { Comfortaa_300Light, Comfortaa_400Regular, Comfortaa_500Medium, Comfortaa_600SemiBold, Comfortaa_700Bold } from '@expo-google-fonts/comfortaa';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
  CormorantGaramond_700Bold_Italic
} from '@expo-google-fonts/cormorant-garamond';
import { 
  DancingScript_400Regular,
  DancingScript_500Medium,
  DancingScript_600SemiBold,
  DancingScript_700Bold 
} from '@expo-google-fonts/dancing-script';

import { useFonts } from 'expo-font';
import { useKeepAwake } from 'expo-keep-awake';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GlobalCosmicBackground } from '../components/GlobalCosmicBackground';
import { initializePurchases } from '../services/purchaseService';
import { initNotifications } from '../services/notificationService';
import "../global.css";

// Stage 0: Keep native splash screen visible while JS bridge stabilizes
SplashScreen.preventAutoHideAsync().catch(() => {});

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
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_700Bold_Italic,
    DancingScript_400Regular,
    DancingScript_500Medium,
    DancingScript_600SemiBold,
    DancingScript_700Bold
  });

  useEffect(() => {
    // Stage 1: Stabilization Blackout
    // Wait 800ms BEFORE we allow the React tree to mount AppMain
    // This allows Hermes engine and Native modules to finish handshake
    const initTimer = setTimeout(() => {
      setAppReady(true);
      setIsInitialized(true);
    }, 800);

    return () => clearTimeout(initTimer);
  }, []);

  useEffect(() => {
    if ((loaded || error) && appReady) {
      const timer = setTimeout(async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("Error hiding splash screen:", e);
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

  useEffect(() => {
    // Stage 2: Background Service Lifecycle
    const t1 = setTimeout(() => {
      try {
        initNotifications();
      } catch (e) {
        // Use a simple string to avoid Hermes error stack generation during fragile JSI init
        console.warn('[Layout] Notifications init failed safely');
      }
    }, 3000);

    // Stage 3: Service Phase-in
    const t2 = setTimeout(async () => {
      if (rcInitialized.current) return;
      rcInitialized.current = true;
      try {
        await initializePurchases();
      } catch (e) {
        console.warn('[Layout] Purchases init failed safely');
      }
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
        <GlobalCosmicBackground />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
});
