import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Dumbbell, Brain, Heart, Moon } from 'lucide-react-native';

export default function ExercisesScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Exercises</ThemedText>
          <ThemedText style={styles.subtitle}>Curated modules for your mind.</ThemedText>
        </View>

        <View style={styles.grid}>
          <ExerciseItem title="Focus Training" duration="10 min" icon={<Brain size={24} color="#13ecec" />} />
          <ExerciseItem title="Heart Rate Vari." duration="5 min" icon={<Heart size={24} color="#f87171" />} />
          <ExerciseItem title="Sleep Well" duration="20 min" icon={<Moon size={24} color="#a78bfa" />} />
          <ExerciseItem title="Resilience" duration="15 min" icon={<Dumbbell size={24} color="#fbbf24" />} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const ExerciseItem = ({ title, duration, icon }) => (
  <View style={styles.item}>
    <View style={styles.iconContainer}>{icon}</View>
    <ThemedText style={styles.itemTitle}>{title}</ThemedText>
    <ThemedText style={styles.itemDuration}>{duration}</ThemedText>
  </View>
);

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  item: {
    width: '47%',
    backgroundColor: '#142121',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ffffff05',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0d1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  itemDuration: {
    color: '#64748b',
    fontSize: 12,
  },
});
