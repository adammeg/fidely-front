import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const logoSource = require('../../assets/logo.png');

export const SCREEN_GUTTER = 18;

export const theme = {
  bg: '#F6F7FB',
  surface: '#FFFFFF',
  surface2: '#F1F3F8',
  text: '#0F172A',
  muted: 'rgba(15, 23, 42, 0.6)',
  brand: '#22C55E',
  brand2: '#16A34A',
  danger: '#EF4444',
  border: 'rgba(15, 23, 42, 0.10)',
  shadow: 'rgba(15, 23, 42, 0.12)',
};

/** App mark for headers (uses `assets/logo.png`). */
export function LogoMark({ size = 44, style }) {
  return (
    <Image
      source={logoSource}
      style={[
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.22),
          backgroundColor: theme.surface2,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
}

function usePressScale({ disabled }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  };
  const onPressOut = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  };
  return { scale, onPressIn, onPressOut };
}

export function Button({ title, onPress, variant = 'primary', disabled }) {
  const { scale, onPressIn, onPressOut } = usePressScale({ disabled });
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.btn,
        variant === 'secondary' && styles.btnSecondary,
        variant === 'danger' && styles.btnDanger,
        disabled && styles.btnDisabled,
      ]}
    >
      <Text
        style={[
          styles.btnText,
          variant === 'secondary' && styles.btnTextSecondary,
          variant === 'danger' && styles.btnTextDanger,
        ]}
      >
        {title}
      </Text>
      </Pressable>
    </Animated.View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType,
  helperText,
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(15, 23, 42, 0.35)"
        style={styles.input}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/**
 * Vertical layout for scroll screens:
 * - `center`: header stays at the top; main content is vertically centered in the remaining space.
 * - `top`: main content starts immediately under the header (better for long pages).
 */
export function Screen({ title, subtitle, children, scroll = true, contentAlign = 'center', right }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    headerAnim.setValue(0);
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  const headerStyle = {
    opacity: headerAnim,
    transform: [
      {
        translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
      },
    ],
  };

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.screen}>
          <Animated.View style={[styles.header, headerStyle]}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
              {right ? <View style={styles.headerRight}>{right}</View> : null}
            </View>
          </Animated.View>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  const justifyMain = contentAlign === 'top' ? 'flex-start' : 'center';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {right ? <View style={styles.headerRight}>{right}</View> : null}
          </View>
        </Animated.View>

        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: justifyMain,
            // Extra top/bottom padding when centering so the block sits optically centered under the header.
            paddingTop: contentAlign === 'top' ? 6 : 36,
            paddingBottom: contentAlign === 'top' ? 28 : 36,
          }}
        >
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  screen: { flex: 1, paddingHorizontal: SCREEN_GUTTER, backgroundColor: theme.bg },
  header: { paddingTop: 10, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { marginLeft: 12 },
  title: { fontSize: 28, fontWeight: '900', color: theme.text, letterSpacing: -0.2 },
  subtitle: { marginTop: 6, fontSize: 13.5, color: theme.muted, lineHeight: 19 },
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 12, color: theme.muted, marginBottom: 6, fontWeight: '700' },
  helper: { marginTop: 6, fontSize: 12, color: theme.muted, lineHeight: 16 },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.text,
    backgroundColor: theme.surface,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  btn: {
    backgroundColor: theme.brand,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: theme.brand2,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  btnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, letterSpacing: 0.2 },
  btnSecondary: { backgroundColor: theme.surface2, borderWidth: 1, borderColor: 'rgba(15, 23, 42, 0.06)', shadowOpacity: 0, elevation: 0 },
  btnTextSecondary: { color: theme.text },
  btnDanger: { backgroundColor: theme.danger, shadowColor: theme.danger },
  btnTextDanger: { color: '#FFFFFF' },
  btnDisabled: { opacity: 0.5 },
});

