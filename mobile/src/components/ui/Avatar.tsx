import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import Skeleton from './Skeleton';

interface Props {
  name: string;
  uri?: string;
  size?: number;
}

/** Palette for the initials fallback — a tone is picked deterministically from the name. */
const FALLBACK_TONES = ['#4F46E5', '#0E7490', '#B45309', '#9333EA', '#BE185D', '#15803D'] as const;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}

function toneFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return FALLBACK_TONES[Math.abs(hash) % FALLBACK_TONES.length];
}

/**
 * Circular avatar for the external listado. Shows a skeleton while the remote
 * photo loads and falls back to colored initials when it is missing or fails —
 * fakercloud avatars 404 often, so a graceful fallback keeps the row readable.
 */
export default function Avatar({ name, uri, size = 52 }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(uri ? 'loading' : 'error');
  // A single circular box shared by the photo and the initials fallback keeps
  // both shapes identical (size / 2 is more robust on Android than a huge radius).
  const box = { width: size, height: size, borderRadius: size / 2, overflow: 'hidden' as const };

  if (status === 'error' || !uri) {
    return (
      <View style={[styles.fallback, box, { backgroundColor: toneFor(name) }]}>
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initialsOf(name)}</Text>
      </View>
    );
  }

  return (
    <View style={box}>
      <Image
        source={{ uri }}
        style={[styles.image, box]}
        onLoad={() => setStatus('ready')}
        onError={() => setStatus('error')}
      />
      {status === 'loading' ? <Skeleton width={size} height={size} radius={size / 2} style={styles.overlay} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.skeleton },
  overlay: { position: 'absolute', top: 0, left: 0 },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '700' },
});
