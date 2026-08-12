import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
} from '@expo-google-fonts/figtree';
import {
  Newsreader_500Medium,
  Newsreader_600SemiBold,
} from '@expo-google-fonts/newsreader';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import type { NativeStackNavigationOptions } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native/hooks';
import { HeroUINativeProvider } from 'heroui-native/provider';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Updater } from '@/components/updater';
import { AuthProvider } from '@/lib/auth-store';
import { NotesProvider } from '@/lib/notes-store';

import '../global.css';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 320 });

const HOJA: NativeStackNavigationOptions = {
  presentation: 'formSheet',
  sheetAllowedDetents: [0.82],
  sheetCornerRadius: 28,
  sheetGrabberVisible: true,
  animation: 'slide_from_bottom',
  gestureEnabled: true,
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Newsreader_500Medium,
    Newsreader_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <AuthProvider>
          <NotesProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Navegacion />
            <Updater />
          </NotesProvider>
        </AuthProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}

function Navegacion() {
  const background = useThemeColor('background');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'ios_from_right',
        gestureEnabled: true,
        contentStyle: { backgroundColor: background },
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="entrar" />
      <Stack.Screen name="acceder" />
      <Stack.Screen name="registro" />
      <Stack.Screen name="auth" options={{ animation: 'none', gestureEnabled: false }} />
      <Stack.Screen
        name="bienvenida"
        options={{ animation: 'fade', animationDuration: 260, gestureEnabled: false }}
      />
      <Stack.Screen
        name="(app)"
        options={{ animation: 'fade', animationDuration: 260, gestureEnabled: false }}
      />
      <Stack.Screen name="semestre" />
      <Stack.Screen name="nuevo-periodo" options={HOJA} />
      <Stack.Screen name="frases" options={HOJA} />
      <Stack.Screen name="github" options={{ ...HOJA, sheetAllowedDetents: [0.58] }} />
      <Stack.Screen name="contrasena" options={{ ...HOJA, sheetAllowedDetents: [0.7] }} />
      <Stack.Screen name="programar" options={{ ...HOJA, sheetAllowedDetents: [0.86] }} />
    </Stack>
  );
}
