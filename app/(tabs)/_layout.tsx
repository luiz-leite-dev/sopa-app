import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import { ChiRhoIcon } from '@/components/icons/ChiRhoIcon';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].primaryButton,
        tabBarLabelStyle: {
          fontFamily: 'Fredoka',
        },
        headerTitleStyle: {
          fontFamily: 'Fredoka',
        },
        headerTitleAlign: 'left',
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: () => null,
          headerRight: () => (
            <Link href="/cristo" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <ChiRhoIcon
                    size={28}
                    color={Colors[colorScheme].tint}
                    opacity={pressed ? 0.5 : 1}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="ingredientes"
        options={{
          title: 'Ingredientes',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="receita"
        options={{
          title: 'Receita',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="colherada"
        options={{
          title: 'Colherada',
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}
