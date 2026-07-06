import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { fetchElements } from '../api/elements';
import type { Element } from '../types/element';
import PersonRow from '../components/PersonRow';
import Screen from '../components/ui/Screen';
import AppButton from '../components/ui/AppButton';
import Skeleton from '../components/ui/Skeleton';
import { colors, radii, spacing, typography } from '../theme';

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function LoadingRow() {
  return (
    <View style={styles.skeletonRow}>
      <Skeleton width={52} height={52} radius={radii.full} />
      <Skeleton width="55%" height={14} />
    </View>
  );
}

export default function ListadoScreen() {
  const [elements, setElements] = useState<Element[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchElements()
      .then((data) => {
        if (active) setElements(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => load(), [load]);

  if (loading) {
    return (
      <Screen>
        <Text style={[typography.caption, styles.loadingLabel]}>Cargando...</Text>
        <View style={styles.list}>
          {SKELETON_ROWS.map((key) => (
            <LoadingRow key={key} />
          ))}
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={[typography.subtitle, styles.errorTitle]}>No se pudo cargar el listado.</Text>
          <Text style={[typography.caption, styles.errorHint]}>Revisá tu conexión e intentá de nuevo.</Text>
          <AppButton label="Reintentar" variant="secondary" onPress={load} style={styles.retry} />
        </View>
      </Screen>
    );
  }

  return (
    <FlatList
      style={styles.flat}
      data={elements}
      keyExtractor={(element) => element.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => <PersonRow name={item.name} avatar={item.avatar} />}
    />
  );
}

const styles = StyleSheet.create({
  flat: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.xl, gap: spacing.md },
  list: { gap: spacing.md, marginTop: spacing.sm },
  loadingLabel: { marginBottom: spacing.xs },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  errorTitle: { textAlign: 'center' },
  errorHint: { textAlign: 'center' },
  retry: { marginTop: spacing.md, alignSelf: 'center', paddingHorizontal: spacing.xxxl },
});
