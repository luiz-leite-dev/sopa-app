import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import { ChiRhoIcon } from '@/components/icons/ChiRhoIcon';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].primaryButton,
        tabBarLabelStyle: {
          fontFamily: 'Fredoka',
        },
        tabBarStyle: {
          height: 50,
          paddingTop: 0,
          paddingBottom: 0,
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
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
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
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="checklist" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="receita"
        options={{
          title: 'Receita',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="description" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="colherada"
        options={{
          title: 'Colherada',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
