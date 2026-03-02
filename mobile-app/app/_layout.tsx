import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="focus-training" />
        <Stack.Screen name="hrv-training" />
        <Stack.Screen name="breathe" />
        <Stack.Screen name="rhythm" />
        <Stack.Screen name="clear" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
