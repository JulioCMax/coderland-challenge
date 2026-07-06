import { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { selectTasks } from '../store/tasksSlice';
import AddTaskModal from '../components/AddTaskModal';

export default function TareasScreen() {
  const tasks = useAppSelector(selectTasks);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Button title="Agregar nuevo task" onPress={() => setModalVisible(true)} />
      <FlatList
        style={styles.list}
        data={tasks}
        keyExtractor={(task) => task.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.description}</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No hay tasks todavía.</Text>}
      />
      <AddTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  list: { flex: 1 },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
});
