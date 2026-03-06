import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Dumbbell, Brain, Heart, Moon, Footprints } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../theme-context';

export default function ExercisesScreen() {
  const router = useRouter();
  const { isLightMode } = useAppTheme();
  const styles = createStyles(isLightMode);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Exercises</ThemedText>
          <ThemedText style={styles.subtitle}>Curated modules for your mind.</ThemedText>
        </View>

        <View style={styles.grid}>
          <ExerciseItem
            title="Focus Training"
            duration="10 min"
            icon={<Brain size={24} color={isLightMode ? "#0284c7" : "#13ecec"} />}
            onPress={() => router.push('/focus-training')}
            styles={styles}
          />
          <ExerciseItem
            title="Heart Rate Vari."
            duration="5 min"
            icon={<Heart size={24} color="#f87171" />}
            onPress={() => router.push('/hrv-training')}
            styles={styles}
          />
          <ExerciseItem
            title="Sleep Well"
            duration="20 min"
            icon={<Moon size={24} color="#a78bfa" />}
            onPress={() => router.push('/sleep-well')}
            styles={styles}
          />
          <ExerciseItem
            title="Resilience"
            duration="15 min"
            icon={<Dumbbell size={24} color={isLightMode ? "#d97706" : "#fbbf24"} />}
            onPress={() => router.push('/resilience-training')}
            styles={styles}
          />
          <ExerciseItem
            title="Daily Steps"
            duration="Today"
            icon={<Footprints size={24} color={isLightMode ? "#0284c7" : "#13ecec"} />}
            onPress={() => router.push('/step-counter')}
            styles={styles}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const ExerciseItem = ({ title, duration, icon, onPress, styles }: { title: string; duration: string; icon: React.ReactNode; onPress: () => void; styles: any }) => (
  <Pressable style={styles.item} onPress={onPress}>
    <View style={styles.iconContainer}>{icon}</View>
    <ThemedText style={styles.itemTitle}>{title}</ThemedText>
    <ThemedText style={styles.itemDuration}>{duration}</ThemedText>
  </Pressable>
);

const createStyles = (isLight: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isLight ? "#f8fafc" : '#091212',
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
    color: isLight ? "#0f172a" : 'white',
  },
  subtitle: {
    color: isLight ? "#475569" : '#64748b',
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
    backgroundColor: isLight ? "#ffffff" : '#142121',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isLight ? "#e2e8f0" : '#ffffff05',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: isLight ? "#f1f5f9" : '#0d1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    color: isLight ? "#0f172a" : 'white',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  itemDuration: {
    color: isLight ? "#64748b" : '#64748b',
    fontSize: 12,
  },
});
