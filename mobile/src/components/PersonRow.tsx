import { Image, StyleSheet, Text, View } from 'react-native';

interface Props {
  name: string;
  avatar?: string;
}

export default function PersonRow({ name, avatar }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>
      {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: { fontSize: 16, flexShrink: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginLeft: 12 },
});
