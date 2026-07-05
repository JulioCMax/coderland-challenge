import { StyleSheet, Text, View } from 'react-native';

export default function TareasScreen() {
  return (
    <View style={styles.container}>
      <Text>Tareas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
