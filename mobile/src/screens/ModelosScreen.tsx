import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { fetchModelos } from '../api/catalogoExterno';
import type { Modelo } from '../types/catalogoExterno';
import Screen from '../components/ui/Screen';
import AppButton from '../components/ui/AppButton';
import Skeleton from '../components/ui/Skeleton';
import { colors, radii, shadows, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Modelos'>;

const SKELETON_ROWS = [0, 1, 2, 3, 4];

export default function ModelosScreen({ route }: Props) {
  const { marca } = route.params;
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchModelos(marca)
      .then((data) => {
        if (active) setModelos(data);
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
  }, [marca]);

  useEffect(() => load(), [load]);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>Modelos de {marca}</Text>
      </View>

      {loading ? (
        <View style={styles.list}>
          <Text style={[typography.caption, styles.loadingLabel]}>Cargando...</Text>
          {SKELETON_ROWS.map((key) => (
            <View key={key} style={styles.row}>
              <Skeleton width="60%" height={14} />
            </View>
          ))}
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[typography.subtitle, styles.errorTitle]}>No se pudieron cargar los modelos.</Text>
          <Text style={[typography.caption, styles.errorHint]}>El backend o la fuente externa (vPIC) no respondieron.</Text>
          <AppButton label="Reintentar" variant="secondary" onPress={load} style={styles.retry} />
        </View>
      ) : (
        <FlatList
          data={modelos}
          keyExtractor={(modelo) => String(modelo.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={typography.subtitle}>{item.nombre}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[typography.caption, styles.errorHint]}>{marca} no reporta modelos en vPIC.</Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: spacing.lg, gap: spacing.md },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  badgeDot: { width: 8, height: 8, borderRadius: radii.full, backgroundColor: colors.primary },
  badgeText: { ...typography.caption, color: colors.primaryDark, fontWeight: '700' },
  list: { gap: spacing.md },
  loadingLabel: { marginBottom: spacing.xs },
  listContent: { flexGrow: 1, gap: spacing.md, paddingBottom: spacing.xl },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
  errorTitle: { textAlign: 'center' },
  errorHint: { textAlign: 'center' },
  retry: { marginTop: spacing.md, alignSelf: 'center', paddingHorizontal: spacing.xxxl },
});
