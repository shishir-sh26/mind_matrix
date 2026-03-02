import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, Pressable } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ArrowLeft, Brain, Eye, Target, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const BALL_SIZE = 40;
const STRING_WIDTH = width * 0.85;
const SAFE_ZONE_WIDTH = 80;

export default function FocusTrainingScreen() {
    const router = useRouter();
    const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
    const ballX = useRef(new Animated.Value(0)).current;
    const currentX = useRef(0);
    const [eyesWandering, setEyesWandering] = useState(false);
    const [score, setScore] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isInZone, setIsInZone] = useState(false);

    useEffect(() => {
        const sub = ballX.addListener(({ value }) => {
            currentX.current = value;
            const inZone = Math.abs(value) < SAFE_ZONE_WIDTH / 2;
            setIsInZone(inZone);
        });

        const subscription = Gyroscope.addListener(data => {
            setGyroData(data);
        });
        Gyroscope.setUpdateInterval(16);

        return () => {
            ballX.removeListener(sub);
            subscription.remove();
        };
    }, []);

    // Game Loop
    useEffect(() => {
        if (!isActive) return;

        let frameId: number;
        const loop = () => {
            // Game Physics
            const moveX = gyroData.y * 25;
            const nextX = Math.max(-STRING_WIDTH / 2 + BALL_SIZE / 2, Math.min(STRING_WIDTH / 2 - BALL_SIZE / 2, currentX.current + moveX));

            ballX.setValue(nextX);

            if (Math.abs(currentX.current) < SAFE_ZONE_WIDTH / 2) {
                setScore(s => s + 1);
                setEyesWandering(false);
            } else {
                // Orb is sideways (out of zone) - Trigger vibration
                setEyesWandering(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }

            frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [isActive, gyroData]);

    const startGame = () => {
        setIsActive(true);
        setScore(0);
        ballX.setValue(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>Focus Flow Game</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.main}>
                <View style={styles.statsContainer}>
                    <View style={styles.scoreItem}>
                        <Brain size={24} color="#13ecec" />
                        <ThemedText style={styles.scoreText}>{Math.floor(score / 60)}s</ThemedText>
                        <ThemedText style={styles.statLabel}>Flow Time</ThemedText>
                    </View>
                    <View style={styles.scoreItem}>
                        <Target size={24} color={isInZone ? "#13ecec" : "#64748b"} />
                        <ThemedText style={[styles.scoreText, !isInZone && { color: '#64748b' }]}>
                            {Math.abs(Math.round(currentX.current))}
                        </ThemedText>
                        <ThemedText style={styles.statLabel}>Deviation</ThemedText>
                    </View>
                </View>

                <View style={styles.gameArea}>
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, eyesWandering && styles.statusBadgeWarning]}>
                        {eyesWandering ? <AlertTriangle size={18} color="#f87171" /> : <Eye size={18} color="#13ecec" />}
                        <ThemedText style={[styles.statusBadgeText, eyesWandering && { color: '#f87171' }]}>
                            {eyesWandering ? "FOCUS ON SCREEN!" : "Steady Focus"}
                        </ThemedText>
                    </View>

                    {/* Balance Game */}
                    <View style={styles.stageContainer}>
                        <View style={[styles.safeZone, isInZone && styles.safeZoneActive]} />
                        <View style={styles.mainString} />
                        <Animated.View style={[
                            styles.ball,
                            { transform: [{ translateX: ballX }] },
                            isInZone && styles.ballInZone
                        ]}>
                            <View style={styles.ballGlow} />
                        </Animated.View>
                    </View>

                    <ThemedText style={styles.gameInstruction}>
                        Tilt phone horizontally to keep the orb in the glowing center.
                    </ThemedText>
                </View>

                <View style={styles.footer}>
                    {!isActive ? (
                        <Pressable style={styles.mainBtn} onPress={startGame}>
                            <ThemedText style={styles.mainBtnText}>Start Training</ThemedText>
                        </Pressable>
                    ) : (
                        <Pressable style={styles.stopBtn} onPress={() => setIsActive(false)}>
                            <ThemedText style={styles.stopBtnText}>Finish Session</ThemedText>
                        </Pressable>
                    )}
                </View>
            </View>
        </ThemedView>
    );
}

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
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    main: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 30,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    scoreItem: {
        backgroundColor: '#142121',
        padding: 16,
        borderRadius: 20,
        width: '48%',
        alignItems: 'center',
        gap: 4,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#13ecec',
    },
    statLabel: {
        color: '#64748b',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        backgroundColor: '#142121',
        marginBottom: 60,
        borderWidth: 1,
        borderColor: '#13ecec20',
    },
    statusBadgeWarning: {
        backgroundColor: '#2d1414',
        borderColor: '#f8717140',
    },
    statusBadgeText: {
        color: '#13ecec',
        fontSize: 13,
        fontWeight: '700',
    },
    stageContainer: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainString: {
        width: STRING_WIDTH,
        height: 2,
        backgroundColor: '#1d3333',
        position: 'absolute',
    },
    safeZone: {
        width: SAFE_ZONE_WIDTH,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#13ecec10',
        borderWidth: 1,
        borderColor: '#13ecec30',
        position: 'absolute',
    },
    safeZoneActive: {
        backgroundColor: '#13ecec20',
        borderColor: '#13ecec80',
        shadowColor: '#13ecec',
        shadowRadius: 20,
        elevation: 10,
    },
    ball: {
        width: BALL_SIZE,
        height: BALL_SIZE,
        borderRadius: BALL_SIZE / 2,
        backgroundColor: '#1d3333',
        borderWidth: 2,
        borderColor: '#64748b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ballInZone: {
        borderColor: '#13ecec',
        backgroundColor: '#13ecec',
    },
    ballGlow: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'white',
        opacity: 0.5,
    },
    gameInstruction: {
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 40,
        width: '80%',
        lineHeight: 20,
    },
    footer: {
        paddingBottom: 60,
    },
    mainBtn: {
        backgroundColor: '#13ecec',
        paddingVertical: 20,
        borderRadius: 30,
        alignItems: 'center',
    },
    mainBtnText: {
        color: 'black',
        fontSize: 18,
        fontWeight: '800',
    },
    stopBtn: {
        paddingVertical: 20,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#ffffff20',
        alignItems: 'center',
    },
    stopBtnText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '600',
    }
});
