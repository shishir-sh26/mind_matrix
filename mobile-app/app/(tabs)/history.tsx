import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HistoryScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>History</ThemedText>
          <ThemedText style={styles.subtitle}>Trace your path to peace.</ThemedText>
        </View>

        <View style={styles.placeholderList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.historyItem} />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#091212',
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
    color: 'white',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 8,
  },
  placeholderList: {
    gap: 16,
  },
  historyItem: {
    height: 80,
    backgroundColor: '#142121',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffffff05',
  },
});
