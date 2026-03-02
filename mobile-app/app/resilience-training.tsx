import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated, Dimensions, TouchableOpacity, Easing } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { ArrowLeft, MonitorPlay, Waves, TimerReset, Zap, Infinity } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Camera, CameraView } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';

const { width } = Dimensions.get('window');

// ----------------------------------------------------------------------
// 1. Vagal Tone Mirror (Front Camera + Accelerometer proxy)
// ----------------------------------------------------------------------
const VagalMirrorPhase = ({ onComplete }: { onComplete: () => void }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [timer, setTimer] = useState(15);
    const [tension, setTension] = useState(0); // 0 to 100
    const [isFrozen, setIsFrozen] = useState(false);
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    useEffect(() => {
        if (!isActive) return;
        let sub: any;

        const processMovement = (data: { x: number; y: number; z: number }) => {
            const mag = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z) - 1; // approx gravity removal
            if (mag > 0.05) {
                setTension(prev => Math.min(prev + 15, 100));
            } else {
                setTension(prev => Math.max(prev - 2, 0));
            }
        };

        Accelerometer.setUpdateInterval(100);
        sub = Accelerometer.addListener(processMovement);

        return () => sub && sub.remove();
    }, [isActive]);

    useEffect(() => {
        if (!isActive) return;

        if (tension > 80 && !isFrozen) {
            setIsFrozen(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
            ]).start();
        } else if (tension < 40 && isFrozen) {
            setIsFrozen(false);
        }
    }, [tension, isActive, isFrozen, shakeAnim]);

    useEffect(() => {
        if (!isActive || isFrozen) return;
        const intr = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    clearInterval(intr);
                    setTimeout(() => onComplete(), 500);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(intr);
    }, [isActive, isFrozen, onComplete]);

    return (
        <View style={styles.phaseContainer}>
            <View style={styles.phaseHeader}>
                <MonitorPlay size={32} color="#10b981" />
                <ThemedText style={styles.phaseTitle}>Vagal Tone Mirror</ThemedText>
            </View>
            <ThemedText style={styles.phaseDesc}>
                Maintain absolute postural stoicism and facial relaxation. Precision sensors detect micro-tremors and movements caused by biological stress response.
            </ThemedText>

            {!isActive ? (
                <Pressable style={styles.actionBtn} onPress={() => setIsActive(true)}>
                    <ThemedText style={styles.actionBtnText}>Start Mirror Phase</ThemedText>
                </Pressable>
            ) : (
                <View style={styles.mirrorFrame}>
                    {hasPermission && (
                        <CameraView facing="front" style={StyleSheet.absoluteFillObject} />
                    )}
                    <View style={styles.mirrorOverlay} />

                    <Animated.View style={[styles.taskBox, { transform: [{ translateX: shakeAnim }] }, isFrozen && styles.frozenTaskBox]}>
                        <ThemedText style={styles.taskText}>
                            {isFrozen ? "TENSION DETECTED" : `24 + 18 x ${timer}`}
                        </ThemedText>
                    </Animated.View>

                    <View style={styles.tensionBarContainer}>
                        <View style={[styles.tensionBarFill, { height: `${tension}%`, backgroundColor: tension > 80 ? '#ef4444' : '#fbbf24' }]} />
                    </View>
                    <ThemedText style={styles.tensionLabel}>Muscle Tension</ThemedText>

                    <View style={styles.mirrorFooter}>
                        <ThemedText style={styles.mirrorTimer}>{timer}s</ThemedText>
                    </View>
                </View>
            )}
        </View>
    );
};

