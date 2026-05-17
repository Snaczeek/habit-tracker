import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useHabits } from '../../context/HabitContext';
import { Ionicons } from '@expo/vector-icons';

export default function HabitsScreen() {
  const { habits, loading, deleteHabit, updateHabit } = useHabits();
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleDelete = (habitId: string, habitName: string) => {
    Alert.alert(
        'Usunąć nawyk?',
        `Czy na pewno checesz usunąć "${habitName}"?`,
        [
            { text: 'Anuluj', style: 'cancel' },
            {
                text: 'Usuń',
                style: 'destructive',
                onPress: () => deleteHabit(habitId)
            }
        ]
    )
  }

  const startEditing = (habit: any) => {
    setEditingId(habit.id);
    setEditName(habit.name);
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const trimmedName = editName.trim();

    if (trimmedName.length < 2) {
        Alert.alert('Błąd', 'Nazwa nawyku musi mieć co najmniej 2 znaki');
        return; 
    }

    await updateHabit(editingId, trimmedName);
    setEditingId(null);
    setEditName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Moje nawyki</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-habit')}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text>Ładowanie...</Text>
      ) : habits.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nie masz jeszcze żadnych nawyków</Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.habitItem}>
              {editingId === item.id ? (
                // Tryb edycji
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editName}
                    onChangeText={setEditName}
                    autoFocus
                  />
                  <TouchableOpacity onPress={saveEdit}>
                    <Ionicons name="checkmark" size={24} color="#22c55e" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelEdit} style={{ marginLeft: 12 }}>
                    <Ionicons name="close" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                // Normalny widok
                <>
                  <Text style={styles.habitName}>{item.name}</Text>
                  
                  <View style={styles.actions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => startEditing(item)}
                    >
                      <Ionicons name="pencil" size={22} color="#64748b" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDelete(item.id, item.name)}
                    >
                      <Ionicons name="trash-outline" size={22} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e2937',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitItem: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitName: {
    fontSize: 18,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
  },
  centerText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#64748b',
  },
  actions: { 
    flexDirection: 'row' 
  },
  actionButton: { 
    padding: 8, marginLeft: 4 
  },
  editContainer: { 
    flexDirection: 'row', alignItems: 'center', flex: 1 
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    fontSize: 17,
  },
});