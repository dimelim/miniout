import { Tabs } from 'expo-router';

import { FolderIcon, InicioIcon, NoteIcon, PersonIcon, SmileIcon } from '@/components/icons';
import { TabBar } from '@/components/tab-bar';

export default function AppLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <InicioIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="notas"
        options={{
          title: 'Notas',
          tabBarIcon: ({ color }) => <NoteIcon color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="proyectos"
        options={{
          title: 'Proyectos',
          tabBarIcon: ({ color }) => <FolderIcon color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="mascota"
        options={{
          title: 'Mascota',
          tabBarIcon: ({ color }) => <SmileIcon color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color }) => <PersonIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
