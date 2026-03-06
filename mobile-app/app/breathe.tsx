import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useRouter, Stack } from "expo-router";
import { ChevronLeft, CircleStop, Sparkles } from "lucide-react-native";
import { Accelerometer } from "expo-sensors";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";
import { CameraView, Camera } from "expo-camera";
import { useAppTheme } from "./theme-context";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.7;

const BreatheExercise = () => {
  const router = useRouter();
  const [phase, setPhase] = useState("Inhale");
  const [phaseTime, setPhaseTime] = useState(4);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(300); // 5 minutes session
  const [harmony, setHarmony] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { isLightMode } = useAppTheme();
  const styles = createStyles(isLightMode);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const scanScale = useSharedValue(1);
  const dotOpacity = useSharedValue(1);

  const timerRef = useRef<any>(null);
  const phaseRef = useRef<any>(null);
  const inhalePlayer = useAudioPlayer('https://cdn.jsdelivr.net/gh/extratone/macOSsystemsounds/mp3/Complete.mp3');
  const exhalePlayer = useAudioPlayer('https://cdn.jsdelivr.net/gh/extratone/macOSsystemsounds/mp3/Note.mp3');

  const playPhaseSound = useCallback(async (type: "Inhale" | "Exhale") => {
    const player = type === "Inhale" ? inhalePlayer : exhalePlayer;
    if (player) {
      player.seekTo(0);
      player.play();
    }
  }, [inhalePlayer, exhalePlayer]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Phase management
    const startPhase = (currentPhase: string) => {
      const isInhale = currentPhase === "Inhale";
      setPhase(currentPhase);
      setPhaseTime(4);

      // Haptic feedback (Heavy for more impact)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      playPhaseSound(isInhale ? "Inhale" : "Exhale");

      scale.value = withTiming(isInhale ? 1.4 : 1, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      });
      opacity.value = withTiming(isInhale ? 1 : 0.6, {
        duration: 4000,
      });

      phaseRef.current = setTimeout(() => {
        startPhase(isInhale ? "Exhale" : "Inhale");
      }, 4000);
    };

    startPhase("Inhale");

    // Sensor Logic: Detect steadiness
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(data => {
      const totalMod = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);
      // If device is held steady (indicates vagal calm)
      if (totalMod < 1.1) {
        setHarmony(h => Math.min(h + 0.5, 100));
      } else {
        setHarmony(h => Math.max(h - 1, 0));
      }
    });

    // General timers
    timerRef.current = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setPhaseTime((prev) => (prev > 1 ? prev - 1 : 4));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseRef.current) clearTimeout(phaseRef.current);
      sub.remove();
    };
  }, [scale, opacity, playPhaseSound]);

  useEffect(() => {
    // Dot Blinking
    dotOpacity.value = withSequence(
      withTiming(0.2, { duration: 800 }),
      withTiming(1, { duration: 800 })
    );
    // Scanning Ring
    scanScale.value = withTiming(1.6, { duration: 3000, easing: Easing.out(Easing.quad) });

    const blinkInterval = setInterval(() => {
      dotOpacity.value = withSequence(
        withTiming(0.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      );
    }, 1600);

    const scanInterval = setInterval(() => {
      scanScale.value = 1;
      scanScale.value = withTiming(1.6, { duration: 3000, easing: Easing.out(Easing.quad) });
    }, 3000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(scanInterval);
    };
  }, [dotOpacity, scanScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const scanAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanScale.value }],
    opacity: 1 - (scanScale.value - 1) / 0.6,
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = (300 - remainingSeconds) / 300;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Breathe with Me</Text>
        <View style={styles.harmonyBadge}>
          <Sparkles size={12} color="#fcd34d" />
          <Text style={styles.harmonyText}>{Math.floor(harmony)}% Harmony</Text>
        </View>
      </View>

      <View style={styles.center}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <View style={styles.circleContainer}>
            <Animated.View style={[styles.scanRing, scanAnimatedStyle]} />
            {hasPermission && (
              <CameraView
                facing="front"
                style={styles.cameraPreview}
              />
            )}
            <Animated.View style={[styles.circle, animatedStyle]}>
              <View style={styles.circleContent}>
                <Text style={styles.phaseText}>{phase}</Text>
                <Text style={styles.secondsText}>{phaseTime} SECONDS</Text>
              </View>
            </Animated.View>
            <View style={styles.sensorOverlay}>
              <Animated.View style={[styles.sensorDot, dotAnimatedStyle]} />
              <Text style={styles.sensorText}>SENSORS ACTIVE</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.harmonyBarContainer}>
          <View style={[styles.harmonyBarFill, { width: `${harmony}%` }]} />
          <Text style={styles.harmonyLabel}>VAGAL STEADINESS</Text>
        </View>

        <Text style={styles.instruction}>
          Hold the device steady with a soft grip. Your posture and palm stability drive the Harmony level.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.timerRow}>
          <View>
            <Text style={styles.timerLabel}>TOTAL TIME</Text>
            <Text style={styles.timerValue}>{formatTime(totalSeconds)}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.timerLabel}>REMAINING</Text>
            <Text style={styles.timerValue}>{formatTime(remainingSeconds)}</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>

        <TouchableOpacity style={styles.endButton} onPress={() => router.back()}>
          <CircleStop color="white" size={20} />
          <Text style={styles.endText}>End Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (isLight: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isLight ? "#f8fafc" : "#130b1a",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
  },
  headerTitle: {
    color: isLight ? "#0f172a" : "white",
    fontSize: 16,
    fontWeight: "700",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff10",
    justifyContent: "center",
    alignItems: "center",
  },
  harmonyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff10",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: isLight ? "#fef3c7" : "#fcd34d30",
  },
  harmonyText: {
    color: "#fcd34d",
    fontSize: 12,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CIRCLE_SIZE / 2,
    opacity: 0.15,
  },
  scanRing: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#9333ea',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: isLight ? "rgba(147, 51, 234, 0.15)" : "#9333ea50",
    justifyContent: "center",
    alignItems: "center",
    ...isLight ? {} : {
      shadowColor: "#9333ea",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 40,
      elevation: 20,
    },
    borderWidth: 1,
    borderColor: isLight ? "transparent" : "#ffffff20",
  },
  sensorOverlay: {
    position: 'absolute',
    top: -30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00000040',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sensorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  sensorText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  circleContent: {
    alignItems: "center",
  },
  harmonyBarContainer: {
    width: "80%",
    height: 4,
    backgroundColor: isLight ? "#e2e8f0" : "#ffffff05",
    borderRadius: 2,
    marginTop: 40,
    overflow: "hidden",
  },
  harmonyBarFill: {
    height: "100%",
    backgroundColor: "#fcd34d",
  },
  harmonyLabel: {
    color: isLight ? "#64748b" : "#475569",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 1,
  },
  phaseText: {
    color: isLight ? "rgba(255, 255, 255, 0.9)" : "white",
    fontSize: 48,
    fontWeight: "300",
    letterSpacing: 1,
  },
  secondsText: {
    color: isLight ? "rgba(255, 255, 255, 0.8)" : "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    opacity: 0.8,
  },
  instruction: {
    color: isLight ? "#64748b" : "#94a3b8",
    textAlign: "center",
    fontSize: 15,
    marginTop: 60,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  footer: {
    paddingBottom: 40,
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timerLabel: {
    color: isLight ? "#64748b" : "#64748b",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  timerValue: {
    color: isLight ? "#0f172a" : "white",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: isLight ? "#e2e8f0" : "#ffffff10",
    borderRadius: 3,
    marginBottom: 30,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#9333ea",
    borderRadius: 3,
  },
  endButton: {
    flexDirection: "row",
    backgroundColor: "#ffffff10",
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#ffffff15",
  },
  endText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default BreatheExercise;
