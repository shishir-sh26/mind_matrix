import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { AlertCircle, Phone, Heart, ShieldAlert } from "lucide-react-native";

export default function EmergencyScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.subTitle}>EMERGENCY</Text>
        <Text style={styles.title}>SOS Protocol</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.alertBox}>
          <ShieldAlert color="#ff4d4d" size={48} />
          <Text style={styles.alertTitle}>Immediate Help Needed?</Text>
          <Text style={styles.alertDesc}>
            If you are in immediate danger to yourself or others, please call emergency services.
          </Text>
        </View>

        <TouchableOpacity style={styles.emergencyButton}>
          <Phone color="white" size={24} />
          <Text style={styles.emergencyButtonText}>Call Emergency Services</Text>
        </TouchableOpacity>

        <View style={styles.resourceGrid}>
          <ResourceCard
            title="Crisis Hotline"
            desc="Available 24/7 for support"
            icon={<AlertCircle color="#13ecec" size={24} />}
          />
          <ResourceCard
            title="My Support"
            desc="Notify your trusted contacts"
            icon={<Heart color="#a78bfa" size={24} />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const ResourceCard = ({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) => (
  <TouchableOpacity style={styles.card}>
    <View style={styles.cardIcon}>{icon}</View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDesc}>{desc}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#091212",
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 32,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
  },
  subTitle: {
    color: "#ff4d4d",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  alertBox: {
    backgroundColor: "#1d1414",
    padding: 32,
    borderRadius: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff4d4d20",
    marginBottom: 24,
  },
  alertTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
  },
  alertDesc: {
    color: "#64748b",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  emergencyButton: {
    backgroundColor: "#ff4d4d",
    flexDirection: "row",
    paddingVertical: 18,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
    shadowColor: "#ff4d4d",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  emergencyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  resourceGrid: {
    gap: 16,
  },
  card: {
    backgroundColor: "#142121",
    padding: 24,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    borderWidth: 1,
    borderColor: "#ffffff05",
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#0d1e1e",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  cardDesc: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 2,
  },
});
