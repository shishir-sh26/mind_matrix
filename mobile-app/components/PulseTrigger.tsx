import React, { useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';

export default function PulseTrigger() {
  const scale = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation when idle
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [scale]);

  const handlePressIn = () => {
    Animated.timing(colorAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(colorAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#BBDEFB', '#FFCC80'], // Serene Blue to Soft Orange
  });

  return (
    <View className="items-center justify-center p-8">
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={{
            transform: [{ scale }],
            backgroundColor,
            width: 160,
            height: 160,
            borderRadius: 80,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
        />
      </Pressable>
    </View>
  );
}
