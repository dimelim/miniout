import Constants from 'expo-constants';
import { useThemeColor } from 'heroui-native/hooks';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { BackButton } from '@/components/back-button';
import { RuledPaper } from '@/components/ruled-paper';
import { NOVEDADES } from '@/lib/changelog';

export default function Novedades() {
  const insets = useSafeAreaInsets();
  const [accent, muted, accentForeground] = useThemeColor([
    'accent',
    'muted',
    'accent-foreground',
  ]);

  const instalada = Constants.expoConfig?.version ?? '';

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <View className="px-7" style={{ paddingTop: insets.top + 12 }}>
        <BackButton label="Cuenta" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.6 }}
          >
            Qué hay de nuevo
          </Text>
          <Text className="mt-1 font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
            Lo que fue cambiando en Miniout, de lo último a lo primero.
          </Text>
        </Appear>

        {NOVEDADES.map((novedad, indice) => (
          <Appear key={novedad.version} delay={70 + indice * 60} className="mt-7">
            <View className="rounded-[24px] bg-surface p-5 shadow-surface">
              <View className="flex-row items-center gap-2">
                <Text
                  className="font-display text-foreground"
                  style={{ fontSize: 21, letterSpacing: -0.3 }}
                >
                  {novedad.nombre}
                </Text>

                {novedad.version === instalada && (
                  <View
                    style={{
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      backgroundColor: accent,
                    }}
                  >
                    <Text
                      className="font-semibold"
                      style={{ fontSize: 10, color: accentForeground }}
                    >
                      La tuya
                    </Text>
                  </View>
                )}
              </View>

              <Text className="mt-0.5 font-medium text-muted" style={{ fontSize: 12 }}>
                {`Versión ${novedad.version} · ${novedad.fecha}`}
              </Text>

              <View className="mt-4 gap-2.5">
                {novedad.cambios.map((cambio) => (
                  <View key={cambio} className="flex-row gap-2.5">
                    <View
                      style={{
                        width: 3,
                        borderRadius: 999,
                        marginTop: 4,
                        marginBottom: 4,
                        backgroundColor: muted,
                        opacity: 0.4,
                      }}
                    />
                    <Text
                      className="flex-1 font-sans text-foreground"
                      style={{ fontSize: 14, lineHeight: 21 }}
                    >
                      {cambio}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Appear>
        ))}
      </ScrollView>
    </View>
  );
}