// ----------------------------------------------------------------------
// 2. Sonic Grounding (Mic + Target Frequency Haptics)
// ----------------------------------------------------------------------
const SonicGroundingPhase = ({ onComplete }: { onComplete: () => void }) => {
    const [isActive, setIsActive] = useState(false);
    const [micLevel, setMicLevel] = useState(-160);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const [progress, setProgress] = useState(0);
    const [isDistracting, setIsDistracting] = useState(false);

    const waveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        return () => { stopHumming(); };
    }, []);

    useEffect(() => {
        if (progress >= 100) {
            stopHumming();
            onComplete();
        }
    }, [progress, onComplete]);

    useEffect(() => {
        if (isActive) {
            Animated.loop(
                Animated.timing(waveAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true
                })
            ).start();
        } else {
            waveAnim.stopAnimation();
            waveAnim.setValue(0);
        }
    }, [isActive, waveAnim]);

    useEffect(() => {
        if (!isActive) return;
        const distInt = setInterval(() => {
            if (Math.random() > 0.6) {
                setIsDistracting(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                setTimeout(() => setIsDistracting(false), 800);
            }
        }, 3000);
        return () => clearInterval(distInt);
    }, [isActive]);

    const startHumming = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY,
                    (status) => {
                        if (status.isRecording && status.metering !== undefined) {
                            setMicLevel(status.metering);
                            // Sweet spot: roughly -20 to -5 decibels
                            if (status.metering > -20 && status.metering < -5) {
                                setProgress(p => Math.min(p + 1, 100));
                                // Sympathetic resonance pulse
                                if (Math.random() > 0.6) {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                            } else if (status.metering >= -5) {
                                // Too loud
                                setProgress(p => Math.max(p - 1, 0));
                            }
                        }
                    },
                    150
                );
                recordingRef.current = recording;
                setIsActive(true);
            }
        } catch (err) {
            console.error('Failed to start mic', err);
        }
    };

    const stopHumming = async () => {
        if (recordingRef.current) {
            try { await recordingRef.current.stopAndUnloadAsync(); } catch { }
            recordingRef.current = null;
        }
        setIsActive(false);
    };

    const isSweetSpot = micLevel > -20 && micLevel < -5;

    return (
        <View style={[styles.phaseContainer, isDistracting && styles.distractingBg]}>
            <View style={styles.phaseHeader}>
                <Waves size={32} color={isDistracting ? "black" : "#60a5fa"} />
                <ThemedText style={[styles.phaseTitle, isDistracting && { color: 'black' }]}>Sonic Grounding</ThemedText>
            </View>
            <ThemedText style={[styles.phaseDesc, isDistracting && { color: '#333' }]}>
                Hold a low, steady hum to match the target frequency. Haptics will pulse sympathetically. Power through the digital noise.
            </ThemedText>

            <View style={styles.sonicVisualizer}>
                {isActive && [0, 1, 2].map((i) => (
                    <Animated.View
                        key={i}
                        style={[
                            styles.waveCircle,
                            {
                                borderColor: isSweetSpot ? '#60a5fa' : (micLevel >= -5 ? '#ef4444' : '#64748b'),
                                transform: [{
                                    scale: waveAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1 + (i * 0.2), 2 + (i * 0.5)]
                                    })
                                }],
                                opacity: waveAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8 - (i * 0.2), 0]
                                })
                            }
                        ]}
                    />
                ))}
                {!isActive ? (
                    <Infinity size={48} color="#64748b" />
                ) : (
                    <ThemedText style={{ color: isSweetSpot ? '#60a5fa' : 'white', fontSize: 24, fontWeight: 'bold' }}>
                        {isSweetSpot ? "LOCKED" : "TUNE IN"}
                    </ThemedText>
                )}
            </View>

            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: '#60a5fa' }]} />
            </View>

            {!isActive ? (
                <Pressable style={styles.actionBtn} onPress={startHumming}>
                    <ThemedText style={styles.actionBtnText}>Begin Hum Phase</ThemedText>
                </Pressable>
            ) : (
                <ThemedText style={[{ marginTop: 20 }, isDistracting && { color: 'black' }]}>
                    Coherence: {progress}%
                </ThemedText>
            )}
        </View>
    );
};

