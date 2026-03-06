import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
} from "react-native";
import * as Brightness from 'expo-brightness';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Moon, Gauge, Sparkles, Camera, Power, Timer, XCircle, Sun } from "lucide-react-native";
import { Accelerometer } from "expo-sensors";
import * as Haptics from "expo-haptics";
import { CameraView, Camera as ExpoCamera } from "expo-camera";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    FadeInUp,
    FadeOutUp,
} from "react-native-reanimated";
import { useRouter, Stack } from "expo-router";
import { useAppTheme } from "./theme-context";
import { ENGINE_REGISTRY, subscribeToEngine, updateEngineState } from "./engine-state";



const SleepWellScreen = () => {
    const router = useRouter();
    const { isLightMode } = useAppTheme();
    const styles = createStyles(isLightMode);

    // Engine State (Initialized from global registry)
    const [engineActive, setEngineActive] = useState(ENGINE_REGISTRY.active);
    const [timeLeft, setTimeLeft] = useState(ENGINE_REGISTRY.timeLeft);
    const [startTimeStr, setStartTimeStr] = useState(ENGINE_REGISTRY.startTime);
    const [wakeTime, setWakeTime] = useState(ENGINE_REGISTRY.wakeTime);

    // Feature States (Initialized from global registry)
    const [isLightOn, setIsLightOn] = useState(ENGINE_REGISTRY.isLightOn);
    const [isPacingOn, setIsPacingOn] = useState(ENGINE_REGISTRY.isPacingOn);
    const [hideLightAlert, setHideLightAlert] = useState(false);

    // Data States
    const [pacingStatus, setPacingStatus] = useState("Idle");
    const [lightLevel, setLightLevel] = useState(ENGINE_REGISTRY.currentLightLevel);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    // Sync from Global Registry
    useEffect(() => {
        return subscribeToEngine(() => {
            setEngineActive(ENGINE_REGISTRY.active);
            setIsLightOn(ENGINE_REGISTRY.isLightOn);
            setIsPacingOn(ENGINE_REGISTRY.isPacingOn);
            setLightLevel(ENGINE_REGISTRY.currentLightLevel);
            setTimeLeft(ENGINE_REGISTRY.timeLeft);
            setStartTimeStr(ENGINE_REGISTRY.startTime);
            setWakeTime(ENGINE_REGISTRY.wakeTime);
        });
    }, []);

    const scanAnim = useSharedValue(0);
    const pacingBar = useSharedValue(0);
    const initialBrightness = useRef(0.5);

    // Brightness Control Logic
    useEffect(() => {
        (async () => {
            const { status } = await Brightness.requestPermissionsAsync();
            if (status === 'granted') {
                initialBrightness.current = await Brightness.getBrightnessAsync();
            }
        })();
    }, []);

    useEffect(() => {
        if (engineActive) {
            let targetBrightness = 0.2; // Baseline dim for active sleep session

            if (isLightOn) {
                if (lightLevel === "Room Too Bright") {
                    targetBrightness = 0.08;
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                } else if (lightLevel === "Ideal (Dark)") {
                    targetBrightness = 0.05;
                } else {
                    targetBrightness = 0.12; // Dim for acceptable levels
                }
            }

            Brightness.setBrightnessAsync(targetBrightness);
        }
    }, [lightLevel, isLightOn, engineActive]);

    // Permission Management
    useEffect(() => {
        (async () => {
            const { status } = await ExpoCamera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleEndSession = useCallback(async () => {
        setEngineActive(false);
        setIsLightOn(false);
        setIsPacingOn(false);

        // Reset Registry
        updateEngineState({
            active: false,
            isLightOn: false,
            isPacingOn: false
        });

        // Save to History (Persistent)
        const log = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            type: "SleepWell",
            schedule: `${startTimeStr} - ${wakeTime.hour}:${wakeTime.minute < 10 ? '0' : ''}${wakeTime.minute} ${wakeTime.period}`,
            finalStatus: pacingStatus,
            lightResult: lightLevel,
        };

        try {
            const existing = await AsyncStorage.getItem('sleep_history');
            const history = existing ? JSON.parse(existing) : [];
            history.unshift(log);
            await AsyncStorage.setItem('sleep_history', JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history:", e);
        }

        // Restore Brightness
        try {
            await Brightness.setBrightnessAsync(initialBrightness.current);
        } catch (e) {
            console.error("Brightness restore failed", e);
        }

        Alert.alert("Session Complete", "Your sleep hygiene data has been saved to history.", [
            { text: "View History", onPress: () => router.push("/history") }
        ]);
    }, [startTimeStr, wakeTime, pacingStatus, lightLevel, router]);

    // Timer Implementation
    useEffect(() => {
        let timer: any;
        if (engineActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    const next = prev - 1;
                    ENGINE_REGISTRY.timeLeft = next;
                    return next;
                });
            }, 1000);
        } else if (timeLeft === 0 && engineActive) {
            handleEndSession();
        }
        return () => clearInterval(timer);
    }, [engineActive, timeLeft, handleEndSession]);

    // Sensor: Pacing Logic
    useEffect(() => {
        if (!engineActive || !isPacingOn) {
            setPacingStatus("Idle");
            pacingBar.value = withTiming(0);
            return;
        }

        Accelerometer.setUpdateInterval(100);
        const sub = Accelerometer.addListener(data => {
            const movement = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2) - 1;
            const pacingScore = Math.min(Math.max(movement * 200, 0), 100);
            pacingBar.value = withTiming(pacingScore, { duration: 100 });

            if (pacingScore > 60) {
                setPacingStatus("Agitated Pacing Detected");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } else if (pacingScore > 15) {
                setPacingStatus("Slight Restlessness");
            } else {
                setPacingStatus("Body Steady");
            }
        });

        return () => sub.remove();
    }, [engineActive, isPacingOn, pacingBar]);

    // Sensor: Light Logic Simulation
    useEffect(() => {
        if (!isLightOn) {
            scanAnim.value = 0;
            return;
        }

        scanAnim.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
        const timer = setInterval(() => {
            const levels = ["Ideal (Dark)", "Acceptable", "Device Light Present", "Room Too Bright"];
            setLightLevel(levels[Math.floor(Math.random() * levels.length)]);
        }, 3000);

        return () => clearInterval(timer);
    }, [isLightOn, scanAnim]);

    const toggleEngine = () => {
        if (!engineActive) {
            const now = new Date();
            const startStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setStartTimeStr(startStr);
            setEngineActive(true);
            setTimeLeft(3600);

            setIsPacingOn(true);
            setIsLightOn(true);
            setHideLightAlert(false);

            updateEngineState({
                active: true,
                isPacingOn: true,
                isLightOn: true,
                startTime: startStr,
                timeLeft: 3600
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            handleEndSession();
        }
    };

    const adjustWakeHour = () => {
        if (engineActive) return;
        const newTime = { ...wakeTime, hour: wakeTime.hour === 12 ? 1 : wakeTime.hour + 1 };
        setWakeTime(newTime);
        updateEngineState({ wakeTime: newTime });
    };

    const togglePeriod = () => {
        if (engineActive) return;
        const newTime = { ...wakeTime, period: wakeTime.period === 'AM' ? 'PM' : 'AM' };
        setWakeTime(newTime);
        updateEngineState({ wakeTime: newTime });
    };

    const pacingBarStyle = useAnimatedStyle(() => ({
        width: `${pacingBar.value}%`,
        backgroundColor: pacingBar.value > 60 ? '#ef4444' : '#a78bfa',
    }));

    const scanStyle = useAnimatedStyle(() => ({
        top: `${scanAnim.value * 100}%`,
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isLightMode ? "dark-content" : "light-content"} />
            <Stack.Screen options={{ headerShown: false }} />

            {isLightOn && !hideLightAlert && (
                <Animated.View
                    entering={FadeInUp}
                    exiting={FadeOutUp}
                    style={[
                        styles.topAlert,
                        lightLevel === "Room Too Bright" && styles.alertDanger
                    ]}
                >
                    <View style={styles.alertContent}>
                        {lightLevel === "Room Too Bright" ? <Sun size={16} color="white" /> : <Sparkles size={16} color="white" />}
                        <View>
                            <Text style={styles.alertText}>
                                {lightLevel === "Room Too Bright"
                                    ? "HIGH AMBIENT LIGHT DETECTED"
                                    : "Biometric Light Sync Active"}
                            </Text>
                            {lightLevel === "Room Too Bright" ? (
                                <Text style={styles.alertSubtext}>Move to another place where sleep is not disturbed. Auto-dimming active.</Text>
                            ) : lightLevel === "Ideal (Dark)" ? (
                                <Text style={styles.alertSubtext}>Perfect darkness detected. Decreasing app brightness autonomously.</Text>
                            ) : (
                                <Text style={styles.alertSubtext}>Biometric Light Tracking Active...</Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => {
                        setHideLightAlert(true); // Dismiss banner only, keep sensors on!
                        updateEngineState({ hideLightAlert: true });
                    }}>
                        <XCircle size={20} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            )}

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft color={isLightMode ? "#0f172a" : "white"} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>SleepWell Engine</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.section, styles.engineSection]}>
                    <View style={styles.engineHeader}>
                        <Power size={24} color={engineActive ? "#10b981" : "#64748b"} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.engineTitle}>Sleep Engine</Text>
                            <Text style={styles.engineSubtitle}>{engineActive ? "RUNNING BIOMETRICS" : "OFFLINE"}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.engineToggle, engineActive && styles.engineToggleActive]}
                            onPress={toggleEngine}
                        >
                            <Text style={styles.engineToggleText}>{engineActive ? "STOP" : "START"}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.timerRow}>
                        <Timer size={18} color="#94a3b8" />
                        <View style={styles.clockBox}>
                            <Text style={styles.clockLabel}>{engineActive ? "STARTED" : "SLEEP FROM"}</Text>
                            <Text style={styles.clockValue}>{engineActive ? startTimeStr : "NOW"}</Text>
                        </View>
                        <View style={styles.clockArrow}>
                            <Text style={{ color: '#a78bfa', fontWeight: 'bold' }}>→</Text>
                        </View>
                        <View style={styles.clockBox}>
                            <Text style={styles.clockLabel}>TILL WHAT TIME</Text>
                            <View style={styles.pickerRow}>
                                <TouchableOpacity onPress={adjustWakeHour} disabled={engineActive} style={styles.pickerBtn}>
                                    <Text style={styles.clockValue}>{wakeTime.hour}:{wakeTime.minute < 10 ? '0' : ''}{wakeTime.minute}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={togglePeriod} disabled={engineActive} style={styles.periodBtn}>
                                    <Text style={styles.periodTxt}>{wakeTime.period}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.grid}>
                    <TouchableOpacity
                        disabled={!engineActive}
                        style={[styles.gridCard, !engineActive && styles.cardLocked]}
                        onPress={() => {
                            const next = !isLightOn;
                            setIsLightOn(next);
                            updateEngineState({ isLightOn: next });
                            if (next) {
                                setHideLightAlert(false);
                                updateEngineState({ hideLightAlert: false });
                            }
                        }}
                    >
                        <View style={styles.cardHeader}>
                            <Camera size={24} color={isLightOn ? "#a78bfa" : "#64748b"} />
                            <View style={[styles.statusDot, { backgroundColor: isLightOn ? '#a78bfa' : '#334155' }]} />
                        </View>
                        <Text style={styles.cardTitle}>Light Sync</Text>
                        <Text style={styles.cardStatus}>{isLightOn ? lightLevel : "Off"}</Text>

                        {isLightOn && (
                            <View style={styles.miniScanContainer}>
                                {hasPermission ? (
                                    <CameraView facing="front" style={StyleSheet.absoluteFillObject} />
                                ) : (
                                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={{ color: '#64748b', fontSize: 8 }}>Camera Access Required</Text>
                                    </View>
                                )}
                                <Animated.View style={[styles.scanLine, scanStyle]} />
                            </View>
                        )}
                        {!engineActive && <Moon size={16} color="#64748b" style={styles.lockIcon} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={!engineActive}
                        style={[styles.gridCard, !engineActive && styles.cardLocked]}
                        onPress={() => {
                            const next = !isPacingOn;
                            setIsPacingOn(next);
                            updateEngineState({ isPacingOn: next });
                        }}
                    >
                        <View style={styles.cardHeader}>
                            <Gauge size={24} color={isPacingOn ? "#a78bfa" : "#64748b"} />
                            <View style={[styles.statusDot, { backgroundColor: isPacingOn ? '#a78bfa' : '#334155' }]} />
                        </View>
                        <Text style={styles.cardTitle}>Pacing Track</Text>
                        <Text style={styles.cardStatus}>{isPacingOn ? pacingStatus : "Off"}</Text>

                        {isPacingOn && (
                            <View style={styles.miniPacingBarContainer}>
                                <Animated.View style={[styles.miniBarFill, pacingBarStyle]} />
                            </View>
                        )}
                        {!engineActive && <Moon size={16} color="#64748b" style={styles.lockIcon} />}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View >
    );
};

