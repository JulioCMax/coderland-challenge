import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import Screen from '../components/ui/Screen';
import NavCard from '../components/NavCard';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const LINKEDIN_URL = 'https://www.linkedin.com/in/julio-albitres-rodriguez/';

export default function HomeScreen({ navigation }: Props) {
  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={typography.overline}>Coderland</Text>
        <Text style={typography.display} accessibilityRole="header">
          Tareas y gestión de catálogos
        </Text>
        <Text style={[typography.bodyMuted, styles.tagline]}>
          Gestioná tus tareas y explorá los catálogos, incluso sin conexión.
        </Text>
      </View>

      <View style={styles.cards}>
        <NavCard
          title="Tareas"
          subtitle="Creá y administrá tus tareas"
          monogram="T"
          tone={colors.primary}
          onPress={() => navigation.navigate('Tareas')}
        />
        <NavCard
          title="Listado"
          subtitle="Personas desde un endpoint externo"
          monogram="L"
          tone="#0E7490"
          onPress={() => navigation.navigate('Listado')}
        />
        <NavCard
          title="Marcas"
          subtitle="Catálogo guardado en el backend"
          monogram="M"
          tone="#B45309"
          onPress={() => navigation.navigate('Marcas')}
        />
        <NavCard
          title="Vehículos"
          subtitle="Marcas y modelos en vivo (vPIC)"
          monogram="V"
          tone="#7C3AED"
          onPress={() => navigation.navigate('Catalogo')}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('Info')}
        style={({ pressed }) => [styles.infoLink, pressed ? styles.infoLinkPressed : null]}
      >
        <Text style={styles.infoText}>¿Qué hace cada cosa?</Text>
      </Pressable>

      <View style={styles.footerSpacer} />
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Perfil de LinkedIn de Julio Albitres"
        onPress={() => Linking.openURL(LINKEDIN_URL)}
        style={styles.footer}
      >
        <Text style={styles.footerMade}>Hecho por </Text>
        <Text style={styles.footerName}>Julio Albitres</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: spacing.xxl, gap: spacing.sm },
  tagline: { marginTop: spacing.xs },
  cards: { gap: spacing.md },
  infoLink: {
    marginTop: spacing.xl,
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
  infoLinkPressed: { opacity: 0.6 },
  infoText: { ...typography.subtitle, color: colors.primary, fontSize: 15 },
  footerSpacer: { flex: 1, minHeight: spacing.xxl },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerMade: { ...typography.caption },
  footerName: { ...typography.caption, color: colors.primary, fontWeight: '700' },
});
