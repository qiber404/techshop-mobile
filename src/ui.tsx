import type { ComponentProps, ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { productImages } from './product-images';

export const colors = {
  paper: '#fafbf7', white: '#ffffff', ink: '#203329', leaf: '#244936',
  deep: '#203d2d', muted: '#52665b', line: '#dee7df', sage: '#e8f0e8',
  photo: '#f2f4ee', lime: '#daefaa', sale: '#923c25', tint: '#f7e8df',
};

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({ name, size = 22, color = colors.ink }: { name: IconName; size?: number; color?: string }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function Button({ label, icon, onPress, variant = 'solid', disabled = false }: {
  label: string; icon?: IconName; onPress: () => void;
  variant?: 'solid' | 'light' | 'danger'; disabled?: boolean;
}) {
  const light = variant !== 'solid';
  const ink = variant === 'danger' ? colors.sale : colors.ink;
  return (
    <Pressable accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled }}
      onPress={onPress} style={({ pressed }) => [
        styles.button, light && styles.buttonLight, variant === 'danger' && styles.buttonDanger,
        (disabled || pressed) && styles.dimmed,
      ]}>
      {icon && <Icon name={icon} size={19} color={light ? ink : colors.white} />}
      <Text style={[styles.buttonText, light && { color: ink }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ label, icon, onPress, disabled = false, filled = false }: {
  label: string; icon: IconName; onPress: () => void; disabled?: boolean; filled?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
      disabled={disabled} onPress={onPress} style={({ pressed }) => [
        styles.iconButton, filled && styles.iconFilled, (disabled || pressed) && styles.dimmed,
      ]}>
      <Icon name={icon} size={20} color={filled ? colors.white : colors.ink} />
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function ProductImage({ image, size, name }: { image: number | null; size: number; name: string }) {
  const source = image == null ? undefined : productImages[image];
  if (!source) return <Icon name="cube-outline" size={size * 0.42} color={colors.muted} />;
  return <Image accessibilityLabel={name} source={source} resizeMode="contain" style={{ width: size, height: size }} />;
}

export function TextField({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor={colors.muted}
        style={[styles.field, props.multiline && styles.multiline]} {...props} />
    </View>
  );
}

export function Empty({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><Icon name={icon} size={32} color={colors.leaf} /></View>
      <Text style={styles.section}>{title}</Text>
      {children}
    </View>
  );
}

export function Panel({ children }: { children: ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  center: { flex: 1, justifyContent: 'center', padding: 24 },
  header: {
    minHeight: 64, paddingHorizontal: 19, paddingVertical: 8, gap: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.paper, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line,
  },
  brand: { color: colors.ink, fontSize: 28, fontWeight: '800', letterSpacing: -1.25 },
  headerLabel: { flex: 1, color: colors.ink, fontSize: 19, fontWeight: '800' },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 19, paddingTop: 18, paddingBottom: 30, gap: 18 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.65 },
  section: { color: colors.ink, fontSize: 21, fontWeight: '800', letterSpacing: -0.35 },
  strong: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  body: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 19 },
  price: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  oldPrice: { color: colors.muted, fontSize: 13, textDecorationLine: 'line-through' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9 },
  wrap: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  grow: { flex: 1 },
  stack: { gap: 10 },
  block: { gap: 15 },
  button: {
    minHeight: 48, backgroundColor: colors.leaf, borderRadius: 14, paddingHorizontal: 15,
    paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
  },
  buttonLight: { backgroundColor: colors.sage },
  buttonDanger: { backgroundColor: colors.tint },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  dimmed: { opacity: 0.58 },
  iconButton: {
    width: 44, minHeight: 44, borderRadius: 14, backgroundColor: colors.sage,
    alignItems: 'center', justifyContent: 'center',
  },
  iconFilled: { backgroundColor: colors.leaf },
  chip: {
    minHeight: 41, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 22,
    justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.leaf, borderColor: colors.leaf },
  chipText: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  panel: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 19, padding: 15, gap: 12 },
  empty: { alignItems: 'center', paddingVertical: 35, paddingHorizontal: 10, gap: 16 },
  emptyIcon: {
    width: 66, height: 66, backgroundColor: colors.sage, borderRadius: 25, alignItems: 'center', justifyContent: 'center',
  },
  fieldWrap: { gap: 6 },
  fieldLabel: { color: colors.muted, fontWeight: '700', fontSize: 14 },
  field: {
    minHeight: 47, color: colors.ink, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line,
    borderRadius: 13, paddingHorizontal: 13, paddingVertical: 10, fontSize: 16,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  imageFrame: { backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  sale: {
    color: colors.sale, backgroundColor: colors.tint, overflow: 'hidden', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 4, fontSize: 12, fontWeight: '800',
  },
  status: {
    color: colors.leaf, backgroundColor: colors.sage, overflow: 'hidden', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 5, fontSize: 12, fontWeight: '800',
  },
});
