import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
} from "react-native";
import { Phone, ShieldAlert, Stethoscope } from "lucide-react-native";
import { useAppTheme } from "../theme-context";

const DOCTORS = [
  {
    name: "Dr. Sarah Jenkins",
    specialty: "Clinical Psychologist",
    phone: "1-800-555-0199",
  },
  {
    name: "Dr. Michael Chen",
    specialty: "Psychiatrist",
    phone: "1-800-555-0122",
  },
  {
    name: "National Crisis Line",
    specialty: "24/7 Support",
    phone: "988",
  },
];

export default function EmergencyScreen() {
  const { isLightMode } = useAppTheme();
  const styles = createStyles(isLightMode);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isLightMode ? "dark-content" : "light-content"} />
      <View style={styles.header}>
        <Text style={styles.subTitle}>EMERGENCY</Text>
        <Text style={styles.title}>Medical Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.alertBox}>
          <ShieldAlert color="#ff4d4d" size={48} />
          <Text style={styles.alertTitle}>Immediate Help Needed?</Text>
          <Text style={styles.alertDesc}>
            If you are in immediate danger to yourself or others, please call your local emergency services immediately.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => handleCall('911')}
        >
          <Phone color="white" size={24} />
          <Text style={styles.emergencyButtonText}>Call Emergency (911)</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Trusted Professionals</Text>

        <View style={styles.resourceGrid}>
          {DOCTORS.map((doc, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handleCall(doc.phone)}
            >
              <View style={styles.cardIcon}>
                <Stethoscope color="#13ecec" size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{doc.name}</Text>
                <Text style={styles.cardDesc}>{doc.specialty}</Text>
              </View>
              <View style={styles.callAction}>
                <Phone color="#13ecec" size={20} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (isLight: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isLight ? "#f8fafc" : "#091212",
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 32,
  },
  title: {
    color: isLight ? "#0f172a" : "white",
    fontSize: 32,
    fontWeight: "800",
  },
  subTitle: {
    color: isLight ? "#ef4444" : "#ff4d4d",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  alertBox: {
    backgroundColor: isLight ? "#fef2f2" : "#1d1414",
    padding: 32,
    borderRadius: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: isLight ? "#fca5a5" : "#ff4d4d20",
    marginBottom: 24,
  },
  alertTitle: {
    color: isLight ? "#0f172a" : "white",
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
  sectionTitle: {
    color: isLight ? "#0f172a" : 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  resourceGrid: {
    gap: 16,
  },
  card: {
    backgroundColor: isLight ? "#ffffff" : "#142121",
    padding: 20,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: isLight ? "#e2e8f0" : "#ffffff05",
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: isLight ? "#f1f5f9" : "#0d1e1e",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    color: isLight ? "#0f172a" : "white",
    fontSize: 16,
    fontWeight: "700",
  },
  cardDesc: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
  },
  callAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#13ecec10',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
