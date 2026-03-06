import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  StatusBar,
} from "react-native";
import { X, Info, CheckCircle2 } from "lucide-react-native";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useAppTheme } from "./theme-context";

// Cleaned up unused constants

const INITIAL_SHAPES = [
  { id: 1, x: 100, y: 150, size: 80, type: "rect" },
  { id: 2, x: 220, y: 200, size: 60, type: "rect" },
  { id: 3, x: 150, y: 350, size: 70, type: "circle" },
  { id: 4, x: 80, y: 500, size: 90, type: "rect" },
  { id: 5, x: 250, y: 450, size: 75, type: "rect" },
];

export default function ClearSpace() {
  const router = useRouter();
  const { isLightMode } = useAppTheme();
  const styles = createStyles(isLightMode);
  const [shapes, setShapes] = useState(INITIAL_SHAPES);
  const totalShapes = INITIAL_SHAPES.length;
  const clearedCount = totalShapes - shapes.length;
  const progress = (clearedCount / totalShapes) * 100;
  const player = useAudioPlayer('https://cdn.jsdelivr.net/gh/extratone/macOSsystemsounds/mp3/Chimes.mp3');

  const playSoothingSound = async () => {
    if (player) {
      player.seekTo(0);
      player.play();
    }
  };

  const removeShape = (id: number) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSoothingSound();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color="white" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSub}>CLEAR THE SPACE</Text>
          <Text style={styles.headerProgress}>{Math.round(progress)}% Cleared</Text>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Info color="white" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>SWIPE TO CLEAR</Text>
      </View>

      <View style={styles.canvas}>
        {shapes.map((shape) => (
          <DraggableShape
            key={shape.id}
            shape={shape}
            onCleared={() => removeShape(shape.id)}
            styles={styles}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>You are making room for clarity...</Text>
        <TouchableOpacity
          style={[styles.finishButton, shapes.length === 0 && styles.finishButtonActive]}
          onPress={() => router.back()}
        >
          <CheckCircle2 color={shapes.length === 0 ? "#13ecec" : "#64748b"} size={20} />
          <Text style={[styles.finishText, shapes.length === 0 && styles.finishTextActive]}>
            Finish Clearing
          </Text>
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
}

const DraggableShape = ({ shape, onCleared, styles }: { shape: any; onCleared: () => void, styles: any }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        translateX.value = gesture.dx;
        translateY.value = gesture.dy;
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > 150 || Math.abs(gesture.dy) > 150) {
          opacity.value = withSpring(0);
          runOnJS(onCleared)();
        } else {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
      },
    })
  ).current;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.shape,
        animatedStyle,
        {
          left: shape.x,
          top: shape.y,
          width: shape.size,
          height: shape.size,
          borderRadius: shape.type === "circle" ? shape.size / 2 : 16,
        },
      ]}
    />
  );
};

const createStyles = (isLight: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isLight ? "#f8fafc" : "#091212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isLight ? "#e2e8f0" : "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerSub: {
    color: isLight ? "#64748b" : "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  headerProgress: {
    color: "#13ecec",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  infoButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  instructionText: {
    color: isLight ? "#475569" : "#64748b",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
  },
  canvas: {
    flex: 1,
  },
  shape: {
    position: "absolute",
    backgroundColor: isLight ? "#94a3b8" : "#1e293b",
    borderWidth: 1,
    borderColor: isLight ? "#cbd5e1" : "#ffffff10",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  footerText: {
    color: isLight ? "#475569" : "#475569",
    fontSize: 14,
    marginBottom: 20,
  },
  finishButton: {
    flexDirection: "row",
    backgroundColor: isLight ? "#ffffff" : "#1e293b",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: isLight ? "#e2e8f0" : "#ffffff05",
  },
  finishButtonActive: {
    backgroundColor: isLight ? "#f8fafc" : "#142121",
    borderColor: isLight ? "#e2e8f0" : "#10ecec30",
  },
  finishText: {
    color: isLight ? "#64748b" : "#64748b",
    fontSize: 15,
    fontWeight: "700",
  },
  finishTextActive: {
    color: isLight ? "#0f172a" : "white",
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: isLight ? "#e2e8f0" : "#111d1d",
  },
  progressBar: {
    height: "100%",
    backgroundColor: isLight ? "#0284c7" : "#3b386e",
  },
});
