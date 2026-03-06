import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Vibration,
  Platform,
} from "react-native";
import {
  Wind,
  Leaf,
  Target,
  Smile,
  ChevronRight,
  Fingerprint,
  Waves,
  Activity,
  Circle,
  Brain,
  Sparkles,
} from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import axios from "axios";
import { useAppTheme } from "../theme-context";

export default function Dashboard() {
  const router = useRouter();
  const pulse = useSharedValue(1);
  const [activeMode, setActiveMode] = useState("BREATHE");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { isLightMode, toggleTheme } = useAppTheme();
  const shakeStartTime = useRef<number | null>(null);

  const styles = createStyles(isLightMode);

  const player = useAudioPlayer(null);
  player.loop = true;

  useEffect(() => {
    if (activeMode === "NONE") {
      player.pause();
      return;
    }

    const AUDIO_MAP: Record<string, any> = {
      CALM: require('../../assets/sounds/calm.wav'),
      BREATHE: require('../../assets/sounds/breathe.wav'),
      FOCUS: require('../../assets/sounds/focus.wav'),
      RELEASE: require('../../assets/sounds/release.wav'),
    };

    const asset = AUDIO_MAP[activeMode];
    if (asset) {
      (async () => {
        try {
          await setAudioModeAsync({
            playsInSilentMode: true,
            interruptionMode: 'duckOthers',
          });
          player.replace(asset);
          player.play();
        } catch (err) {
          console.warn("Ambient Audio Error:", err);
        }
      })();
    }
  }, [activeMode, player]);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.1, { duration: 2500 }), -1, true);
  }, [pulse]);

  const triggerSensorIntervention = useCallback(async (shakeForce: number) => {
    setIsAnalyzing(true);
    try {
      // Use localhost on Web to avoid CORS/Network Error, use device IP natively
      const backendUrl = Platform.OS === 'web'
        ? "http://localhost:8000/analyze-stress"
        : "http://192.168.56.1:8000/analyze-stress";

      const response = await axios.post(backendUrl, {
        shake_force: shakeForce,
        sensor_data: []
      });
      const data = response.data;
      if (data.type === "BREATHE" || data.type === "CALM" || data.type === "FOCUS") {
        Vibration.vibrate();
        if (data.type === "BREATHE") {
          router.push("/breathe");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  }, [router]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(200);
    const subscription = Accelerometer.addListener((data) => {
      if (isAnalyzing || !data || typeof data.x !== 'number') return;

      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);

      if (magnitude > 2.0) {
        if (shakeStartTime.current === null) {
          shakeStartTime.current = Date.now();
        } else if (Date.now() - shakeStartTime.current >= 3000) {
          shakeStartTime.current = null;
          triggerSensorIntervention(magnitude);
        }
      } else {
        shakeStartTime.current = null;
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAnalyzing, triggerSensorIntervention]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [1, 1.1], [0.4, 0.7]),
    transform: [{ scale: pulse.value * 1.2 }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isLightMode ? "dark-content" : "light-content"} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Brain color="#13ecec" size={28} />
          <View style={styles.logoBadge}>
            <Sparkles color="#a78bfa" size={10} />
          </View>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>MindSync</Text>
          <Text style={styles.tagline}>Advanced Neural Monitoring</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.orbContainer}>
          <Animated.View style={[styles.orbGlow, glowStyle]} />
          <Animated.View style={[styles.orb, orbStyle]}>
            <View style={styles.orbInner} />
          </Animated.View>
        </View>

        <View style={styles.modeSelector}>
          <ModeItem
            label="CALM"
            icon={<Leaf size={18} color={activeMode === "CALM" ? "#13ecec" : "#64748b"} />}
            active={activeMode === "CALM"}
            onPress={() => setActiveMode("CALM")}
            styles={styles}
          />
          <ModeItem
            label="BREATHE"
            icon={<Wind size={18} color={activeMode === "BREATHE" ? "#13ecec" : "#64748b"} />}
            active={activeMode === "BREATHE"}
            onPress={() => setActiveMode("BREATHE")}
            styles={styles}
          />
          <ModeItem
            label="FOCUS"
            icon={<Target size={18} color={activeMode === "FOCUS" ? "#13ecec" : "#64748b"} />}
            active={activeMode === "FOCUS"}
            onPress={() => setActiveMode("FOCUS")}
            styles={styles}
          />
          <ModeItem
            label="RELEASE"
            icon={<Smile size={18} color={activeMode === "RELEASE" ? "#13ecec" : "#64748b"} />}
            active={activeMode === "RELEASE"}
            onPress={() => setActiveMode("RELEASE")}
            styles={styles}
          />
          <ModeItem
            label="NONE"
            icon={<Circle size={18} color={activeMode === "NONE" ? "#13ecec" : "#64748b"} />}
            active={activeMode === "NONE"}
            onPress={() => setActiveMode("NONE")}
            styles={styles}
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Interventions</Text>

        <View style={styles.interventionGrid}>
          <InterventionCard
            title="Breathe with Me"
            desc="Haptic-sync breathing guide."
            icon={<Waves color="#13ecec" size={24} />}
            onPress={() => router.push("/breathe")}
            styles={styles}
          />
          <InterventionCard
            title="Clear the Space"
            desc="Swipe away visual clutter."
            icon={<Activity color="#a78bfa" size={24} />}
            onPress={() => router.push("/clear")}
            styles={styles}
          />
          <InterventionCard
            title="Rhythm Tap"
            desc="Grounding for panic attacks."
            icon={<Fingerprint color="#f87171" size={24} />}
            onPress={() => router.push("/rhythm")}
            styles={styles}
          />
        </View>

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            Disclaimer: This application does not claim to improve or treat the mental health or well-being of the person. It is intended for self-monitoring and general wellness purposes only. Always consult a medical professional for health concerns.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const ModeItem = ({
  label,
  icon,
  active,
  onPress,
  styles,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
  styles: any;
}) => (
  <TouchableOpacity style={styles.modeItem} onPress={onPress}>
    <View style={[styles.modeIconContainer, active && styles.modeIconActive]}>
      {icon}
    </View>
    <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const InterventionCard = ({
  title,
  desc,
  icon,
  onPress,
  styles,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onPress: () => void;
  styles: any;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardIconContainer}>{icon}</View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </View>
    <View style={styles.cardAction}>
      <ChevronRight color="#64748b" size={16} />
    </View>
  </TouchableOpacity>
);


const createStyles = (isLight: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isLight ? "#f8fafc" : "#091212",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 10,
    gap: 16,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: isLight ? "#ffffff" : "#13ecec15",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: isLight ? "#e2e8f0" : "#13ecec40",
  },
  logoBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: isLight ? "#ffffff" : "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: isLight ? "#cbd5e1" : "#a78bfa50",
  },
  title: {
    color: isLight ? "#0f172a" : "white",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    color: isLight ? "#0284c7" : "#13ecec",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  subTitle: {
    color: isLight ? "#475569" : "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  modeToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isLight ? "#ffffff" : "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: isLight ? "#e2e8f0" : "#ffffff10",
  },
  modeText: {
    color: isLight ? "#0f172a" : "white",
    fontSize: 13,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  orbContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  orb: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: isLight ? "#f1f5f9" : "#0d1e1e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: isLight ? "#13ecec40" : "#13ecec20",
    shadowColor: "#13ecec",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isLight ? 0.1 : 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  orbInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#13ecec",
    opacity: 0.15,
  },
  orbGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#13ecec15",
  },
  modeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  modeItem: {
    alignItems: "center",
    gap: 6,
  },
  modeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isLight ? "#ffffff" : "#111d1d",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: isLight ? "#e2e8f0" : "#ffffff05",
  },
  modeIconActive: {
    borderColor: "#13ecec",
    backgroundColor: isLight ? "#13ecec20" : "#13ecec10",
  },
  modeLabel: {
    color: isLight ? "#64748b" : "#64748b",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  modeLabelActive: {
    color: isLight ? "#0284c7" : "#13ecec",
  },
  sectionTitle: {
    color: isLight ? "#0f172a" : "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  interventionGrid: {
    gap: 12,
  },
  card: {
    backgroundColor: isLight ? "#ffffff" : "#142121",
    padding: 16,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: isLight ? "#e2e8f0" : "#ffffff05",
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: isLight ? "#f8fafc" : "#0d1e1e",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: isLight ? "#0f172a" : "white",
    fontSize: 16,
    fontWeight: "700",
  },
  cardDesc: {
    color: isLight ? "#64748b" : "#64748b",
    fontSize: 13,
    marginTop: 2,
  },
  cardAction: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: isLight ? "#f1f5f9" : "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  sosCard: {
    backgroundColor: isLight ? "#fef2f2" : "#1d1414",
    borderColor: isLight ? "#fecaca" : "#ff4d4d10",
  },
  sosIconContainer: {
    backgroundColor: isLight ? "#fee2e2" : "#2a1a1a",
  },
  sosAction: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: isLight ? "#fee2e2" : "#2a1a1a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: isLight ? "#fca5a5" : "#ff4d4d20",
  },
  disclaimerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerText: {
    color: '#475569', // Subtle gray color for small print
    fontStyle: 'italic',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
  }
});
