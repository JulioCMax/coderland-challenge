import { StyleSheet, Text, View } from 'react-native';

export default function ListadoScreen() {
  return (
    <View style={styles.container}>
      <Text>Listado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