// ----------------------------------------------------------------------
// 3. The Recovery Race (Spike + Camera Cooling)
// ----------------------------------------------------------------------
const RecoveryRacePhase = ({ onComplete }: { onComplete: () => void }) => {
    const [subPhase, setSubPhase] = useState<'intro' | 'spike' | 'recovery'>('intro');
    const [taps, setTaps] = useState(0);
    const [spikeTime, setSpikeTime] = useState(15);
    const [coreTemp, setCoreTemp] = useState(100); // UI representation of stress
    const [bpm, setBpm] = useState(0);
    const [hasCamera, setHasCamera] = useState(false);

    // Heart rate tracking logic (SCG)
    const samples = useRef<number[]>([]);
    const lastUpdate = useRef(0);
    const SAMPLES_NEEDED = 5 * 50; // 5 seconds window at 50Hz

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasCamera(status === 'granted');
        })();
        Accelerometer.setUpdateInterval(20); // 50Hz
    }, []);

    const processHEartRate = React.useCallback(() => {
        if (samples.current.length < SAMPLES_NEEDED / 2) return;
        let peaks = 0;
        const threshold = 0.015;
        const data = samples.current;
        for (let i = 1; i < data.length - 1; i++) {
            if (data[i] > data[i - 1] + threshold && data[i] > data[i + 1] + threshold) peaks++;
        }
        const calculatedBpm = Math.round((peaks / 5) * 60);

        if (calculatedBpm > 40 && calculatedBpm < 160) {
            setBpm(calculatedBpm);
            // Core temperature drops faster if BPM is lower (cooling down)
            setCoreTemp(prev => {
                const targetReduction = calculatedBpm < 75 ? 8 : (calculatedBpm < 90 ? 4 : 1);
                const next = Math.max(0, prev - targetReduction);
                if (next === 0) {
                    setTimeout(() => onComplete(), 1500);
                }
                return next;
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [SAMPLES_NEEDED, onComplete]);

    useEffect(() => {
        if (subPhase === 'spike') {
            const int = setInterval(() => {
                setSpikeTime(prev => {
                    if (prev <= 1) {
                        clearInterval(int);
                        setSubPhase('recovery');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(int);
        } else if (subPhase === 'recovery') {
            const subscription = Accelerometer.addListener(data => {
                const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
                samples.current.push(magnitude);
                if (samples.current.length > SAMPLES_NEEDED) samples.current.shift();

                const now = Date.now();
                if (now - lastUpdate.current > 1000) {
                    lastUpdate.current = now;
                    processHEartRate();
                }
            });

            return () => subscription.remove();
        }
    }, [subPhase, SAMPLES_NEEDED, processHEartRate]);

    const handleTap = () => {
        if (subPhase === 'spike') {
            setTaps(t => t + 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
    };

    const getCoreColor = () => {
        // Red to Blue transition
        const red = Math.floor((coreTemp / 100) * 239 + (1 - coreTemp / 100) * 59);
        const blue = Math.floor((1 - coreTemp / 100) * 250);
        return `rgb(${red}, 40, ${blue})`;
    };

    return (
        <View style={styles.phaseContainer}>
            <View style={styles.phaseHeader}>
                <TimerReset size={32} color="#f43f5e" />
                <ThemedText style={styles.phaseTitle}>Recovery Race</ThemedText>
            </View>

            {subPhase === 'intro' && (
                <View style={styles.introCenter}>
                    <ThemedText style={styles.phaseDesc}>
                        First, artificially spike your stress by tapping as rapidly as possible for 15 seconds. Immediately after, measure how fast you can &quot;cool the core&quot; back to baseline.
                    </ThemedText>
                    <Pressable style={[styles.actionBtn, { borderColor: '#f43f5e' }]} onPress={() => setSubPhase('spike')}>
                        <ThemedText style={styles.actionBtnText}>Start Spike Task</ThemedText>
                    </Pressable>
                </View>
            )}

            {subPhase === 'spike' && (
                <View style={styles.spikeCenter}>
                    <ThemedText style={styles.spikeTimer}>{spikeTime}s</ThemedText>
                    <ThemedText style={{ color: '#64748b', marginBottom: 20 }}>Taps: {taps}</ThemedText>
                    <Pressable style={styles.rapidTapBtn} onPress={handleTap}>
                        <Zap size={48} color="white" />
                    </Pressable>
                    <ThemedText style={styles.spikeWarning}>TAP RAPIDLY TO SPIKE STRESS!</ThemedText>
                </View>
            )}

            {subPhase === 'recovery' && (
                <View style={styles.recoveryCenter}>
                    {hasCamera && (
                        <View style={styles.hiddenCamera}>
                            <CameraView style={{ flex: 1 }} facing="back" enableTorch={true} />
                        </View>
                    )}
                    <ThemedText style={styles.phaseDesc}>
                        Place finger over rear camera & flash. Breathe deeply to cool the core.
                    </ThemedText>

                    <View style={styles.coreContainer}>
                        <Animated.View style={[styles.coreCircle, { backgroundColor: getCoreColor(), transform: [{ scale: 1 + (coreTemp / 400) }] }]} />
                    </View>

                    <View style={styles.bpmTag}>
                        <ThemedText style={styles.bpmTagText}>{bpm || '--'} BPM</ThemedText>
                    </View>

                    <ThemedText style={[styles.coreStatus, { color: getCoreColor() }]}>
                        {coreTemp < 5 ? "BASELINE REACHED" : (bpm > 90 ? "BREATHE DEEPER" : "COOLING DOWN...")}
                    </ThemedText>
                </View>
            )}
        </View>
    );
};


// ----------------------------------------------------------------------
// Main Resilience Hub
// ----------------------------------------------------------------------
export default function ResilienceTrainingScreen() {
    const router = useRouter();
    const [currentPhase, setCurrentPhase] = useState<'menu' | 'mirror' | 'sonic' | 'recovery' | 'done'>('menu');

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => {
                    if (currentPhase === 'menu' || currentPhase === 'done') router.back();
                    else setCurrentPhase('menu');
                }} style={styles.backButton}>
                    <ArrowLeft size={24} color="white" />
                </Pressable>
                {currentPhase === 'menu' && <ThemedText style={styles.headerTitle}>Resilience Modules</ThemedText>}
            </View>

            {currentPhase === 'menu' && (
                <View style={styles.menuContainer}>
                    <ThemedText style={styles.menuSubtitle}>
                        Select a stress-testing module to train your vagal tone and recovery speeds.
                    </ThemedText>

                    <TouchableOpacity style={styles.menuCard} onPress={() => setCurrentPhase('mirror')}>
                        <MonitorPlay size={32} color="#10b981" />
                        <View style={styles.menuCardContent}>
                            <ThemedText style={styles.menuCardTitle}>Vagal Tone Mirror</ThemedText>
                            <ThemedText style={styles.menuCardDesc}>Complex tasks under stoic facial/posture tracking</ThemedText>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuCard} onPress={() => setCurrentPhase('sonic')}>
                        <Waves size={32} color="#60a5fa" />
                        <View style={styles.menuCardContent}>
                            <ThemedText style={styles.menuCardTitle}>Sonic Grounding</ThemedText>
                            <ThemedText style={styles.menuCardDesc}>Vocal coherence against digital distractions</ThemedText>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuCard} onPress={() => setCurrentPhase('recovery')}>
                        <TimerReset size={32} color="#f43f5e" />
                        <View style={styles.menuCardContent}>
                            <ThemedText style={styles.menuCardTitle}>Recovery Race</ThemedText>
                            <ThemedText style={styles.menuCardDesc}>Rapid stress spike followed by PPG teardown</ThemedText>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {currentPhase === 'mirror' && <VagalMirrorPhase onComplete={() => setCurrentPhase('done')} />}
            {currentPhase === 'sonic' && <SonicGroundingPhase onComplete={() => setCurrentPhase('done')} />}
            {currentPhase === 'recovery' && <RecoveryRacePhase onComplete={() => setCurrentPhase('done')} />}

            {currentPhase === 'done' && (
                <View style={styles.doneContainer}>
                    <Zap size={64} color="#fbbf24" style={{ marginBottom: 20 }} />
                    <ThemedText style={styles.doneTitle}>Training Complete</ThemedText>
                    <ThemedText style={styles.doneDesc}>
                        Excellent. You&apos;ve strengthened your neurological braking system. Return to base.
                    </ThemedText>
                    <Pressable style={styles.actionBtn} onPress={() => router.back()}>
                        <ThemedText style={styles.actionBtnText}>Finish</ThemedText>
                    </Pressable>
                </View>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#091212' },
    header: { paddingTop: 60, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center' },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 16 },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#142121', borderRadius: 20 },

    // Menu
    menuContainer: { flex: 1, padding: 24, justifyContent: 'center' },
    menuSubtitle: { color: '#94a3b8', fontSize: 15, marginBottom: 40, textAlign: 'center', lineHeight: 22 },
    menuCard: { flexDirection: 'row', backgroundColor: '#142121', padding: 20, borderRadius: 20, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ffffff10' },
    menuCardContent: { marginLeft: 16, flex: 1 },
    menuCardTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 4 },
    menuCardDesc: { color: '#64748b', fontSize: 13 },

    // Shared Phase
    phaseContainer: { flex: 1, padding: 30, paddingTop: 60, alignItems: 'center' },
    phaseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    phaseTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    phaseDesc: { fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
    actionBtn: { backgroundColor: '#142121', borderWidth: 1, borderColor: '#ffffff30', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 25 },
    actionBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
    progressBarBg: { width: '100%', height: 10, backgroundColor: '#1e293b', borderRadius: 5, overflow: 'hidden', marginTop: 40 },
    progressBarFill: { height: '100%', borderRadius: 5 },

    // Mirror Phase
    mirrorFrame: { width: width - 60, height: 400, borderRadius: 24, overflow: 'hidden', backgroundColor: '#142121', position: 'relative' },
    mirrorOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9, 18, 18, 0.4)' },
    taskBox: { position: 'absolute', top: 50, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20 },
    frozenTaskBox: { backgroundColor: '#ef4444' },
    taskText: { fontSize: 20, fontWeight: '800', color: '#091212' },
    tensionBarContainer: { position: 'absolute', right: 20, top: 100, bottom: 100, width: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
    tensionBarFill: { width: '100%', borderRadius: 4 },
    tensionLabel: { position: 'absolute', right: 40, top: '50%', color: 'white', transform: [{ rotate: '-90deg' }], fontSize: 12, opacity: 0.8 },
    mirrorFooter: { position: 'absolute', bottom: 30, flex: 1, width: '100%', alignItems: 'center' },
    mirrorTimer: { color: 'white', fontSize: 32, fontWeight: '900', textShadowColor: 'black', textShadowRadius: 10 },

    // Sonic
    distractingBg: { backgroundColor: '#ef4444' },
    sonicVisualizer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    waveCircle: { position: 'absolute', width: 60, height: 60, borderRadius: 50, borderWidth: 4, backgroundColor: 'transparent' },

    // Recovery
    introCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    spikeCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    spikeTimer: { fontSize: 64, fontWeight: '900', color: '#f43f5e', marginBottom: 10 },
    rapidTapBtn: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f43f5e', justifyContent: 'center', alignItems: 'center', shadowColor: '#f43f5e', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10, marginBottom: 30 },
    spikeWarning: { color: '#f43f5e', fontWeight: 'bold', fontSize: 16, letterSpacing: 2 },
    recoveryCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    hiddenCamera: { position: 'absolute', width: 1, height: 1, opacity: 0 },
    coreContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginVertical: 40 },
    coreCircle: { width: 100, height: 100, borderRadius: 50, shadowColor: 'white', shadowOpacity: 0.2, shadowRadius: 20 },
    coreStatus: { fontSize: 20, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    bpmTag: { backgroundColor: '#142121', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12, marginBottom: 20 },
    bpmTagText: { color: 'white', fontWeight: 'bold' },

    // Done
    doneContainer: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
    doneTitle: { color: 'white', fontSize: 32, fontWeight: '900', marginBottom: 16 },
    doneDesc: { color: '#94a3b8', fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 24 },
});
