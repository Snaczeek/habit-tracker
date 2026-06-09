import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { HabitProvider } from '@/context/HabitContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <HabitProvider>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-habit" options={{ title: 'Dodaj nawyk' }} />
      </Stack>
    </HabitProvider>
  );
}