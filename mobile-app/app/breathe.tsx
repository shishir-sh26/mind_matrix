import React, { useState, useEffect, useRef } from "react";
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
  Easing,
} from "react-native-reanimated";
import { useRouter, Stack } from "expo-router";
import { ChevronLeft, Settings, CircleStop } from "lucide-react-native";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.7;

const BreatheExercise = () => {
  const router = useRouter();
  const [phase, setPhase] = useState("Inhale");
  const [phaseTime, setPhaseTime] = useState(4);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(300); // 5 minutes session
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Phase management
    const startPhase = (currentPhase: string) => {
      const isInhale = currentPhase === "Inhale";
      setPhase(currentPhase);
      setPhaseTime(4);

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

    // General timers
    timerRef.current = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setPhaseTime((prev) => (prev > 1 ? prev - 1 : 4));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseRef.current) clearTimeout(phaseRef.current);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
        <TouchableOpacity style={styles.iconButton}>
          <Settings color="white" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <Animated.View style={[styles.circle, animatedStyle]}>
          <View style={styles.circleContent}>
            <Text style={styles.phaseText}>{phase}</Text>
            <Text style={styles.secondsText}>{phaseTime} SECONDS</Text>
          </View>
        </Animated.View>

        <Text style={styles.instruction}>
          Focus on the expanding circle and let the gentle vibration guide your breath.
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#130b1a",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
  },
  headerTitle: {
    color: "white",
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#9333ea", // Purple
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9333ea",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  circleContent: {
    alignItems: "center",
  },
  phaseText: {
    color: "white",
    fontSize: 48,
    fontWeight: "300",
    letterSpacing: 1,
  },
  secondsText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    opacity: 0.8,
  },
  instruction: {
    color: "#94a3b8",
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
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  timerValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#ffffff10",
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
