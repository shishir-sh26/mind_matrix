import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Text, Animated } from 'react-native';
import { useAccelerometer } from '../../hooks/useAccelerometer';
import PulseTrigger from '../../components/PulseTrigger';
import BreathingGuide from '../../components/BreathingGuide';
import ModularSlots from '../../components/ModularSlots';
import SensorDashboard from '../../components/SensorDashboard';

export default function App() {
  const { data, shakeDetected } = useAccelerometer();
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: shakeDetected ? 1 : 0,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [shakeDetected, bgAnim]);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E0F2F1', '#1976D2'], // Soft Mint to Deep Calming Blue
  });

  return (
    <Animated.ScrollView style={{ flex: 1, backgroundColor }}>
      <View className="flex-1 items-center py-24 px-4 space-y-12">
        <PulseTrigger />
        
        <SensorDashboard data={data} />

        <BreathingGuide />
        <ModularSlots />
      </View>
    </Animated.ScrollView>
  );
}