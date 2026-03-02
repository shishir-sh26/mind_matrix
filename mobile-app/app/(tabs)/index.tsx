import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import {
  Wind,
  GraduationCap,
  ChevronDown,
  Leaf,
  Target,
  Smile,
  ChevronRight,
  Fingerprint,
  Waves,
  BriefcaseMedical,
  Activity,
  ShieldAlert,
} from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const router = useRouter();
  const pulse = useSharedValue(1);
  const [activeMode, setActiveMode] = useState("BREATHE");

  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1.1, { duration: 2500 }), -1, true);
  }, [pulse]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [1, 1.1], [0.4, 0.7]),
    transform: [{ scale: pulse.value * 1.2 }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.subTitle}>SMART TOOLKIT</Text>
          <Text style={styles.title}>Intervention</Text>
        </View>
        <TouchableOpacity style={styles.modeToggle}>
          <GraduationCap color="#a78bfa" size={16} />
          <Text style={styles.modeText}>Student Mode</Text>
          <ChevronDown color="#64748b" size={14} />
        </TouchableOpacity>
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
            icon={<Leaf size={20} color={activeMode === "CALM" ? "#13ecec" : "#64748b"} />}
            active={activeMode === "CALM"}
            onPress={() => setActiveMode("CALM")}
          />
          <ModeItem
            label="BREATHE"
            icon={<Wind size={20} color="#13ecec" />}
            active={activeMode === "BREATHE"}
            onPress={() => setActiveMode("BREATHE")}
          />
          <ModeItem
            label="FOCUS"
            icon={<Target size={20} color={activeMode === "FOCUS" ? "#13ecec" : "#64748b"} />}
            active={activeMode === "FOCUS"}
            onPress={() => setActiveMode("FOCUS")}
          />
          <ModeItem
            label="RELEASE"
            icon={<Smile size={20} color={activeMode === "RELEASE" ? "#13ecec" : "#64748b"} />}
            active={activeMode === "RELEASE"}
            onPress={() => setActiveMode("RELEASE")}
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Interventions</Text>

        <View style={styles.interventionGrid}>
          <InterventionCard
            title="Breathe with Me"
            desc="Haptic-sync breathing guide."
            icon={<Waves color="#13ecec" size={24} />}
            onPress={() => router.push("/breathe")}
          />
          <InterventionCard
            title="Clear the Space"
            desc="Swipe away visual clutter."
            icon={<Activity color="#a78bfa" size={24} />}
            onPress={() => router.push("/clear")}
          />
          <InterventionCard
            title="Rhythm Tap"
            desc="Grounding for panic attacks."
            icon={<Fingerprint color="#f87171" size={24} />}
            onPress={() => router.push("/rhythm")}
          />
          <SOSCard />
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
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
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
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onPress: () => void;
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

const SOSCard = () => (
  <TouchableOpacity style={[styles.card, styles.sosCard]}>
    <View style={[styles.cardIconContainer, styles.sosIconContainer]}>
      <BriefcaseMedical color="#ff4d4d" size={24} />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>SOS Protocol</Text>
      <Text style={styles.cardDesc}>Tap for immediate help</Text>
    </View>
    <View style={styles.sosAction}>
      <ShieldAlert color="#ff4d4d" size={16} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#091212",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 10,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subTitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  modeToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "#ffffff10",
  },
  modeText: {
    color: "white",
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
    backgroundColor: "#0d1e1e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#13ecec20",
    shadowColor: "#13ecec",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
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
    gap: 8,
  },
  modeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#111d1d",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff05",
  },
  modeIconActive: {
    borderColor: "#13ecec",
    backgroundColor: "#13ecec10",
  },
  modeLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  modeLabelActive: {
    color: "#13ecec",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  interventionGrid: {
    gap: 12,
  },
  card: {
    backgroundColor: "#142121",
    padding: 16,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "#ffffff05",
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#0d1e1e",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  cardDesc: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
  },
  cardAction: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  sosCard: {
    backgroundColor: "#1d1414",
    borderColor: "#ff4d4d10",
  },
  sosIconContainer: {
    backgroundColor: "#2a1a1a",
  },
  sosAction: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#2a1a1a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff4d4d20",
  },
});
