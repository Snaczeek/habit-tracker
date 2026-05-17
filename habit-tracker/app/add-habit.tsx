import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useHabits } from '../context/HabitContext';

export default function AddHabitScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { addHabit } = useHabits();
  const router = useRouter();

  const handleAdd = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Błąd', 'Nazwa nawyku musi mieć co najmniej 2 znaki');
      return;
    }

    setLoading(true);
    try {
      await addHabit(name.trim());
      setName('');
      router.back();           
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się dodać nawyku');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nazwa nowego nawyku</Text>
      
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Spacer..."
        autoFocus
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAdd}
        disabled={loading || name.trim().length < 2}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Dodawanie...' : 'Dodaj nawyk'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1e2937',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});