import { Comfortaa_300Light, Comfortaa_400Regular, Comfortaa_500Medium, Comfortaa_600SemiBold, Comfortaa_700Bold } from '@expo-google-fonts/comfortaa';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GlobalCosmicBackground } from '../components/GlobalCosmicBackground';
import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Comfortaa_300Light,
    Comfortaa_400Regular,
    Comfortaa_500Medium,
    Comfortaa_600SemiBold,
    Comfortaa_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
      <GlobalCosmicBackground />
    </GestureHandlerRootView>
  );
}
