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
import type { ErrorBoundaryProps, NativeStackNavigationOptions } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native/hooks';
import { HeroUINativeProvider } from 'heroui-native/provider';
import { useEffect } from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LockScreen } from '@/components/lock-screen';
import { Updater } from '@/components/updater';
import { AuthProvider } from '@/lib/auth-store';
import { LockProvider } from '@/lib/lock';
import { NotesProvider } from '@/lib/notes-store';
import { PeriodsProvider } from '@/lib/periods-store';
import { ProjectsProvider } from '@/lib/projects-store';

import '../global.css';

SplashScreen.preventAutoHideAsync().catch(() => {});

const HOJA: NativeStackNavigationOptions = {
  presentation: 'formSheet',
  sheetAllowedDetents: [0.82],
  sheetCornerRadius: 28,
  sheetGrabberVisible: true,
  animation: 'slide_from_bottom',
  gestureEnabled: true,
};

const AJUSTADA: NativeStackNavigationOptions = {
  ...HOJA,
  sheetAllowedDetents: 'fitToContents',
};

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  SplashScreen.hideAsync().catch(() => {});

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#171511',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <Text style={{ color: '#fbfaf7', fontSize: 22, textAlign: 'center' }}>
        Miniout se atascó
      </Text>
      <Text
        style={{ color: '#a49c8e', fontSize: 14, textAlign: 'center', marginTop: 10 }}
      >
        {error.message}
      </Text>

      <Pressable
        onPress={retry}
        style={{
          marginTop: 28,
          borderRadius: 999,
          backgroundColor: '#e0891c',
          paddingHorizontal: 24,
          paddingVertical: 13,
        }}
      >
        <Text style={{ color: '#1d1913', fontSize: 15, fontWeight: '600' }}>
          Volver a intentar
        </Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Newsreader_500Medium,
    Newsreader_600SemiBold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <AuthProvider>
          <NotesProvider>
            <ProjectsProvider>
              <PeriodsProvider>
              <LockProvider>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <Navegacion />
                <Updater />
                <LockScreen />
              </LockProvider>
              </PeriodsProvider>
            </ProjectsProvider>
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
      <Stack.Screen name="github" options={AJUSTADA} />
      <Stack.Screen name="contrasena" options={{ ...HOJA, sheetAllowedDetents: [0.7] }} />
      <Stack.Screen name="programar" options={{ ...HOJA, sheetAllowedDetents: [0.86] }} />
      <Stack.Screen name="ajustes" />
      <Stack.Screen name="minilock" options={{ ...HOJA, sheetAllowedDetents: [0.88] }} />
      <Stack.Screen name="nota" options={{ animation: 'fade_from_bottom' }} />
      <Stack.Screen name="imagen" options={{ animation: 'fade_from_bottom' }} />
      <Stack.Screen name="proyecto-notas" />
      <Stack.Screen name="proyecto" options={{ ...HOJA, sheetAllowedDetents: [0.88] }} />
      <Stack.Screen name="mover" options={AJUSTADA} />
      <Stack.Screen name="calificar" options={AJUSTADA} />
      <Stack.Screen name="acciones" options={AJUSTADA} />
      <Stack.Screen name="filtros" options={AJUSTADA} />
      <Stack.Screen name="novedades" />
      <Stack.Screen name="materia" />
      <Stack.Screen name="clase" options={AJUSTADA} />
    </Stack>
  );
}
