import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { fetchMarcas } from '../api/marcas';
import type { Marca } from '../types/marca';

export default function MarcasScreen() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchMarcas()
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

  return (
    <View style={styles.container}>
      <Text style={styles.banner}>Catálogo servido por el backend</Text>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.hint}>Cargando...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.hint}>No se pudo conectar con el backend. Probá de nuevo más tarde.</Text>
        </View>
      ) : (
        <FlatList
          data={marcas}
          keyExtractor={(marca) => String(marca.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.nombre}</Text>
              {item.paisOrigen ? <Text style={styles.country}>{item.paisOrigen}</Text> : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: { backgroundColor: '#eef2ff', color: '#3730a3', padding: 10, textAlign: 'center', fontSize: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  hint: { color: '#666', textAlign: 'center' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: { fontSize: 16 },
  country: { color: '#888' },
});
