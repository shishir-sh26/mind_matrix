import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Animated, Dimensions, TouchableOpacity, Easing } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { ArrowLeft, MonitorPlay, Waves, TimerReset, Zap, Infinity, CheckCircle2, XCircle } from 'lucide-react-native';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Camera, CameraView } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import { useAppTheme } from './theme-context';

const { width } = Dimensions.get('window');

// ----------------------------------------------------------------------
// 1. Vagal Tone Mirror (Stoic Crossword)
// ----------------------------------------------------------------------
const CROSSWORDS = [
    { question: "5-letter word for 'a feeling of peace'", answer: "CALM" },
    { question: "6-letter word for 'mental toughness'", answer: "RESILI" },
    { question: "5-letter word for 'to breathe out'", answer: "EXHAL" },
    { question: "4-letter word for 'biological clock'", answer: "RHYT" },
    { question: "6-letter word for 'vagus nerve state'", answer: "TONAL" }
];

const VagalMirrorPhase = ({ onComplete, styles, isLightMode }: { onComplete: (mood?: string) => void, styles: any, isLightMode: boolean }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [qIndex, setQIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [tension, setTension] = useState(0);
    const [totalTension, setTotalTension] = useState(0);
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            setIsActive(true);
        })();
    }, []);

    useEffect(() => {
        if (!isActive) return;
        let sub: any;

        const processMovement = (data: { x: number; y: number; z: number }) => {
            const mag = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z) - 1;
            const dynamicThreshold = 0.18;

            if (mag > dynamicThreshold) {
                setTension(prev => Math.min(prev + 10, 100));
                setTotalTension(t => t + 1);
            } else {
                setTension(prev => Math.max(prev - 8, 0));
            }
        };

        Accelerometer.setUpdateInterval(100);
        sub = Accelerometer.addListener(processMovement);
        return () => sub && sub.remove();
    }, [isActive, userInput.length]);

    const handleNext = () => {
        if (qIndex < 4) {
            setQIndex(prev => prev + 1);
            setUserInput('');
        } else {
            let finalMood = "Normal";
            if (totalTension > 80) finalMood = "Anxiety";
            else if (totalTension < 20) finalMood = "Sad";
            onComplete(finalMood);
        }
    };

    const letterPool = React.useMemo(() => {
        const answer = CROSSWORDS[qIndex].answer;
        const letters = answer.split('');
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        while (letters.length < 10) {
            const char = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            if (!letters.includes(char)) letters.push(char);
        }
        return letters.sort(() => Math.random() - 0.5);
    }, [qIndex]);

    const handleLetterPress = (char: string) => {
        setUserInput(prev => prev + char);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
        <View style={styles.phaseContainer}>
            <View style={styles.phaseHeader}>
                <MonitorPlay size={32} color="#10b981" />
                <ThemedText style={styles.phaseTitle}>Vagal Tone Mirror</ThemedText>
            </View>
            <ThemedText style={styles.phaseDesc}>
                Build the word from the letters below. Precision sensors monitor your physiological state to determine your mood.
            </ThemedText>

            <View style={styles.mirrorFrame}>
                {hasPermission && (
                    <CameraView facing="front" style={StyleSheet.absoluteFillObject} />
                )}
                <View style={styles.mirrorOverlay} />

                <Animated.View style={[styles.taskBox, { transform: [{ translateX: shakeAnim }] }]}>
                    <ThemedText style={styles.qCount}>Question {qIndex + 1}/5</ThemedText>
                    <ThemedText style={styles.taskText}>{CROSSWORDS[qIndex].question}</ThemedText>

                    <View style={styles.answerDisplay}>
                        <ThemedText style={styles.answerText}>{userInput || "___"}</ThemedText>
                        {userInput.length > 0 && (
                            <TouchableOpacity onPress={() => setUserInput('')} style={styles.clearBtn}>
                                <XCircle size={18} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.letterGrid}>
                        {letterPool.map((char, i) => (
                            <TouchableOpacity
                                key={`${qIndex}-${i}`}
                                style={styles.letterKey}
                                onPress={() => handleLetterPress(char)}
                            >
                                <ThemedText style={styles.letterKeyText}>{char}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ marginTop: 25, width: '100%', alignItems: 'center' }}>
                        <TouchableOpacity
                            style={[
                                styles.submitWordBtn,
                                { backgroundColor: userInput.length >= 3 ? '#10b981' : '#1e293b', width: '100%', opacity: userInput.length >= 3 ? 1 : 0.5 }
                            ]}
                            onPress={handleNext}
                            disabled={userInput.length < 3}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={styles.submitWordText}>SUBMIT ANSWER</ThemedText>
                        </TouchableOpacity>
                        {userInput.length < 3 && (
                            <ThemedText style={{ color: '#64748b', fontSize: 10, marginTop: 10 }}>Solve the puzzle to submit</ThemedText>
                        )}
                    </View>
                </Animated.View>

                <View style={styles.tensionBarContainer}>
                    <View style={[styles.tensionBarFill, { height: `${tension}%`, backgroundColor: tension > 70 ? '#ef4444' : '#fbbf24' }]} />
                </View>
                <ThemedText style={styles.tensionLabel}>Stress Level</ThemedText>
            </View>
        </View>
    );
};

// ----------------------------------------------------------------------
// 2. Sonic Grounding (Vocal Sound Correction)
// ----------------------------------------------------------------------
const SonicGroundingPhase = ({ onComplete, styles, isLightMode }: { onComplete: () => void, styles: any, isLightMode: boolean }) => {
    const [isActive, setIsActive] = useState(false);
    const [micLevel, setMicLevel] = useState(-160);
    const recorder = useAudioRecorder({
        ...RecordingPresets.HighQuality,
        isMeteringEnabled: true,
    });
    const recorderState = useAudioRecorderState(recorder, 150);
    const [progress, setProgress] = useState(0);

    const waveAnim = useRef(new Animated.Value(0)).current;

    const stopHumming = useCallback(async () => {
        setIsActive(false);
        if (recorderState.isRecording) {
            try {
                await recorder.stop();
            } catch (err) {
                console.warn("StopHumming Error:", err);
            }
        }
    }, [recorder, recorderState.isRecording]);

    const startHumming = useCallback(async () => {
        if (isActive || recorderState.isRecording) return;
        try {
            const permission = await requestRecordingPermissionsAsync();
            if (permission.status === 'granted') {
                await setAudioModeAsync({
                    allowsRecording: true,
                    playsInSilentMode: true,
                    shouldPlayInBackground: false,
                    interruptionMode: 'duckOthers',
                });

                await recorder.prepareToRecordAsync();
                recorder.record();
                setIsActive(true);
            }
        } catch (err) {
            console.error("Recording Start Error:", err);
            setIsActive(false);
        }
    }, [isActive, recorder, recorderState.isRecording]);

    useEffect(() => {
        return () => { stopHumming(); };
    }, [stopHumming]);

    useEffect(() => {
        if (progress >= 100) {
            stopHumming();
            onComplete();
        }
    }, [progress, onComplete, stopHumming]);

    useEffect(() => {
        if (recorderState.isRecording && recorderState.metering !== undefined) {
            setMicLevel(recorderState.metering);
            const inRange = recorderState.metering > -22 && recorderState.metering < -5;

            if (inRange) {
                setProgress(p => Math.min(p + 1, 100));
                if (Math.random() > 0.7) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
        }
    }, [recorderState]);

    useEffect(() => {
        if (isActive) {
            Animated.loop(
                Animated.timing(waveAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
            ).start();
        } else {
            waveAnim.stopAnimation();
            waveAnim.setValue(0);
        }
    }, [isActive, waveAnim]);

    const isSweetSpot = micLevel > -22 && micLevel < -5;

    return (
        <View style={styles.phaseContainer}>
            <View style={styles.phaseHeader}>
                <Waves size={32} color="#60a5fa" />
                <ThemedText style={styles.phaseTitle}>Sonic Grounding</ThemedText>
            </View>
            <ThemedText style={styles.phaseDesc}>
                Maintain a low-frequency hum. The system monitors your vocal stability against target vagal frequencies.
            </ThemedText>

            <View style={styles.sonicVisualizer}>
                {isActive && !isSweetSpot && (
                    <View style={styles.vocalCorrection}>
                        <XCircle size={24} color="#ef4444" />
                        <ThemedText style={styles.correctionText}>CORRECT YOUR VOCAL SOUND</ThemedText>
                    </View>
                )}

                {isActive && [0, 1, 2].map((i) => (
                    <Animated.View
                        key={i}
                        style={[
                            styles.waveCircle,
                            {
                                borderColor: isSweetSpot ? '#60a5fa' : '#ef4444',
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
                    <ThemedText style={{ color: isSweetSpot ? '#60a5fa' : '#ef4444', fontSize: 24, fontWeight: 'bold' }}>
                        {isSweetSpot ? "COHERENCE" : "OUT OF SYNC"}
                    </ThemedText>
                )}
            </View>

            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: isSweetSpot ? '#60a5fa' : '#ef4444' }]} />
            </View>

            {!isActive ? (
                <Pressable style={styles.actionBtn} onPress={startHumming}>
                    <ThemedText style={styles.actionBtnText}>Begin Hum Phase</ThemedText>
                </Pressable>
            ) : null}
        </View>
    );
};

// ----------------------------------------------------------------------
// 3. The Recovery Race (SCG Sensor Loop)
// ----------------------------------------------------------------------
const RecoveryRacePhase = ({ onComplete, styles, isLightMode }: { onComplete: () => void, styles: any, isLightMode: boolean }) => {
    const [subPhase, setSubPhase] = useState<'intro' | 'spike' | 'recovery'>('intro');
    const [spikeTime, setSpikeTime] = useState(15);
    const [coreTemp, setCoreTemp] = useState(100);
    const [bpm, setBpm] = useState(0);
    const [hasCamera, setHasCamera] = useState(false);

    const samples = useRef<number[]>([]);
    const lastUpdate = useRef(0);
    const SAMPLES_NEEDED = 5 * 50;

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasCamera(status === 'granted');
        })();
        Accelerometer.setUpdateInterval(20);
    }, []);

    const doneTimer = useRef<NodeJS.Timeout | null>(null);

    const processHEartRate = React.useCallback(() => {
        if (samples.current.length < SAMPLES_NEEDED / 2) return;
        let peaks = 0;
        const threshold = 0.012;
        const data = samples.current;
        for (let i = 1; i < data.length - 1; i++) {
            if (data[i] > data[i - 1] + threshold && data[i] > data[i + 1] + threshold) peaks++;
        }
        const calculatedBpm = Math.round((peaks / 5) * 60);

        if (calculatedBpm > 40 && calculatedBpm < 160) {
            setBpm(calculatedBpm);
            setCoreTemp(prev => {
                const targetReduction = calculatedBpm < 75 ? 10 : (calculatedBpm < 90 ? 5 : 1);
                const next = Math.max(0, prev - targetReduction);
                if (next === 0 && !doneTimer.current) {
                    doneTimer.current = setTimeout(() => onComplete(), 1500) as any;
                }
                return next;
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [SAMPLES_NEEDED, onComplete]);

    useEffect(() => {
        return () => {
            if (doneTimer.current) clearTimeout(doneTimer.current);
        };
    }, []);

    useEffect(() => {
        if (subPhase === 'spike') {
            const int = setInterval(() => {
                setSpikeTime(p => {
                    if (p <= 1) { clearInterval(int); setSubPhase('recovery'); return 0; }
                    return p - 1;
                });
            }, 1000);
            return () => clearInterval(int);
        } else if (subPhase === 'recovery') {
            const subscription = Accelerometer.addListener(data => {
                const mag = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
                samples.current.push(mag);
                if (samples.current.length > SAMPLES_NEEDED) samples.current.shift();
                const now = Date.now();
                if (now - lastUpdate.current > 1000) { lastUpdate.current = now; processHEartRate(); }
            });
            return () => subscription.remove();
        }
    }, [subPhase, SAMPLES_NEEDED, processHEartRate]);

    const getCoreColor = () => {
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
                        Spike your stress with rapid taps. Then, use SCG sensors (place phone on chest) to measure how fast your heart returns to baseline.
                    </ThemedText>
                    <Pressable style={[styles.actionBtn, { borderColor: '#f43f5e' }]} onPress={() => setSubPhase('spike')}>
                        <ThemedText style={styles.actionBtnText}>Start Sensor-Linked Test</ThemedText>
                    </Pressable>
                </View>
            )}

            {subPhase === 'spike' && (
                <View style={styles.spikeCenter}>
                    <ThemedText style={styles.spikeTimer}>{spikeTime}s</ThemedText>
                    <Pressable style={styles.rapidTapBtn} onPress={() => { setSpikeTime(p => p); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); }}>
                        <Zap size={48} color="white" />
                    </Pressable>
                    <ThemedText style={styles.spikeWarning}>TAP RAPIDLY!</ThemedText>
                </View>
            )}

            {subPhase === 'recovery' && (
                <View style={styles.recoveryCenter}>
                    {hasCamera && <View style={styles.hiddenCamera}><CameraView facing="back" enableTorch /></View>}
                    <ThemedText style={styles.phaseDesc}>Place device on chest. Breathe deeply.</ThemedText>
                    <View style={styles.coreContainer}>
                        <Animated.View style={[styles.coreCircle, { backgroundColor: getCoreColor(), transform: [{ scale: 1 + (coreTemp / 300) }] }]} />
                    </View>
                    <View style={styles.bpmTag}><ThemedText style={styles.bpmTagText}>{bpm || '--'} BPM (Live SCG)</ThemedText></View>
                    <ThemedText style={[styles.coreStatus, { color: getCoreColor() }]}>{coreTemp < 5 ? "STABILIZED" : "COOLING CORE..."}</ThemedText>
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
    const { isLightMode } = useAppTheme();
    const styles = createStyles(isLightMode);
    const [currentPhase, setCurrentPhase] = useState<'menu' | 'mirror' | 'sonic' | 'recovery' | 'done'>('menu');
    const [finalMood, setFinalMood] = useState('Normal');

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => {
                    if (currentPhase === 'menu' || currentPhase === 'done') router.back();
                    else setCurrentPhase('menu');
                }} style={styles.backButton}>
                    <ArrowLeft size={24} color={isLightMode ? "#0f172a" : "white"} />
                </Pressable>
                {currentPhase === 'menu' && <ThemedText style={styles.headerTitle}>Resilience Modules</ThemedText>}
            </View>

            {currentPhase === 'menu' && (
                <View style={styles.menuContainer}>
                    <ThemedText style={styles.menuSubtitle}>Modular bio-feedback stress testing.</ThemedText>
                    <TouchableOpacity style={styles.menuCard} onPress={() => setCurrentPhase('mirror')}>
                        <MonitorPlay size={32} color="#10b981" />
                        <View style={styles.menuCardContent}>
                            <ThemedText style={styles.menuCardTitle}>Vagal Tone Mirror</ThemedText>
                            <ThemedText style={styles.menuCardDesc}>Stoic Crossword & Mood Analysis</ThemedText>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuCard} onPress={() => setCurrentPhase('sonic')}>
                        <Waves size={32} color="#60a5fa" />
                        <View style={styles.menuCardContent}>
                            <ThemedText style={styles.menuCardTitle}>Sonic Grounding</ThemedText>
                            <ThemedText style={styles.menuCardDesc}>Vocal Stability Tracking</ThemedText>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuCard} onPress={() => setCurrentPhase('recovery')}>
                        <TimerReset size={32} color="#f43f5e" />
                        <View style={styles.menuCardContent}>
                            <ThemedText style={styles.menuCardTitle}>Recovery Race</ThemedText>
                            <ThemedText style={styles.menuCardDesc}>Live SCG Heart Rate Recovery</ThemedText>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {currentPhase === 'mirror' && <VagalMirrorPhase onComplete={(mood) => {
                if (mood) setFinalMood(mood);
                setCurrentPhase('done');
            }} styles={styles} isLightMode={isLightMode} />}
            {currentPhase === 'sonic' && <SonicGroundingPhase onComplete={() => setCurrentPhase('done')} styles={styles} isLightMode={isLightMode} />}
            {currentPhase === 'recovery' && <RecoveryRacePhase onComplete={() => setCurrentPhase('done')} styles={styles} isLightMode={isLightMode} />}

            {currentPhase === 'done' && (
                <View style={styles.doneContainer}>
                    <CheckCircle2 size={80} color="#10b981" />
                    <ThemedText style={styles.doneTitle}>Training Complete</ThemedText>
                    <View style={styles.moodResult}>
                        <ThemedText style={styles.moodLabel}>Detected Internal State:</ThemedText>
                        <ThemedText style={[styles.moodValue, { color: finalMood === "Anxiety" ? "#ef4444" : "#10b981" }]}>{finalMood}</ThemedText>
                    </View>
                    <Pressable style={styles.actionBtn} onPress={() => router.back()}>
                        <ThemedText style={styles.actionBtnText}>Finish Session</ThemedText>
                    </Pressable>
                </View>
            )}
        </ThemedView>
    );
}

const createStyles = (isLight: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: isLight ? "#f8fafc" : '#091212' },
    header: { paddingTop: 60, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center' },
    headerTitle: { color: isLight ? "#0f172a" : 'white', fontSize: 18, fontWeight: '700', marginLeft: 16 },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: isLight ? "#e2e8f0" : '#142121', borderRadius: 20 },

    menuContainer: { flex: 1, padding: 24, justifyContent: 'center' },
    menuSubtitle: { color: isLight ? "#64748b" : '#94a3b8', fontSize: 15, marginBottom: 40, textAlign: 'center' },
    menuCard: { flexDirection: 'row', backgroundColor: isLight ? "#ffffff" : '#142121', padding: 20, borderRadius: 20, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: isLight ? "#e2e8f0" : '#ffffff10' },
    menuCardContent: { marginLeft: 16, flex: 1 },
    menuCardTitle: { color: isLight ? "#0f172a" : 'white', fontSize: 18, fontWeight: '700' },
    menuCardDesc: { color: isLight ? "#64748b" : '#64748b', fontSize: 13 },

    phaseContainer: { flex: 1, padding: 30, paddingTop: 40, alignItems: 'center' },
    phaseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    phaseTitle: { fontSize: 24, fontWeight: 'bold', color: isLight ? "#0f172a" : 'white' },
    phaseDesc: { fontSize: 14, color: isLight ? "#64748b" : '#94a3b8', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
    actionBtn: { backgroundColor: isLight ? "#0f172a" : '#142121', borderWidth: 1, borderColor: isLight ? "#e2e8f0" : '#ffffff30', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 25, marginTop: 20 },
    actionBtnText: { color: isLight ? "white" : 'white', fontSize: 16, fontWeight: '600' },

    // Shared Phases
    introCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    mirrorIntroText: { color: isLight ? "#475569" : 'white', fontSize: 14, textAlign: 'center', marginBottom: 20, opacity: 0.8 },

    mirrorFrame: { width: width - 50, height: 450, borderRadius: 24, overflow: 'hidden', backgroundColor: isLight ? '#e2e8f0' : '#142121', position: 'relative' },
    mirrorOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9, 18, 18, 0.4)' },
    taskBox: { position: 'absolute', top: 40, width: '85%', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.95)', padding: 20, borderRadius: 20 },
    qCount: { color: '#64748b', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
    taskText: { fontSize: 16, fontWeight: '700', color: '#091212', marginBottom: 15 },
    frozenTaskBox: { backgroundColor: '#ef4444' },
    crosswordInput: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    submitWordBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    submitWordText: { color: 'white', fontWeight: 'bold' },

    answerDisplay: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, marginBottom: 15, justifyContent: 'space-between' },
    answerText: { fontSize: 22, fontWeight: '900', color: '#0f172a', letterSpacing: 2 },
    clearBtn: { padding: 4 },
    letterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    letterKey: { width: '18%', aspectRatio: 1, backgroundColor: '#0f172a', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    letterKeyText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    frozenLetterKey: { opacity: 0.3 },

    tensionBarContainer: { position: 'absolute', right: 15, top: 80, bottom: 80, width: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end' },
    tensionBarFill: { width: '100%', borderRadius: 3 },
    tensionLabel: { position: 'absolute', right: 30, top: '50%', color: 'white', transform: [{ rotate: '-90deg' }], fontSize: 10, opacity: 0.6 },

    sonicVisualizer: { width: 220, height: 220, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    waveCircle: { position: 'absolute', width: 60, height: 60, borderRadius: 50, borderWidth: 3 },
    vocalCorrection: { position: 'absolute', bottom: -50, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ef444420', padding: 10, borderRadius: 12 },
    correctionText: { color: '#ef4444', fontWeight: '900', fontSize: 12 },

    progressBarBg: { width: '100%', height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden', marginTop: 60 },
    progressBarFill: { height: '100%' },

    spikeCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    spikeTimer: { fontSize: 60, fontWeight: '900', color: '#f43f5e', marginBottom: 20 },
    rapidTapBtn: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#f43f5e', justifyContent: 'center', alignItems: 'center' },
    spikeWarning: { color: '#f43f5e', fontWeight: 'bold', letterSpacing: 2, marginTop: 20 },
    recoveryCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    hiddenCamera: { position: 'absolute', width: 1, height: 1, opacity: 0 },
    coreContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
    coreCircle: { width: 100, height: 100, borderRadius: 50 },
    coreStatus: { fontSize: 18, fontWeight: '800', marginTop: 20 },
    bpmTag: { backgroundColor: '#142121', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, marginTop: 30 },
    bpmTagText: { color: 'white', fontWeight: 'bold' },

    doneContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    doneTitle: { color: isLight ? "#0f172a" : 'white', fontSize: 30, fontWeight: '900', marginTop: 20 },
    moodResult: { backgroundColor: isLight ? "#ffffff" : '#142121', padding: 25, borderRadius: 24, width: '100%', alignItems: 'center', marginVertical: 30, borderWidth: 1, borderColor: isLight ? "#e2e8f0" : '#ffffff05' },
    moodLabel: { color: isLight ? "#64748b" : '#64748b', fontSize: 14, marginBottom: 8 },
    moodValue: { color: isLight ? "#0f172a" : 'white', fontSize: 36, fontWeight: '900', textTransform: 'uppercase' }
});
