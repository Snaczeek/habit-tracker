import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useHabits } from '../../context/HabitContext';
import { Ionicons } from '@expo/vector-icons';

export default function TodayScreen() {
  const { habits, toggleHabitCompletion, isHabitCompletedToday, updateHabitImage } = useHabits();

  const today = new Date().toISOString().split('T')[0];

  // Podział na dwie listy
  const todoHabits = habits.filter(h => !isHabitCompletedToday(h.id));
  const doneHabits = habits.filter(h => isHabitCompletedToday(h.id));

  const handleMarkAsDone = async (habitId: string, habitName: string) => {
    // TODO: Możliwość dodawanie zdjęć do zakończonych tasków
    await toggleHabitCompletion(habitId);
  };

  const renderHabit = (habit: any, isDone: boolean) => (
    <TouchableOpacity 
      style={styles.habitItem}
      onPress={() => handleMarkAsDone(habit.id, habit.name)}
    >
      <View style={styles.checkboxContainer}>
        <Ionicons 
          name={isDone ? "checkmark-circle" : "ellipse-outline"} 
          size={32} 
          color={isDone ? "#22c55e" : "#94a3b8"} 
        />
      </View>
      
      <Text style={[styles.habitName, isDone && styles.doneText]}>
        {habit.name}
      </Text>

      {isDone && habit.imageUri && (
        <Ionicons name="image" size={20} color="#64748b" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.dateHeader}>
        Dzisiaj • {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      {/* Lista do zrobienia */}
      <Text style={styles.sectionTitle}>Do zrobienia ({todoHabits.length})</Text>
      {todoHabits.length > 0 ? (
        <FlatList
          data={todoHabits}
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderHabit(item, false)}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.emptySection}>Wszystko zrobione na dzisiaj! 🎉</Text>
      )}

      {/* Lista zrobione */}
      {doneHabits.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Zrobione dzisiaj ({doneHabits.length})</Text>
          <FlatList
            data={doneHabits}
            keyExtractor={item => item.id}
            renderItem={({ item }) => renderHabit(item, true)}
            contentContainerStyle={styles.list}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 60,
  },
  dateHeader: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e2937',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  habitItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  habitName: {
    fontSize: 18,
    flex: 1,
  },
  doneText: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  list: {
    paddingBottom: 20,
  },
  emptySection: {
    textAlign: 'center',
    color: '#22c55e',
    fontSize: 18,
    marginTop: 30,
    fontWeight: '500',
  },
});