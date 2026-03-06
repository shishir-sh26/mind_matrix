import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
} from "react-native";
import { Pedometer, Accelerometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, Footprints, Save, History as HistoryIcon, Activity, Heart } from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { useAppTheme } from "./theme-context";

export default function PedometerScreen() {
    const router = useRouter();
    const { isLightMode } = useAppTheme();
    const styles = createStyles(isLightMode);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState("checking");
    const [currentStepCount, setCurrentStepCount] = useState(0);

    const [lastStepTime, setLastStepTime] = useState(0);
    const [liveHeartRate, setLiveHeartRate] = useState(72); // Default resting HR

    // 1. Primary Sensor Initialization (Run once on mount)
    useEffect(() => {
        let pedometerSub: any = null;

        const initPedometer = async () => {
            try {
                const isAvailable = await Pedometer.isAvailableAsync();
                setIsPedometerAvailable(String(isAvailable));
                if (isAvailable) {
                    // Start live sensor tracking
                    pedometerSub = Pedometer.watchStepCount(result => {
                        setCurrentStepCount(prev => prev + (result.steps || 0));
                    });

                    // One-time historical lookup for today's starting value
                    try {
                        const end = new Date();
                        const start = new Date();
                        start.setHours(0, 0, 0, 0);
                        const past = await Pedometer.getStepCountAsync(start, end);
                        if (past && past.steps > 0) {
                            setCurrentStepCount(past.steps);
                        }
                    } catch {
                        console.log("Pedometer History blocked - relying on live tracking only.");
                    }
                }
            } catch (err) {
                console.log("Pedometer API rejected:", err);
                setIsPedometerAvailable("false");
            }
        };

        initPedometer();

        return () => {
            pedometerSub?.remove();
        };
    }, []);

    // 2. Continuous Accelerometer Logic (Step Detection & HR Simulation)
    useEffect(() => {
        let accelerometerSub: any = null;

        Accelerometer.setUpdateInterval(100);
        accelerometerSub = Accelerometer.addListener(data => {
            const { x, y, z } = data;
            const acceleration = Math.sqrt(x * x + y * y + z * z);

            const now = Date.now();
            if (acceleration > 1.8 && (now - lastStepTime > 400)) {
                setLastStepTime(now);
                setCurrentStepCount(prev => prev + 1);

                setLiveHeartRate(prev => Math.min(130, prev + 2));
            } else if (now - lastStepTime > 3000) {
                setLiveHeartRate(prev => Math.max(68, prev - 1));
            }
        });

        return () => {
            accelerometerSub?.remove();
        };
    }, [lastStepTime]);

    const saveToHistory = async () => {
        const log = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            type: "Steps",
            schedule: "Daily Activity",
            finalStatus: `${currentStepCount} steps`,
            lightResult: `${liveHeartRate} bpm`, // Using lightResult field for HR in history
        };

        try {
            const existing = await AsyncStorage.getItem("sleep_history");
            const history = existing ? JSON.parse(existing) : [];
            history.unshift(log);
            await AsyncStorage.setItem("sleep_history", JSON.stringify(history));

            Alert.alert("Activity Saved", "Your step count for today has been logged to history.", [
                { text: "View History", onPress: () => router.push("/history") },
                { text: "Dismiss" }
            ]);
        } catch (e) {
            console.error("Failed to save steps:", e);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Daily Steps</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInUp.delay(200)} style={styles.statCard}>
                    <Footprints size={48} color="#13ecec" style={styles.mainIcon} />
                    <Text style={styles.stepCount}>{currentStepCount}</Text>
                    <Text style={styles.stepLabel}>Steps Today</Text>

                    <View style={styles.statusBadge}>
                        <Activity size={14} color="#13ecec" />
                        <Text style={styles.statusText}>
                            {currentStepCount > 10000 ? "Goal Reached!" : `${10000 - currentStepCount} more to goal`}
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400)} style={styles.infoGrid}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoValue}>{(currentStepCount * 0.04).toFixed(1)}</Text>
                        <Text style={styles.infoLabel}>Calories (kcal)</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoValue}>{(currentStepCount * 0.0008).toFixed(2)}</Text>
                        <Text style={styles.infoLabel}>Distance (km)</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Heart size={14} color="#f87171" />
                            <Text style={styles.infoValue}>{liveHeartRate}</Text>
                        </View>
                        <Text style={styles.infoLabel}>Heart Rate (bpm)</Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(600)} style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.saveButton} onPress={saveToHistory}>
                        <Save size={20} color="black" />
                        <Text style={styles.saveButtonText}>Log Today&apos;s Activity</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => router.push("/history")}
                    >
                        <HistoryIcon size={20} color="#64748b" />
                        <Text style={styles.historyButtonText}>View History</Text>
                    </TouchableOpacity>
                </Animated.View>

                {isPedometerAvailable === "false" && (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>Pedometer sensor not available on this device.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const createStyles = (isLight: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isLight ? "#f8fafc" : "#091212",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isLight ? "#e2e8f0" : "#1e1e1e",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        color: isLight ? "#0f172a" : "white",
        fontSize: 20,
        fontWeight: "700",
        marginLeft: 15,
    },
    content: {
        padding: 20,
        alignItems: "center",
    },
    statCard: {
        width: "100%",
        backgroundColor: isLight ? "#ffffff" : "#142121",
        borderRadius: 32,
        padding: 40,
        alignItems: "center",
        borderWidth: 1,
        borderColor: isLight ? "#e2e8f0" : "#ffffff05",
        marginBottom: 20,
    },
    mainIcon: {
        marginBottom: 20,
    },
    stepCount: {
        color: isLight ? "#0f172a" : "white",
        fontSize: 64,
        fontWeight: "900",
    },
    stepLabel: {
        color: isLight ? "#475569" : "#64748b",
        fontSize: 16,
        fontWeight: "600",
        marginTop: 4,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#13ecec10",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 24,
    },
    statusText: {
        color: "#13ecec",
        fontSize: 14,
        fontWeight: "700",
    },
    infoGrid: {
        flexDirection: "row",
        gap: 15,
        width: "100%",
        marginBottom: 40,
    },
    infoBox: {
        flex: 1,
        backgroundColor: isLight ? "#ffffff" : "#142121",
        padding: 24,
        borderRadius: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: isLight ? "#e2e8f0" : "#ffffff05",
    },
    infoValue: {
        color: isLight ? "#0f172a" : "white",
        fontSize: 24,
        fontWeight: "800",
    },
    infoLabel: {
        color: isLight ? "#475569" : "#64748b",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
    buttonContainer: {
        width: "100%",
        gap: 12,
    },
    saveButton: {
        backgroundColor: "#13ecec",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        borderRadius: 20,
        gap: 12,
    },
    saveButtonText: {
        color: "black",
        fontSize: 16,
        fontWeight: "700",
    },
    historyButton: {
        backgroundColor: isLight ? "#e2e8f0" : "#ffffff05",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        borderRadius: 20,
        gap: 12,
    },
    historyButtonText: {
        color: isLight ? "#475569" : "#64748b",
        fontSize: 16,
        fontWeight: "700",
    },
    errorBanner: {
        marginTop: 20,
        padding: 12,
        backgroundColor: "#ef444410",
        borderRadius: 12,
        width: "100%",
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        textAlign: "center",
    }
});
