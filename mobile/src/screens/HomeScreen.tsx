import { Button, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Tareas y gestión de catálogos
      </Text>
      <View style={styles.button}>
        <Button title="Tareas" onPress={() => navigation.navigate('Tareas')} />
      </View>
      <View style={styles.button}>
        <Button title="Listado" onPress={() => navigation.navigate('Listado')} />
      </View>
      <View style={styles.button}>
        <Button title="Marcas (backend)" onPress={() => navigation.navigate('Marcas')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 24 },
  button: { width: '100%' },
});
