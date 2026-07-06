import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { addTask } from '../store/tasksSlice';
import AppButton from './ui/AppButton';
import { colors, radii, shadows, spacing, typography } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddTaskModal({ visible, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [description, setDescription] = useState('');
  const [focused, setFocused] = useState(false);
  const canSubmit = description.trim().length > 0;

  function handleClose() {
    setDescription('');
    setFocused(false);
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
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={typography.title}>Nueva tarea</Text>
          <Text style={[typography.caption, styles.subtitle]}>Escribí qué necesitás hacer.</Text>
          <TextInput
            style={[styles.input, focused ? styles.inputFocused : null]}
            placeholder="Descripción"
            placeholderTextColor={colors.textFaint}
            value={description}
            onChangeText={setDescription}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
          />
          <View style={styles.actions}>
            <AppButton label="Cancelar" variant="ghost" onPress={handleClose} style={styles.action} />
            <AppButton label="Guardar" onPress={handleSubmit} disabled={!canSubmit} style={styles.action} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    backgroundColor: 'rgba(9, 11, 32, 0.45)',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    gap: spacing.md,
    ...shadows.md,
  },
  subtitle: { marginTop: -spacing.xs },
  input: {
    ...typography.body,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  inputFocused: { borderColor: colors.primary },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
  action: { minWidth: 110 },
});
