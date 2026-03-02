import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, PanResponder, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ArrowLeft, Shield, Mic, Activity, Trash2, CheckCircle2, AlertTriangle, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const STRESS_TYPES = [
    { id: 1, text: 'Work Pressure', color: '#f87171' },
    { id: 2, text: 'Self Doubt', color: '#fbbf24' },
    { id: 3, text: 'Social Anxiety', color: '#a78bfa' },
    { id: 4, text: 'Uncertainty', color: '#13ecec' },
    { id: 5, text: 'Burnout', color: '#fb7185' },
];

export default function ResilienceScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'sorting' | 'humming' | 'stress'>('sorting');

    // Humming State
    const [isRecording, setIsRecording] = useState(false);
    const [humLevel, setHumLevel] = useState(0);
    const recordingRef = useRef<Audio.Recording | null>(null);

    // Sorting Game State
    const [currentStress, setCurrentStress] = useState(STRESS_TYPES[0]);
    const pan = useRef(new Animated.ValueXY()).current;
    const [sortedCount, setSortedCount] = useState(0);

    // Stress Test State
    const [stressActive, setStressActive] = useState(false);
    const flashAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            await Audio.requestPermissionsAsync();
        })();
    }, []);

    // --- Humming Logic ---
    const startHumming = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.LOW_QUALITY
            );
            recordingRef.current = recording;
            setIsRecording(true);

            recording.setOnRecordingStatusUpdate((status) => {
                if (status.metering !== undefined) {
                    // Normalize metering (-160 to 0) to 0-100
                    const level = Math.max(0, (status.metering + 160) / 1.6);
                    setHumLevel(level);
                    if (level > 70) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
            });
            await recording.setProgressUpdateInterval(100);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopHumming = async () => {
        setIsRecording(false);
        await recordingRef.current?.stopAndUnloadAsync();
        recordingRef.current = null;
        setHumLevel(0);
    };

    // --- Sorting Game Logic ---
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
            onPanResponderRelease: (e, gesture) => {
                if (gesture.dx > 120) {
                    // Action (Right)
                    completeSort('Action');
                } else if (gesture.dx < -120) {
                    // Acceptance (Left)
                    completeSort('Acceptance');
                } else {
                    Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
                }
            },
        })
    ).current;

    const completeSort = (type: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSortedCount(c => c + 1);
        Animated.timing(pan, {
            toValue: { x: type === 'Action' ? 500 : -500, y: 0 },
            duration: 200,
            useNativeDriver: false,
        }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            setCurrentStress(STRESS_TYPES[Math.floor(Math.random() * STRESS_TYPES.length)]);
        });
    };

    // --- Stress Test Logic ---
    const toggleStress = () => {
        if (!stressActive) {
            setStressActive(true);
            Animated.loop(
                Animated.sequence([
                    Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                    Animated.timing(flashAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        } else {
            setStressActive(false);
            flashAnim.setValue(0);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>Resilience Training</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.tabContainer}>
                <TabItem label="Sorting" active={activeTab === 'sorting'} onPress={() => setActiveTab('sorting')} />
                <TabItem label="Humming" active={activeTab === 'humming'} onPress={() => setActiveTab('humming')} />
                <TabItem label="Stress" active={activeTab === 'stress'} onPress={() => setActiveTab('stress')} />
            </View>

            <View style={styles.content}>
                {activeTab === 'sorting' && (
                    <View style={styles.gameArea}>
                        <ThemedText style={styles.instructions}>Flick the stressor into the right bin.</ThemedText>

                        <View style={styles.sortingContent}>
                            <View style={[styles.bin, styles.leftBin]}>
                                <CheckCircle2 color="#13ecec" size={32} />
                                <ThemedText style={styles.binText}>Accept</ThemedText>
                            </View>

                            <Animated.View
                                {...panResponder.panHandlers}
                                style={[styles.stressCard, { transform: pan.getTranslateTransform(), backgroundColor: currentStress.color }]}
                            >
                                <ThemedText style={styles.stressText}>{currentStress.text}</ThemedText>
                                <Shield color="white" size={40} opacity={0.3} />
                            </Animated.View>

                            <View style={[styles.bin, styles.rightBin]}>
                                <Zap color="#fbbf24" size={32} />
                                <ThemedText style={styles.binText}>Action</ThemedText>
                            </View>
                        </View>

                        <View style={styles.scoreBoard}>
                            <ThemedText style={styles.scoreLabel}>Emotions Regulated</ThemedText>
                            <ThemedText style={styles.scoreValue}>{sortedCount}</ThemedText>
                        </View>
                    </View>
                )}

                {activeTab === 'humming' && (
                    <View style={styles.centerArea}>
                        <View style={styles.hummingCircle}>
                            <LinearGradient
                                colors={['#13ecec30', '#13ecec00']}
                                style={[styles.humRipple, { width: 100 + humLevel * 2, height: 100 + humLevel * 2, borderRadius: (100 + humLevel * 2) / 2 }]}
                            />
                            <TouchableOpacity
                                style={[styles.micButton, isRecording && styles.micButtonActive]}
                                onPress={isRecording ? stopHumming : startHumming}
                            >
                                <Mic color={isRecording ? "black" : "white"} size={40} />
                            </TouchableOpacity>
                        </View>
                        <ThemedText style={styles.humInstructions}>
                            {isRecording ? "Maintain a steady low pitch hum..." : "Press to start Vagus Nerve Humming"}
                        </ThemedText>
                        <View style={styles.frequencyBar}>
                            <View style={[styles.frequencyFill, { width: `${humLevel}%` }]} />
                        </View>
                    </View>
                )}

                {activeTab === 'stress' && (
                    <View style={styles.centerArea}>
                        <Animated.View style={[styles.stressFlash, { opacity: flashAnim }]} />
                        <Activity size={80} color={stressActive ? "#f87171" : "#13ecec"} />
                        <ThemedText style={styles.stressInstructions}>
                            {stressActive ? "Keep breathing steady despite the distractions..." : "Test your resilience against digital stress factors."}
                        </ThemedText>
                        <TouchableOpacity style={[styles.mainBtn, stressActive && styles.stopBtn]} onPress={toggleStress}>
                            <ThemedText style={styles.btnText}>{stressActive ? "Stop Stress Test" : "Start Simulation"}</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ThemedView>
    );
}

const TabItem = ({ label, active, onPress }) => (
    <TouchableOpacity style={[styles.tab, active && styles.activeTab]} onPress={onPress}>
        <ThemedText style={[styles.tabText, active && styles.activeTabText]}>{label}</ThemedText>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#091212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#142121',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 4,
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    activeTab: { backgroundColor: '#13ecec' },
    tabText: { color: '#64748b', fontWeight: '600', fontSize: 14 },
    activeTabText: { color: 'black' },
    content: { flex: 1, padding: 24 },
    centerArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    gameArea: { flex: 1 },
    instructions: { color: '#64748b', textAlign: 'center', marginBottom: 40 },
    sortingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 300,
    },
    bin: { alignItems: 'center', gap: 8, opacity: 1 },
    binText: { fontSize: 12, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
    stressCard: {
        width: 140,
        height: 180,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    stressText: { color: 'black', fontWeight: '900', fontSize: 18, textAlign: 'center', marginBottom: 20 },
    scoreBoard: { alignItems: 'center', marginTop: 60 },
    scoreLabel: { color: '#64748b', fontSize: 14 },
    scoreValue: { color: 'white', fontSize: 40, fontWeight: '800' },
    hummingCircle: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center' },
    humRipple: { position: 'absolute', backgroundColor: '#13ecec' },
    micButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#142121', justifyContent: 'center', alignItems: 'center' },
    micButtonActive: { backgroundColor: '#13ecec' },
    humInstructions: { color: '#64748b', marginTop: 60, textAlign: 'center', width: '80%' },
    frequencyBar: { width: '100%', height: 4, backgroundColor: '#142121', marginTop: 20, borderRadius: 2 },
    frequencyFill: { height: '100%', backgroundColor: '#13ecec' },
    stressFlash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#f8717130', borderRadius: 20 },
    stressInstructions: { color: '#64748b', marginTop: 40, textAlign: 'center', width: '80%', marginBottom: 40 },
    mainBtn: { backgroundColor: '#13ecec', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 30 },
    stopBtn: { backgroundColor: '#f87171' },
    btnText: { color: 'black', fontWeight: '700', fontSize: 16 }
});
