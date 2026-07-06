import { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { selectTasks } from '../store/tasksSlice';
import { syncTasks } from '../api/tasksSync';
import AddTaskModal from '../components/AddTaskModal';

export default function TareasScreen() {
  const tasks = useAppSelector(selectTasks);
  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    setStatus(null);
    try {
      const result = await syncTasks(tasks.map((task) => task.description));
      setStatus(`Sincronizado: ${result.imported} nuevas, ${result.skipped} ya existían.`);
    } catch {
      setStatus('No se pudo sincronizar. El backend no está disponible.');
    } finally {
      setSyncing(false);
    }
  }

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
      <Button title="Sincronizar" onPress={handleSync} disabled={syncing} />
      {status ? <Text style={styles.status}>{status}</Text> : null}
      <AddTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  list: { flex: 1 },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
  status: { textAlign: 'center', color: '#3730a3' },
});
