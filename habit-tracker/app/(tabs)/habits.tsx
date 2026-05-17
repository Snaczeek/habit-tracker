import { View, Text, StyleSheet } from 'react-native';

export default function HabitsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moje nawyki</Text>
      <Text style={styles.subtitle}>Tutaj będzie lista nawyków...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
});