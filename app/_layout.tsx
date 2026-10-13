import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRootNavigationState,
  useRouter,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

const INGREDIENTS_STORAGE_KEY = '@SOPA:ingredients';
const RECIPE_STORAGE_KEY = '@SOPA:recipe';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fredoka: require('../assets/fonts/Fredoka.ttf'),
  });

  const [redirectReady, setRedirectReady] = useState(false);

  const router = useRouter();
  const navigationState = useRootNavigationState();
  const redirected = useRef(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded || !navigationState?.key || redirected.current) {
      return;
    }

    async function redirectInitialRoute() {
      try {
        const [ingredientsData, recipeData] = await Promise.all([
          AsyncStorage.getItem(INGREDIENTS_STORAGE_KEY),
          AsyncStorage.getItem(RECIPE_STORAGE_KEY),
        ]);

        const ingredients = ingredientsData
          ? JSON.parse(ingredientsData)
          : null;

        const recipe = recipeData
          ? JSON.parse(recipeData)
          : null;

        const selectedValues = ingredients?.selectedValues ?? [];

        if (recipe?.mainIngredient && recipe?.weeklyGoal?.trim()) {
          router.replace('/colherada');
        } else if (selectedValues.length > 0) {
          if (ingredients?.stage === 'completed') {
            router.replace('/receita');
          } else {
            router.replace('/ingredientes');
          }
        }
      } catch (error) {
        console.error(
          'Erro ao verificar progresso inicial:',
          error
        );
      } finally {
        redirected.current = true;
        setRedirectReady(true);
      }
    }

    void redirectInitialRoute();
  }, [loaded, navigationState?.key]);

  useEffect(() => {
    if (loaded && redirectReady) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, redirectReady]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cristo" options={{ presentation: 'modal', title: 'Conhecendo a Jesus' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
