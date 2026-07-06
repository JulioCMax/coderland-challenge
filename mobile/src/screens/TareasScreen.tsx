import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { mergeServerTasks, selectTasks } from '../store/tasksSlice';
import { syncTasks } from '../api/tasksSync';
import AddTaskModal from '../components/AddTaskModal';
import Screen from '../components/ui/Screen';
import AppButton from '../components/ui/AppButton';
import { colors, radii, shadows, spacing, typography } from '../theme';

interface SyncStatus {
  text: string;
  type: 'success' | 'error';
}

export default function TareasScreen() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasks);
  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    setStatus(null);
    try {
      const result = await syncTasks(tasks.map((task) => task.description));
      // The backend returns the full task list (including tasks created directly on it),
      // so pull anything new into the local list.
      const local = new Set(tasks.map((task) => task.description.toLowerCase()));
      const pulled = result.tasks.filter((task) => !local.has(task.descripcion.trim().toLowerCase())).length;
      dispatch(mergeServerTasks(result.tasks.map((task) => task.descripcion)));
      setStatus({
        type: 'success',
        text: `Sincronizado: ${result.imported} enviadas, ${pulled} traídas del backend.`,
      });
    } catch {
      setStatus({ type: 'error', text: 'No se pudo sincronizar. El backend no está disponible.' });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Screen contentStyle={styles.content}>
      <AppButton label="Agregar nuevo task" onPress={() => setModalVisible(true)} />

      <FlatList
        style={styles.list}
        data={tasks}
        keyExtractor={(task) => task.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.task}>
            <View style={styles.accent} />
            <Text style={[typography.body, styles.taskText]}>{item.description}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[typography.subtitle, styles.emptyTitle]}>No hay tasks todavía.</Text>
            <Text style={[typography.caption, styles.emptyHint]}>Tocá “Agregar nuevo task” para crear el primero.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <AppButton
          label="Sincronizar"
          variant="secondary"
          onPress={handleSync}
          disabled={syncing || tasks.length === 0}
        />
        {status ? (
          <View style={[styles.pill, status.type === 'success' ? styles.pillSuccess : styles.pillError]}>
            <Text style={[styles.pillText, status.type === 'success' ? styles.pillTextSuccess : styles.pillTextError]}>
              {status.text}
            </Text>
          </View>
        ) : null}
      </View>

      <AddTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: spacing.lg, gap: spacing.md },
  list: { flex: 1 },
  listContent: { flexGrow: 1, gap: spacing.sm, paddingVertical: spacing.sm },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  accent: { width: 4, alignSelf: 'stretch', borderRadius: radii.full, backgroundColor: colors.primary },
  taskText: { flexShrink: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.xxxl },
  emptyTitle: { color: colors.textMuted },
  emptyHint: { textAlign: 'center' },
  footer: { gap: spacing.md },
  pill: { borderRadius: radii.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  pillSuccess: { backgroundColor: colors.successSoft },
  pillError: { backgroundColor: colors.dangerSoft },
  pillText: { ...typography.caption, textAlign: 'center' },
  pillTextSuccess: { color: colors.success },
  pillTextError: { color: colors.danger },
});