const createStyles = (isLight: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isLight ? "#f8fafc" : "#091212",
    },
    topAlert: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: '#a78bfa',
        padding: 12,
        borderRadius: 16,
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    alertContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    alertText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '800',
    },
    alertSubtext: {
        color: '#ffffff80',
        fontSize: 8,
        fontWeight: '600',
    },
    alertDanger: {
        backgroundColor: '#ef4444',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 60,
        paddingHorizontal: 24,
        gap: 16,
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isLight ? "#e2e8f0" : "#ffffff10",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        color: isLight ? "#0f172a" : "white",
        fontSize: 20,
        fontWeight: "700",
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    section: {
        backgroundColor: isLight ? "#ffffff" : "#142121",
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isLight ? "#e2e8f0" : "#ffffff05",
    },
    engineSection: {
        borderColor: isLight ? "#c4b5fd" : '#a78bfa40',
        backgroundColor: isLight ? "#f5f3ff" : '#1a1f1f',
    },
    engineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 20,
    },
    engineTitle: {
        color: isLight ? "#0f172a" : 'white',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    engineSubtitle: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    engineToggle: {
        backgroundColor: isLight ? "#e2e8f0" : '#1e293b',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: isLight ? "#cbd5e1" : '#ffffff10',
    },
    engineToggleActive: {
        backgroundColor: '#10b981',
        borderColor: '#10b98130',
    },
    engineToggleText: {
        color: isLight ? "#0f172a" : 'white',
        fontSize: 12,
        fontWeight: '900',
    },
    clockBox: {
        alignItems: 'center',
    },
    clockLabel: {
        color: '#64748b',
        fontSize: 9,
        fontWeight: '800',
        marginBottom: 4,
    },
    clockValue: {
        color: isLight ? "#0f172a" : 'white',
        fontSize: 22,
        fontWeight: '900',
    },
    clockArrow: {
        paddingHorizontal: 15,
    },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pickerBtn: {
        backgroundColor: isLight ? "#f1f5f9" : '#ffffff05',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    periodBtn: {
        backgroundColor: '#a78bfa20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    periodTxt: {
        color: '#a78bfa',
        fontSize: 12,
        fontWeight: '900',
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isLight ? "#f1f5f9" : '#00000030',
        padding: 20,
        borderRadius: 24,
    },
    grid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    gridCard: {
        flex: 1,
        backgroundColor: isLight ? "#ffffff" : '#142121',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: isLight ? "#e2e8f0" : '#ffffff05',
        height: 160,
    },
    cardLocked: {
        opacity: 0.5,
        backgroundColor: isLight ? "#f1f5f9" : '#0f1717',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    cardTitle: {
        color: isLight ? "#0f172a" : 'white',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardStatus: {
        color: isLight ? "#64748b" : '#64748b',
        fontSize: 11,
    },
    miniScanContainer: {
        marginTop: 10,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: isLight ? "#e2e8f0" : 'black',
    },
    scanLine: {
        position: 'absolute',
        width: '100%',
        height: 1,
        backgroundColor: '#a78bfa',
    },
    miniPacingBarContainer: {
        marginTop: 15,
        height: 4,
        backgroundColor: isLight ? "#cbd5e1" : '#ffffff10',
        borderRadius: 2,
        overflow: 'hidden',
    },
    miniBarFill: {
        height: '100%',
    },
    lockIcon: {
        position: 'absolute',
        bottom: 12,
        right: 12,
    }
});

export default SleepWellScreen;
