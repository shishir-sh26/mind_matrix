import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Sun, XCircle } from "lucide-react-native";
import * as Brightness from 'expo-brightness';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ENGINE_REGISTRY, subscribeToEngine } from './engine-state';
import { ThemeProviderWrapper } from './theme-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const [engineState, setEngineState] = useState({ ...ENGINE_REGISTRY });
  const [hideAlert, setHideAlert] = useState(false);

  // Subscribe to Global Engine State
  useEffect(() => {
    return subscribeToEngine(() => setEngineState({ ...ENGINE_REGISTRY }));
  }, []);

  // Handle Global Brightness & Visibility
  useEffect(() => {
    if (engineState.active && engineState.isLightOn) {
      if (engineState.currentLightLevel === "Room Too Bright") {
        Brightness.setBrightnessAsync(0.1);
      } else if (engineState.currentLightLevel === "Ideal (Dark)") {
        Brightness.setBrightnessAsync(0.05);
      }
    }
  }, [engineState.currentLightLevel, engineState.active, engineState.isLightOn]);

  // Alert Visibility Logic:
  // Only show Global Alert if engine is active, light is on, room is too bright,
  // we haven't dismissed it, and we are NOT on the sleep-well screen itself.
  const isSleepScreen = segments[segments.length - 1] === 'sleep-well';
  const showGlobalAlert = engineState.active &&
    engineState.isLightOn &&
    engineState.currentLightLevel === "Room Too Bright" &&
    !hideAlert &&
    !isSleepScreen;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemeProviderWrapper>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="focus-training" />
            <Stack.Screen name="hrv-training" />
            <Stack.Screen name="breathe" />
            <Stack.Screen name="rhythm" />
            <Stack.Screen name="clear" />
            <Stack.Screen name="sleep-well" />
          </Stack>

          {showGlobalAlert && (
            <Animated.View entering={FadeInUp} exiting={FadeOutUp} style={styles.globalAlert}>
              <View style={styles.alertHeader}>
                <Sun size={18} color="white" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>HIGH BACKGROUND BRIGHTNESS</Text>
                  <Text style={styles.alertMsg}>Move to a place where there is dim light for better sleep.</Text>
                </View>
                <TouchableOpacity onPress={() => setHideAlert(true)}>
                  <XCircle size={24} color="white" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>
        <StatusBar style="auto" />
      </ThemeProviderWrapper>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  globalAlert: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 20,
    zIndex: 9999,
    shadowColor: "#ef4444",
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
  },
  alertMsg: {
    color: '#ffffffcc',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  }
});
