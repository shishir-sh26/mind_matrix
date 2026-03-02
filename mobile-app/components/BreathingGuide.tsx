import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

export default function BreathingGuide() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scale]);

  return (
    <View className="p-8 rounded-[2.5rem] bg-white/20 border border-white/40 overflow-hidden shadow-sm items-center justify-center w-[90%] self-center my-4 backdrop-blur-md">
      <View className="absolute inset-0 bg-[#BBDEFB]/10" />
      <Text className="text-slate-700 font-medium text-lg mb-8 z-10 tracking-widest">CENTER YOURSELF</Text>
      <Animated.View
        className="w-24 h-24 rounded-full bg-[#E0F2F1] shadow-lg border border-white/60"
        style={{ transform: [{ scale }] }}
      />
    </View>
  );
}