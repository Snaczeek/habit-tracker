import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Habit = {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
  completedDates: string[]; // daty w formacie YYYY-MM-DD
};

type HabitContextType = {
  habits: Habit[];
  loading: boolean;
  addHabit: (name: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  isHabitCompletedToday: (habitId: string) => boolean;
};

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // Ładowanie nawyków z AsyncStorage
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('habits');
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (updatedHabits: Habit[]) => {
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  };

  const addHabit = async (name: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      completedDates: [],
    };
    const updatedHabits = [...habits, newHabit];
    await saveHabits(updatedHabits);
  };

  const toggleHabitCompletion = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const isCompletedToday = habit.completedDates.includes(today);
        return {
          ...habit,
          completedDates: isCompletedToday
            ? habit.completedDates.filter(date => date !== today)
            : [...habit.completedDates, today]
        };
      }
      return habit;
    });

    await saveHabits(updatedHabits);
  };

  const deleteHabit = async (habitId: string) => {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    await saveHabits(updatedHabits);
  };

  const isHabitCompletedToday = (habitId: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    return habit ? habit.completedDates.includes(today) : false;
  };

  return (
    <HabitContext.Provider value={{
      habits,
      loading,
      addHabit,
      toggleHabitCompletion,
      deleteHabit,
      isHabitCompletedToday,
    }}>
      {children}
    </HabitContext.Provider>
  );
}

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};