import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { fetchElements } from '../api/elements';
import type { Element } from '../types/element';
import PersonRow from '../components/PersonRow';

export default function ListadoScreen() {
  const [elements, setElements] = useState<Element[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.hint}>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>No se pudo cargar el listado.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={elements}
      keyExtractor={(element) => element.id}
      renderItem={({ item }) => <PersonRow name={item.name} avatar={item.avatar} />}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hint: { color: '#666' },
});
