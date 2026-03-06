import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Moon, Calendar, Clock, Activity, Zap, Footprints, Heart, List as ListIcon, TrendingUp } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAppTheme } from '../theme-context';

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'LIST' | 'TRENDS'>('LIST');
  const { isLightMode } = useAppTheme();

  const styles = createStyles(isLightMode);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('sleep_history');
      if (data) setHistory(JSON.parse(data));
    } catch (e) {
      console.error(e);
    }
  };

  const clearHistory = async () => {
    await AsyncStorage.removeItem('sleep_history');
    setHistory([]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <ThemedText type="title" style={styles.title}>Dashboard</ThemedText>
              <ThemedText style={styles.subtitle}>Unified tracking analytics.</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[styles.modeBtn, viewMode === 'LIST' && styles.modeBtnActive]}
                onPress={() => setViewMode('LIST')}
              >
                <ListIcon size={20} color={viewMode === 'LIST' ? (isLightMode ? "#0284c7" : "black") : "#64748b"} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, viewMode === 'TRENDS' && styles.modeBtnActive]}
                onPress={() => setViewMode('TRENDS')}
              >
                <TrendingUp size={20} color={viewMode === 'TRENDS' ? (isLightMode ? "#0284c7" : "black") : "#64748b"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {viewMode === 'TRENDS' ? (
          <Animated.View entering={FadeInUp} style={styles.trendContainer}>
            {/* Step Activity Graph */}
            <View style={styles.graphCard}>
              <View style={styles.graphHeader}>
                <Footprints size={18} color="#13ecec" />
                <ThemedText style={styles.graphTitle}>Step Performance (Latest Logs)</ThemedText>
              </View>
              <View style={styles.chartArea}>
                {history.filter(i => i.type === "Steps").slice(0, 5).reverse().map((item, idx) => {
                  const steps = parseInt(item.finalStatus) || 0;
                  const height = Math.min(100, (steps / 10000) * 100);
                  return (
                    <View key={idx} style={styles.barContainer}>
                      <ThemedText style={styles.barValue}>{steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps}</ThemedText>
                      <View style={[styles.bar, { height: `${height}%` }]} />
                      <ThemedText style={styles.barLabel}>{item.date.split('/')[0]}/{item.date.split('/')[1]}</ThemedText>
                    </View>
                  );
                })}
                {history.filter(i => i.type === "Steps").length === 0 && (
                  <ThemedText style={styles.emptyGraphText}>No Step Data for Trends</ThemedText>
                )}
              </View>
            </View>

            {/* Heart Rate Graph */}
            <View style={[styles.graphCard, { marginTop: 16 }]}>
              <View style={styles.graphHeader}>
                <Heart size={18} color="#f87171" />
                <ThemedText style={styles.graphTitle}>Heart Rate Intensity (bpm)</ThemedText>
              </View>
              <View style={styles.chartArea}>
                {history.filter(i => i.type === "Steps").slice(0, 5).reverse().map((item, idx) => {
                  const hr = parseInt(item.lightResult) || 72;
                  const height = Math.min(100, (hr / 150) * 100);
                  return (
                    <View key={idx} style={styles.barContainer}>
                      <ThemedText style={styles.barValue}>{hr}</ThemedText>
                      <View style={[styles.bar, { height: `${height}%`, backgroundColor: '#f87171' }]} />
                      <ThemedText style={styles.barLabel}>{item.date.split('/')[1]}/{item.date.split('/')[2]?.slice(-2)}</ThemedText>
                    </View>
                  );
                })}
                {history.filter(i => i.type === "Steps").length === 0 && (
                  <ThemedText style={styles.emptyGraphText}>No HRV Data for Trends</ThemedText>
                )}
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp} style={styles.list}>
            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Moon size={48} color={isLightMode ? "#cbd5e1" : "#1e293b"} />
                <ThemedText style={styles.emptyText}>No sleep cycles recorded yet.</ThemedText>
              </View>
            ) : (
              history.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.itemHeader}>
                    <View style={[styles.typeBadge, item.type === "Steps" && { backgroundColor: isLightMode ? '#0284c715' : '#13ecec10' }]}>
                      {item.type === "Steps" ? <Footprints size={12} color={isLightMode ? "#0284c7" : "#13ecec"} /> : <Moon size={12} color={isLightMode ? "#7c3aed" : "#a78bfa"} />}
                      <ThemedText style={[styles.typeText, item.type === "Steps" && { color: isLightMode ? "#0284c7" : '#13ecec' }]}>{item.type}</ThemedText>
                    </View>
                    <View style={styles.dateInfo}>
                      <Calendar size={12} color="#64748b" />
                      <ThemedText style={styles.dateText}>{item.date}</ThemedText>
                    </View>
                  </View>

                  <View style={styles.scheduleRow}>
                    <Clock size={16} color="#94a3b8" />
                    <ThemedText style={styles.scheduleText}>{item.schedule}</ThemedText>
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Activity size={12} color={isLightMode ? "#475569" : "#64748b"} />
                      <ThemedText style={styles.statLabel}>{item.type === "Steps" ? "TOTAL STEPS" : "PACING"}</ThemedText>
                      <ThemedText style={styles.statValue} numberOfLines={1}>{item.finalStatus}</ThemedText>
                    </View>
                    <View style={styles.statBox}>
                      {item.type === "Steps" ? <Heart size={12} color="#f87171" /> : <Zap size={12} color={isLightMode ? "#d97706" : "#64748b"} />}
                      <ThemedText style={styles.statLabel}>{item.type === "Steps" ? "HEART RATE" : "LIGHT"}</ThemedText>
                      <ThemedText style={styles.statValue}>{item.lightResult}</ThemedText>
                    </View>
                  </View>
                </View>
              ))
            )}
          </Animated.View>
        )}

        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory} style={styles.clearFooterBtn}>
            <Zap size={14} color="#ef4444" />
            <ThemedText style={styles.clearFooterText}>Reset Registry History</ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const createStyles = (isLight: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isLight ? '#f8fafc' : '#091212',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: isLight ? '#0f172a' : 'white',
  },
  subtitle: {
    color: isLight ? '#475569' : '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  modeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: isLight ? '#ffffff' : '#ffffff05',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isLight ? '#e2e8f0' : '#ffffff10',
  },
  modeBtnActive: {
    backgroundColor: '#13ecec',
    borderColor: '#13ecec',
  },
  trendContainer: {
    marginBottom: 30,
  },
  graphCard: {
    backgroundColor: isLight ? '#ffffff' : '#142121',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: isLight ? '#e2e8f0' : '#ffffff05',
  },
  graphHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  graphTitle: {
    color: isLight ? "#0f172a" : 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  chartArea: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    gap: 12,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    width: '100%',
    backgroundColor: '#13ecec',
    borderRadius: 6,
    opacity: 0.8,
  },
  barValue: {
    color: isLight ? "#0f172a" : 'white',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: -4,
  },
  barLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '700',
  },
  emptyGraphText: {
    color: isLight ? "#64748b" : '#334155',
    textAlign: 'center',
    width: '100%',
    marginTop: 40,
  },
  clearFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    padding: 16,
  },
  clearFooterText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    color: isLight ? "#64748b" : '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
  historyItem: {
    backgroundColor: isLight ? "#ffffff" : '#142121',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: isLight ? "#e2e8f0" : '#ffffff05',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#a78bfa10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeText: {
    color: '#a78bfa',
    fontSize: 10,
    fontWeight: '800',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  scheduleText: {
    color: isLight ? "#0f172a" : 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: isLight ? "#f1f5f9" : '#00000020',
    padding: 12,
    borderRadius: 16,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    color: isLight ? "#0f172a" : '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
});
