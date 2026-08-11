import { Tabs } from 'expo-router';
import { useThemeColor } from 'heroui-native/hooks';

import { CapturaIcon, CuadernoIcon, DiaIcon } from '@/components/icons';

export default function AppLayout() {
  const [accentDeep, muted, surface, separator] = useThemeColor([
    'accent',
    'muted',
    'surface',
    'separator',
  ]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accentDeep,
        tabBarInactiveTintColor: muted,
        tabBarStyle: {
          backgroundColor: surface,
          borderTopColor: separator,
        },
        tabBarLabelStyle: {
          fontFamily: 'Figtree_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="captura"
        options={{
          title: 'Captura',
          tabBarIcon: ({ color }) => <CapturaIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="cuaderno"
        options={{
          title: 'Cuaderno',
          tabBarIcon: ({ color }) => <CuadernoIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="dia"
        options={{
          title: 'Día',
          tabBarIcon: ({ color }) => <DiaIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
