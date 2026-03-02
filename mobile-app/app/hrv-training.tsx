import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ArrowLeft, Heart, Zap, Waves } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HRVTrainingScreen() {
    const router = useRouter();
    const [hasPermission, setHasPermission] = useState(false);
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [bpm, setBpm] = useState(0);
    const [hrvStatus, setHrvStatus] = useState('Wait...');

    // Animation refs
    const flowerScale = useRef(new Animated.Value(1)).current;
    const pulseOpacity = useRef(new Animated.Value(0)).current;
    const breathProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    // Flower blooming / breathing animation
    useEffect(() => {
        if (!isMeasuring) return;

        const breathCycle = Animated.loop(
            Animated.sequence([
                Animated.timing(breathProgress, {
                    toValue: 1,
                    duration: 4000,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(breathProgress, {
                    toValue: 0,
                    duration: 4000,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        );

        breathCycle.start();

        // Simulate heart rate calculation
        const interval = setInterval(() => {
            const randomBpm = Math.floor(Math.random() * (75 - 65 + 1) + 65);
            setBpm(randomBpm);
            setHrvStatus(randomBpm < 70 ? 'Coherent' : 'Adjusting');

            // Flash pulse
            Animated.sequence([
                Animated.timing(pulseOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
                Animated.timing(pulseOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start();

        }, 1000);

        return () => {
            breathCycle.stop();
            clearInterval(interval);
        };
    }, [isMeasuring]);

    const toggleMeasurement = () => {
        setIsMeasuring(!isMeasuring);
        if (!isMeasuring) {
            setBpm(0);
            setHrvStatus('Analyzing...');
        }
    };

    const interpolatedScale = breathProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2.5],
    });

    const interpolatedOpacity = breathProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
    });

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>HRV Bio-feedback</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.main}>
                <View style={styles.infoBox}>
                    <View style={styles.stat}>
                        <Heart color="#f87171" size={20} fill={isMeasuring ? "#f87171" : "transparent"} />
                        <ThemedText style={styles.statValue}>{isMeasuring ? bpm : '--'}</ThemedText>
                        <ThemedText style={styles.statLabel}>BPM</ThemedText>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.stat}>
                        <Waves color="#13ecec" size={20} />
                        <ThemedText style={styles.statValue}>{hrvStatus}</ThemedText>
                        <ThemedText style={styles.statLabel}>State</ThemedText>
                    </View>
                </View>

                <View style={styles.visualizerContainer}>
                    <Animated.View style={[
                        styles.flowerCore,
                        { transform: [{ scale: interpolatedScale }], opacity: interpolatedOpacity }
                    ]} />

                    <Animated.View style={[
                        styles.flowerPetal,
                        { transform: [{ scale: interpolatedScale }, { rotate: '45deg' }], opacity: interpolatedOpacity }
                    ]} />

                    <View style={styles.instructionBox}>
                        <ThemedText style={styles.instructionText}>
                            {isMeasuring ? "Inhale slowly as the circle expands" : "Place finger over rear camera & flash"}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.bottomControls}>
                    <TouchableOpacity
                        style={[styles.measureButton, isMeasuring && styles.measuringButton]}
                        onPress={toggleMeasurement}
                    >
                        {isMeasuring ? (
                            <Zap color="black" size={24} />
                        ) : (
                            <Heart color="white" size={24} />
                        )}
                        <ThemedText style={[styles.measureButtonText, isMeasuring && { color: 'black' }]}>
                            {isMeasuring ? "Complete Session" : "Start Bio-feedback"}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            {/* PPG Sensor Simulation */}
            {hasPermission && (
                <View style={styles.sensorContainer}>
                    <CameraView
                        style={styles.sensorCamera}
                        facing="back"
                        enableTorch={isMeasuring}
                    />
                    <Animated.View style={[styles.pulseIndicator, { opacity: pulseOpacity }]} />
                </View>
            )}
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
        marginBottom: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
    },
    main: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingBottom: 60,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#142121',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    stat: {
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
    },
    statLabel: {
        color: '#64748b',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: '#ffffff10',
    },
    visualizerContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flowerCore: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#13ecec',
        position: 'absolute',
    },
    flowerPetal: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: '#13ecec',
        position: 'absolute',
    },
    instructionBox: {
        position: 'absolute',
        bottom: 40,
    },
    instructionText: {
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center',
        width: width * 0.7,
    },
    bottomControls: {
        width: '100%',
    },
    measureButton: {
        flexDirection: 'row',
        backgroundColor: '#142121',
        borderWidth: 1,
        borderColor: '#f87171',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    measuringButton: {
        backgroundColor: '#13ecec',
        borderColor: '#13ecec',
    },
    measureButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    sensorContainer: {
        position: 'absolute',
        top: 60,
        right: 24,
        width: 1, // Hidden but active
        height: 1,
        overflow: 'hidden',
    },
    sensorCamera: {
        flex: 1,
    },
    pulseIndicator: {
        position: 'absolute',
        top: 100,
        left: 24,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#f87171',
    }
});
