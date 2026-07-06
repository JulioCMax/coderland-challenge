import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/ui/Screen';
import Card from '../components/ui/Card';
import { colors, radii, spacing, typography } from '../theme';

interface Feature {
  monogram: string;
  tone: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    monogram: 'T',
    tone: colors.primary,
    title: 'Tareas',
    description: 'Creá y guardá tus tareas en el dispositivo. Funcionan sin conexión y se conservan al cerrar la app.',
  },
  {
    monogram: 'L',
    tone: '#0E7490',
    title: 'Listado',
    description: 'Trae personas desde un endpoint externo y muestra sus fotos. Si una imagen falla, se ven las iniciales.',
  },
  {
    monogram: 'M',
    tone: '#B45309',
    title: 'Marcas',
    description: 'Catálogo de marcas guardado en la base del backend. Si el backend no está disponible, la app te avisa y sigue andando.',
  },
  {
    monogram: 'V',
    tone: '#7C3AED',
    title: 'Vehículos',
    description: 'Marcas y modelos en vivo desde una API externa (vPIC), servidos a través del backend. Buscá una marca y tocala para ver sus modelos.',
  },
  {
    monogram: 'S',
    tone: colors.success,
    title: 'Sincronizar',
    description: 'Envía las descripciones de tus tareas al backend. Es opcional: si falla, tus tareas siguen intactas en el teléfono.',
  },
];

export default function InfoScreen() {
  return (
    <Screen scroll>
      <Text style={[typography.bodyMuted, styles.intro]}>
        Estas son las secciones de la app y qué hace cada una. Todo lo que depende del backend degrada con elegancia:
        la app siempre funciona.
      </Text>

      <View style={styles.list}>
        {FEATURES.map((feature) => (
          <Card key={feature.title} style={styles.item}>
            <View style={[styles.tile, { backgroundColor: feature.tone }]}>
              <Text style={styles.monogram}>{feature.monogram}</Text>
            </View>
            <View style={styles.body}>
              <Text style={typography.subtitle}>{feature.title}</Text>
              <Text style={[typography.caption, styles.description]}>{feature.description}</Text>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: spacing.xl },
  list: { gap: spacing.md },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  tile: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogram: { color: colors.onPrimary, fontSize: 18, fontWeight: '700' },
  body: { flex: 1, gap: spacing.xs },
  description: { color: colors.textMuted, lineHeight: 19 },
});
