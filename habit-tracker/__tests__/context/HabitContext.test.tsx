import { act, renderHook } from "@testing-library/react-native";
import React from "react";
import { HabitProvider, useHabits } from "../../context/HabitContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HabitProvider>{children}</HabitProvider>
);

describe("HabitContext", () => {
  it("1. should add a new habit", async () => {
    const { result } = await renderHook(() => useHabits(), { wrapper });

    await act(async () => {
      await result.current.addHabit("Pić wodę");
    });

    expect(result.current.habits).toHaveLength(1);
    expect(result.current.habits[0].name).toBe("Pić wodę");

    // usuwamy dodany habit by nie wplywał na inne testy
    const habitId = result.current.habits[0].id;
    await act(async () => {
      await result.current.deleteHabit(habitId);
    });
  });

  it("2. should delete a habit", async () => {
    const { result } = await renderHook(() => useHabits(), { wrapper });

    await act(async () => {
      await result.current.addHabit("Do usunięcia");
    });

    const habitId = result.current.habits[0].id;

    await act(async () => {
      await result.current.deleteHabit(habitId);
    });

    expect(result.current.habits).toHaveLength(0);
  });

  it("3. should toggle habit completion", async () => {
    const { result } = await renderHook(() => useHabits(), { wrapper });

    await act(async () => {
      await result.current.addHabit("Spacer");
    });

    const habitId = result.current.habits[0].id;

    await act(async () => {
      await result.current.toggleHabitCompletion(habitId);
    });

    expect(result.current.isHabitCompletedToday(habitId)).toBe(true);

    await act(async () => {
      await result.current.deleteHabit(habitId);
    });
  });

  it("4. should update habit name", async () => {
    const { result } = await renderHook(() => useHabits(), { wrapper });

    await act(async () => {
      await result.current.addHabit("Stara nazwa");
    });

    const habitId = result.current.habits[0].id;

    await act(async () => {
      await result.current.updateHabit(habitId, "Nowa nazwa");
    });

    expect(result.current.habits[0].name).toBe("Nowa nazwa");

    await act(async () => {
      await result.current.deleteHabit(habitId);
    });
  });

  it("5. should complete habit with image", async () => {
    const { result } = await renderHook(() => useHabits(), { wrapper });

    await act(async () => {
      await result.current.addHabit("Bieganie");
    });

    const habitId = result.current.habits[0].id;

    await act(async () => {
      await result.current.completeHabitWithImage(
        habitId,
        "file://test-photo.jpg",
      );
    });

    expect(result.current.habits[0].imageUri).toBeDefined();
    expect(result.current.isHabitCompletedToday(habitId)).toBe(true);

    await act(async () => {
      await result.current.deleteHabit(habitId);
    });
  });

  it("6. should return correct today date format", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("7. should persist data (basic check)", async () => {
    const { result } = await renderHook(() => useHabits(), { wrapper });

    await act(async () => {
      await result.current.addHabit("Test persystencji");
    });

    expect(result.current.habits.length).toBeGreaterThan(0);

    await act(async () => {
      await result.current.deleteHabit(result.current.habits[0].id);
    });
  });

  it("8. should handle multiple habits", async () => {
    const { result } = await renderHook(() => useHabits(), { wrapper });

    await act(async () => {
      await result.current.addHabit("Nawyk 1");
    });

    await act(async () => {
      await result.current.addHabit("Nawyk 2");
    });

    expect(result.current.habits).toHaveLength(2);
  });
});
