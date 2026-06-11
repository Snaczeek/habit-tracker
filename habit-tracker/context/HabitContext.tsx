import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type Habit = {
  id: string;
  name: string;
  imageUri?: string;
  createdAt: string;
  completedDates: string[]; // YYYY-MM-DD
};

type HabitContextType = {
  habits: Habit[];
  loading: boolean;
  addHabit: (name: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  isHabitCompletedToday: (habitId: string) => boolean;
  updateHabitImage: (habitId: string, imageUri: string) => Promise<void>;
  updateHabit: (habitId: string, newName: string) => Promise<void>;
  completeHabitWithImage: (habitId: string, imageUri: string) => Promise<void>;
};

const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Fukncja pomocniczna do odczytywania dzisiejszej daty
const getTodayString = (): string => new Date().toISOString().split("T")[0]; // YYYY-MM-DD

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // Ładowanie habitow przy pierwszym odpaleniu apki
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem("habits");
      if (storedHabits) {
        const parsed = JSON.parse(storedHabits);
        setHabits(parsed);
      }
    } catch (error) {
      console.error("Error loading habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (updatedHabits: Habit[]) => {
    try {
      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
    } catch (error) {
      console.error("Error saving habits:", error);
    }
  };

  const addHabit = async (name: string) => {
    const newHabit: Habit = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      completedDates: [],
    };
    await saveHabits([...habits, newHabit]);
  };

  // Zmieniamy stan habita, uzywany tylko do odznaczania lub zaznaczanie bez checi dodawania zdejcia
  const toggleHabitCompletion = async (habitId: string) => {
    const today = getTodayString();

    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const isCompletedToday = habit.completedDates.includes(today);
        return {
          ...habit,
          completedDates: isCompletedToday
            ? habit.completedDates.filter((date) => date !== today) // Odznacz
            : [...habit.completedDates, today], // Zaznacz
        };
      }
      return habit;
    });

    await saveHabits(updatedHabits);
  };

  const deleteHabit = async (habitId: string) => {
    try {
      // Usuwanie zdjęć
      const habit = habits.find((habit) => habit.id === habitId);
      if (habit?.imageUri) {
        FileSystem.deleteAsync(habit.imageUri, { idempotent: true }).catch(
          (e) => console.warn("Nie udało się usunąć starego zdjęcia:", e),
        );
      }

      const updatedHabits = habits.filter((habit) => habit.id !== habitId);
      await saveHabits(updatedHabits);
    } catch (error) {
      console.error("Error podczas usuwania zdjęcia", error);
      throw error;
    }
  };

  const isHabitCompletedToday = (habitId: string): boolean => {
    const today = getTodayString();
    const habit = habits.find((h) => h.id === habitId);
    return habit ? habit.completedDates.includes(today) : false;
  };

  const updateHabitImage = async (habitId: string, imageUri: string) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === habitId ? { ...habit, imageUri } : habit,
    );

    await saveHabits(updatedHabits);
  };

  const updateHabit = async (habitId: string, newName: string) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === habitId ? { ...habit, name: newName.trim() } : habit,
    );
    await saveHabits(updatedHabits);
  };

  // Dodaje zdjecie do habitu i zmienia stan habita na wykonany
  const completeHabitWithImage = async (habitId: string, imageUri: string) => {
    const today = getTodayString();
    // Zmieniamy sciezke zdjecia aby OS go nam nie usunal
    const permanentUri = await persistImage(imageUri, habitId);

    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        // Usuwamy stare zdjecie jesli istnieje
        if (habit.imageUri?.includes("habit-images/")) {
          FileSystem.deleteAsync(habit.imageUri, { idempotent: true }).catch(
            (e) => console.warn("Nie udało się usunąć starego zdjęcia:", e),
          );
        }
        return {
          ...habit,
          imageUri: permanentUri,
          completedDates: habit.completedDates.includes(today)
            ? habit.completedDates
            : [...habit.completedDates, today],
        };
      }
      return habit;
    });

    await saveHabits(updatedHabits);
  };

  // Funkcja pomocnicza, kopiuje zdjecia z cache (ktory jest czszczony przez OS co jakis czas) do stalej lokalizacji
  const persistImage = async (
    tempUri: string,
    habitId: string,
  ): Promise<string> => {
    const dir = `${FileSystem.documentDirectory}habit-images/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

    const fileName = `${habitId}_${Date.now()}.jpg`;
    const permanentUri = `${dir}${fileName}`;

    await FileSystem.copyAsync({ from: tempUri, to: permanentUri });
    return permanentUri;
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        loading,
        addHabit,
        toggleHabitCompletion,
        deleteHabit,
        isHabitCompletedToday,
        updateHabitImage,
        updateHabit,
        completeHabitWithImage,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return context;
};
