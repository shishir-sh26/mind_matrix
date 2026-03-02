import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  StatusBar,
} from "react-native";
import { X, Info, CheckCircle2 } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const INITIAL_SHAPES = [
  { id: 1, x: 100, y: 150, size: 80, type: "rect" },
  { id: 2, x: 220, y: 200, size: 60, type: "rect" },
  { id: 3, x: 150, y: 350, size: 70, type: "circle" },
  { id: 4, x: 80, y: 500, size: 90, type: "rect" },
  { id: 5, x: 250, y: 450, size: 75, type: "rect" },
];

export default function ClearSpace() {
  const router = useRouter();
  const [shapes, setShapes] = useState(INITIAL_SHAPES);
  const totalShapes = INITIAL_SHAPES.length;
  const clearedCount = totalShapes - shapes.length;
  const progress = (clearedCount / totalShapes) * 100;

  const removeShape = (id: number) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
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

const DraggableShape = ({ shape, onCleared }: { shape: any; onCleared: () => void }) => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#091212",
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
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerSub: {
    color: "#94a3b8",
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
    color: "#64748b",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
  },
  canvas: {
    flex: 1,
  },
  shape: {
    position: "absolute",
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#ffffff10",
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
    color: "#475569",
    fontSize: 14,
    marginBottom: 20,
  },
  finishButton: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#ffffff05",
  },
  finishButtonActive: {
    backgroundColor: "#142121",
    borderColor: "#10ecec30",
  },
  finishText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "700",
  },
  finishTextActive: {
    color: "white",
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#111d1d",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3b386e", 
  },
});
