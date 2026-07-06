import { useState } from 'react';
import { Button, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { addTask } from '../store/tasksSlice';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddTaskModal({ visible, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [description, setDescription] = useState('');
  const canSubmit = description.trim().length > 0;

  function handleClose() {
    setDescription('');
    onClose();
  }

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    dispatch(addTask(description));
    handleClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Nuevo task</Text>
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            autoFocus
          />
          <View style={styles.actions}>
            <Button title="Cancelar" onPress={handleClose} />
            <Button title="Guardar" onPress={handleSubmit} disabled={!canSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 24 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 20, gap: 16 },
  title: { fontSize: 18, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
});
