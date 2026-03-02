import React from 'react';
import { View, Text } from 'react-native';

interface SensorData {
  x: number;
  y: number;
  z: number;
}

interface SensorDashboardProps {
  data: SensorData;
}

export default function SensorDashboard({ data }: SensorDashboardProps) {
  return (
    <View className="w-[90%] bg-white/30 rounded-[2rem] p-6 border border-white/50 backdrop-blur-lg flex-row justify-between mb-8">
      <Text className="text-slate-600 font-medium">X: {data.x.toFixed(2)}</Text>
      <Text className="text-slate-600 font-medium">Y: {data.y.toFixed(2)}</Text>
      <Text className="text-slate-600 font-medium">Z: {data.z.toFixed(2)}</Text>
    </View>
  );
}
