import { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import { isShake } from '../utils/shakeDetection';
import * as Haptics from 'expo-haptics';

export const useAccelerometer = () => {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [shakeDetected, setShakeDetected] = useState(false);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(accelerometerData => {
      setData(accelerometerData);
      if (isShake(accelerometerData)) {
        setShakeDetected(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => setShakeDetected(false), 2000);
      }
    });
    return () => subscription.remove();
  }, []);

  return { data, shakeDetected };
};