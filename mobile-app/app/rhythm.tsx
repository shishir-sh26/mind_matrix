import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { ChevronLeft, Info, HandMetal } from "lucide-react-native";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useRouter, Stack } from "expo-router";
import { useAppTheme } from "./theme-context";

const { width } = Dimensions.get("window");
const PAD_SIZE = width * 0.4;

const RhythmTap = () => {
  const router = useRouter();
  const { isLightMode } = useAppTheme();
  const styles = createStyles(isLightMode);
  const [count, setCount] = useState(0);
  const scale = useSharedValue(1);
  const player = useAudioPlayer('https://cdn.jsdelivr.net/gh/extratone/macOSsystemsounds/mp3/Input.mp3');

  const handleTap = async () => {
    setCount((prev) => prev + 1);
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    // Haptic Feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Play Musical Sound
    if (player) {
      player.seekTo(0);
      player.play();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rhythm Tap</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Info color="white" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <Text style={styles.countText}>{count}</Text>
        <Text style={styles.instruction}>Tap the pad in a steady rhythm to ground yourself.</Text>

        <TouchableOpacity activeOpacity={1} onPress={handleTap}>
          <Animated.View style={[styles.tapPad, animatedStyle]}>
            <HandMetal color="#f87171" size={48} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.endButton} onPress={() => router.back()}>
          <Text style={styles.endText}>Finish Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (isLight: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isLight ? "#fef2f2" : "#1a1010",
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
    backgroundColor: isLight ? "#e2e8f0" : "#ffffff10",
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    color: "#f87171",
    fontSize: 84,
    fontWeight: "800",
    marginBottom: 20,
  },
  instruction: {
    color: isLight ? "#64748b" : "#94a3b8",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 60,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  tapPad: {
    width: PAD_SIZE,
    height: PAD_SIZE,
    borderRadius: PAD_SIZE / 2,
    backgroundColor: isLight ? "#fee2e2" : "#2a1515",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: isLight ? "#f8717140" : "#f8717120",
    shadowColor: "#f87171",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isLight ? 0.15 : 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  footer: {
    paddingBottom: 40,
  },
  endButton: {
    backgroundColor: isLight ? "#ffffff" : "#ffffff10",
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: isLight ? "#e2e8f0" : "#ffffff15",
  },
  endText: {
    color: "#f87171",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default RhythmTap;
