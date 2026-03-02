import React from 'react';
import { ScrollView, View, Text } from 'react-native';

export default function ModularSlots() {
  const slots = [1, 2, 3, 4];

  return (
    <View className="w-full mt-8">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="w-full flex-row px-4"
        contentContainerStyle={{ gap: 16 }}
      >
        {slots.map((slot) => (
          <View
            key={slot}
            className="w-40 h-32 bg-white/40 rounded-[2rem] border border-[#C8E6C9] items-center justify-center shadow-sm"
          >
            <Text className="text-slate-500 font-medium text-center px-4">
              Modular Sensor Slot
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
