import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { fetchMarcasExternas } from '../api/catalogoExterno';
import type { MarcaExterna } from '../types/catalogoExterno';
import Screen from '../components/ui/Screen';
import AppButton from '../components/ui/AppButton';
import Skeleton from '../components/ui/Skeleton';
import { colors, radii, shadows, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Catalogo'>;

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

function LoadingRow() {
  return (
    <View style={styles.row}>
      <Skeleton width={40} height={40} radius={radii.md} />
      <Skeleton width="50%" height={14} />
    </View>
  );
}

export default function CatalogoScreen({ navigation }: Props) {
  const [marcas, setMarcas] = useState<MarcaExterna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchMarcasExternas()
      .then((data) => {
        if (active) setMarcas(data);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? marcas.filter((m) => m.nombre.toLowerCase().includes(q)) : marcas;
  }, [marcas, query]);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>Marcas en vivo desde vPIC</Text>
      </View>

      {!loading && !error ? (
        <TextInput
          style={styles.search}
          placeholder="Buscar marca..."
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
      ) : null}

      {loading ? (
        <View style={styles.list}>
          <Text style={[typography.caption, styles.loadingLabel]}>Cargando...</Text>
          {SKELETON_ROWS.map((key) => (
            <LoadingRow key={key} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[typography.subtitle, styles.errorTitle]}>No se pudo cargar el catálogo externo.</Text>
          <Text style={[typography.caption, styles.errorHint]}>El backend o la fuente externa (vPIC) no respondieron.</Text>
          <AppButton label="Reintentar" variant="secondary" onPress={load} style={styles.retry} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(marca) => String(marca.id)}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.nombre}
              onPress={() => navigation.navigate('Modelos', { marca: item.nombre })}
              style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
            >
              <View style={styles.tile}>
                <Text style={styles.monogram}>{item.nombre.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={[typography.subtitle, styles.rowLabel]} numberOfLines={1}>
                {item.nombre}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[typography.caption, styles.errorHint]}>No hay marcas que coincidan con la búsqueda.</Text>
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
  search: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  list: { gap: spacing.md },
  loadingLabel: { marginBottom: spacing.xs },
  listContent: { flexGrow: 1, gap: spacing.md, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  rowPressed: { backgroundColor: colors.surfaceAlt, transform: [{ scale: 0.99 }] },
  tile: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogram: { color: colors.onPrimary, fontSize: 17, fontWeight: '700' },
  rowLabel: { flex: 1 },
  chevron: { color: colors.textFaint, fontSize: 26, fontWeight: '300' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
  errorTitle: { textAlign: 'center' },
  errorHint: { textAlign: 'center' },
  retry: { marginTop: spacing.md, alignSelf: 'center', paddingHorizontal: spacing.xxxl },
});
