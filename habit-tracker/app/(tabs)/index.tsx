import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useHabits } from '../../context/HabitContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import type { Habit } from '../../context/HabitContext';
import React from 'react';

const HabitItem = React.memo(({ 
  habit, 
  isDone, 
  onPress 
}: { 
  habit: Habit; 
  isDone: boolean; 
  onPress: () => void;
}) => (
  <TouchableOpacity 
    style={styles.habitItem}
    onPress={onPress}
  >
    <View style={styles.checkboxContainer}>
      <Ionicons 
        name={isDone ? "checkmark-circle" : "ellipse-outline"} 
        size={32} 
        color={isDone ? "#22c55e" : "#94a3b8"} 
      />
    </View>
    
    <View style={styles.habitInfo}>
      <Text style={[styles.habitName, isDone && styles.doneText]}>
        {habit.name}
      </Text>
    </View>

    {isDone && habit.imageUri && (
      <Image 
        source={{ uri: habit.imageUri }}
        style={styles.thumbnail}
        contentFit="cover"
        transition={200}
      />
    )}
  </TouchableOpacity>
));

// Komponent nagłówka sekcji
const SectionHeader = React.memo(({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
));

export default function TodayScreen() {
  const { habits, toggleHabitCompletion, isHabitCompletedToday, completeHabitWithImage, loading } = useHabits();
  
  useEffect(() => {
    (async () => {
      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (galleryStatus !== 'granted') {
        Alert.alert('Brak uprawnień', 'Aby dodawać zdjęcia potrzebujemy dostępu do galerii');
      }
      if (camStatus !== 'granted' ) {
        Alert.alert('Brak uprawnień', 'Potrzebujemy dostępu do kamery, aby robić zdjęcia');       
      }

    })();
  }, []);

  // Podział na dwie listy
  const todoHabits = habits.filter(h => !isHabitCompletedToday(h.id));
  const doneHabits = habits.filter(h => isHabitCompletedToday(h.id));

  const sections = [
    ...(todoHabits.length > 0 ? [{
      title: `Do zrobienia (${todoHabits.length})`,
      data: todoHabits,
      isDone: false,
    }] : []),
    ...(doneHabits.length > 0 ? [{
      title: `Zrobione dzisiaj (${doneHabits.length})`,
      data: doneHabits,
      isDone: true,
    }] : []),
  ];

  const handleMarkAsDone = async (habitId: string, habitName: string) => {
    
    // Jeśli nawyk już jest zrobiony dzisiaj po prostu odznacz
    if (isHabitCompletedToday(habitId)) {
      await toggleHabitCompletion(habitId);
      return;
    }

    // Jeśli nie jest zrobiony zapytaj o zdjęcie
    Alert.alert(
      "Zrobione dzisiaj?",
      `Czy chcesz dodać zdjęcie do "${habitName}"?`,
      [
        { 
          text: "Tylko zaznacz", 
          onPress: () => toggleHabitCompletion(habitId) 
        },
        { 
          text: "Zrób zdjęcie", 
          onPress: () => takePhoto(habitId) 
        },
        { 
          text: "Wybierz z galerii", 
          onPress: () => pickFromGallery(habitId) 
        },
      ]
    );
  };

  const takePhoto = async (habitId: string) => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      await completeHabitWithImage(habitId, result.assets[0].uri);
    }
  };

  const pickFromGallery = async (habitId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      await completeHabitWithImage(habitId, result.assets[0].uri);
    }
  };

  // Renderowanie elementu
  const renderItem = ({ item, section }: { item: Habit; section: any }) => (
    <HabitItem 
      habit={item} 
      isDone={section.isDone} 
      onPress={() => handleMarkAsDone(item.id, item.name)}
    />
  );

  // Renderowanie nagłówka sekcji
  const renderSectionHeader = ({ section }: { section: any }) => (
    <SectionHeader title={section.title} />
  );

  // Stan ładowania
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Ładowanie nawyków...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.dateHeader}>
        Dzisiaj • {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      {sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nie masz jeszcze żadnych nawyków</Text>
          <Text style={styles.emptySubtext}>Dodaj pierwszy nawyk w zakładce "Nawyki"</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
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
    backgroundColor: '#f8fafc',
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
  emptyContainer: {
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
    marginTop: 12,
    textAlign: 'center',
  },
  habitInfo: {
    flex: 1 
  },
  thumbnail: { 
    width: 50, 
    height: 50, 
    borderRadius: 8 
  },
});