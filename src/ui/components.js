import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const logoSource = require('../../assets/logo.png');

export const SCREEN_GUTTER = 18;

export const theme = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  surface2: '#EEF1F7',
  text: '#0B1220',
  muted: 'rgba(11, 18, 32, 0.6)',
  subtle: 'rgba(11, 18, 32, 0.45)',
  brand: '#22C55E',
  brand2: '#16A34A',
  brandSoft: 'rgba(34, 197, 94, 0.12)',
  ink: '#0B1220',
  inkSoft: 'rgba(11, 18, 32, 0.06)',
  danger: '#EF4444',
  warn: '#F59E0B',
  border: 'rgba(11, 18, 32, 0.08)',
  shadow: 'rgba(11, 18, 32, 0.10)',
};

const COLOR_PRESETS = [
  '#0B1220',
  '#0F766E',
  '#1D4ED8',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#F59E0B',
  '#16A34A',
];

export const CARD_COLOR_PRESETS = COLOR_PRESETS;

/* ----------------------------- hooks --------------------------------- */

function useEntryAnimation({ delay = 0, distance = 12 } = {}) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: 1,
      duration: 480,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, value]);
  return {
    style: {
      opacity: value,
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
      ],
    },
  };
}

function usePressScale({ disabled, target = 0.97 } = {}) {
  const scale = useRef(new Animated.Value(1)).current;
  return {
    scale,
    onPressIn: () => {
      if (disabled) return;
      Animated.spring(scale, { toValue: target, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
    },
    onPressOut: () => {
      if (disabled) return;
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
    },
  };
}

/* --------------------------- visuals --------------------------------- */

export function LogoMark({ size = 44, style, rounded = true }) {
  return (
    <Image
      source={logoSource}
      style={[
        {
          width: size,
          height: size,
          borderRadius: rounded ? Math.round(size * 0.24) : 0,
          backgroundColor: theme.surface,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
}

export function BrandWordmark({ size = 22, color = theme.text, withDot = true }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: size, fontWeight: '900', color, letterSpacing: -0.4 }}>Fidely</Text>
      {withDot ? (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.brand,
            marginLeft: 4,
            marginTop: size * 0.2,
          }}
        />
      ) : null}
    </View>
  );
}

export function Avatar({ name = '', size = 40, color = theme.brand, textColor = '#fff' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: textColor, fontWeight: '900', fontSize: Math.max(12, size * 0.42) }}>
        {initials || '·'}
      </Text>
    </View>
  );
}

export function IconBadge({ label = '·', color = theme.brandSoft, textColor = theme.brand2, size = 44 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: textColor, fontWeight: '900', fontSize: Math.round(size * 0.46) }}>{label}</Text>
    </View>
  );
}

export function Pill({ children, tone = 'default', style }) {
  const tones = {
    default: { bg: theme.inkSoft, fg: theme.text },
    brand: { bg: theme.brandSoft, fg: theme.brand2 },
    danger: { bg: 'rgba(239, 68, 68, 0.10)', fg: theme.danger },
    warn: { bg: 'rgba(245, 158, 11, 0.12)', fg: '#B45309' },
  };
  const t = tones[tone] || tones.default;
  return (
    <View
      style={[
        {
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 999,
          backgroundColor: t.bg,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ color: t.fg, fontWeight: '800', fontSize: 11.5, letterSpacing: 0.2 }}>{children}</Text>
    </View>
  );
}

export function Divider({ style }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: theme.border, marginVertical: 12 }, style]} />;
}

export function SectionTitle({ children, action, style }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 10 }, style]}>
      <Text style={{ fontWeight: '900', color: theme.text, fontSize: 16, letterSpacing: -0.2 }}>{children}</Text>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

export function EmptyState({ icon = '·', title, subtitle }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
      <IconBadge label={icon} size={64} />
      <Text style={{ marginTop: 14, fontWeight: '900', color: theme.text, fontSize: 16 }}>{title}</Text>
      {subtitle ? (
        <Text style={{ marginTop: 6, color: theme.muted, fontSize: 13, textAlign: 'center', paddingHorizontal: 20, lineHeight: 18 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function ProgressBar({ progress = 0, color = theme.brand, height = 9, trackColor = 'rgba(0,0,0,0.08)' }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: Math.min(Math.max(progress, 0), 1),
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, value]);
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: trackColor, overflow: 'hidden' }}>
      <Animated.View
        style={{
          height: '100%',
          backgroundColor: color,
          width: value.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

/** Animated counter that smoothly tweens between numbers. */
export function AnimatedNumber({ value = 0, duration = 600, style }) {
  const anim = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(anim, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value, duration, anim]);
  return <Text style={style}>{display}</Text>;
}

/* --------------------------- inputs ---------------------------------- */

export function Button({ title, onPress, variant = 'primary', disabled, leftIcon, size = 'md', style }) {
  const { scale, onPressIn, onPressOut } = usePressScale({ disabled });
  const sizes = {
    sm: { padV: 10, font: 13.5, radius: 12 },
    md: { padV: 14, font: 15, radius: 16 },
    lg: { padV: 17, font: 16, radius: 18 },
  };
  const s = sizes[size] || sizes.md;
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.btn,
          { paddingVertical: s.padV, borderRadius: s.radius },
          variant === 'secondary' && styles.btnSecondary,
          variant === 'ghost' && styles.btnGhost,
          variant === 'danger' && styles.btnDanger,
          variant === 'dark' && styles.btnDark,
          disabled && styles.btnDisabled,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {leftIcon ? (
            <Text style={{ marginRight: 8, fontSize: s.font + 1, color: variant === 'secondary' || variant === 'ghost' ? theme.text : '#fff', fontWeight: '900' }}>
              {leftIcon}
            </Text>
          ) : null}
          <Text
            style={[
              styles.btnText,
              { fontSize: s.font },
              variant === 'secondary' && styles.btnTextSecondary,
              variant === 'ghost' && styles.btnTextSecondary,
              variant === 'danger' && styles.btnTextDanger,
              variant === 'dark' && styles.btnTextDark,
            ]}
          >
            {title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function IconButton({ label, onPress, disabled, size = 44, tone = 'soft' }) {
  const { scale, onPressIn, onPressOut } = usePressScale({ disabled });
  const tones = {
    soft: { bg: theme.surface2, fg: theme.text, border: theme.border },
    brand: { bg: theme.brand, fg: '#fff', border: 'transparent' },
    dark: { bg: theme.ink, fg: '#fff', border: 'transparent' },
  };
  const t = tones[tone] || tones.soft;
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: t.bg,
          borderWidth: 1,
          borderColor: t.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: t.fg, fontWeight: '900', fontSize: Math.round(size * 0.4) }}>{label}</Text>
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
  leftIcon,
  multiline,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrap,
          focused && { borderColor: theme.brand, backgroundColor: '#fff' },
          multiline && { alignItems: 'flex-start', paddingVertical: 12 },
        ]}
      >
        {leftIcon ? (
          <Text style={{ marginRight: 8, fontSize: 16, color: theme.subtle, fontWeight: '900' }}>{leftIcon}</Text>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(11, 18, 32, 0.35)"
          style={[styles.input, multiline && { minHeight: 72, textAlignVertical: 'top' }]}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

export function SegmentedControl({ value, onChange, options }) {
  return (
    <View style={styles.segmentWrap}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------------------- Card ----------------------------------- */

export function Card({ children, style, animated = true, delay = 0, onPress }) {
  const entry = useEntryAnimation({ delay });
  const wrapperStyle = animated ? entry.style : null;
  const inner = (
    <Animated.View style={[styles.card, wrapperStyle, style]}>{children}</Animated.View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

/* ---------------------- Loyalty card visual ------------------------- */

export function LoyaltyCardView({
  shopName = 'Shop',
  cardColor = '#0B1220',
  logoUrl,
  points = 0,
  rewardAt = 100,
  width = 320,
  showProgress = true,
}) {
  const eligible = points >= rewardAt;
  const mod = points % rewardAt;
  const progress = eligible && mod === 0 ? 1 : mod / rewardAt;
  const ptsToNext = mod === 0 && points === 0 ? rewardAt : mod === 0 && points > 0 ? 0 : rewardAt - mod;

  return (
    <View
      style={{
        width,
        borderRadius: 22,
        padding: 22,
        backgroundColor: cardColor || '#0B1220',
        shadowColor: cardColor || '#0B1220',
        shadowOpacity: 0.25,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 14 },
        elevation: 8,
        overflow: 'hidden',
      }}
    >
      <View style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)' }} />
      <View style={{ position: 'absolute', left: -30, bottom: -50, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)' }} />

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: logoUrl ? 12 : 0 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 }}>
            LOYALTY CARD
          </Text>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 8, letterSpacing: -0.3 }}>
            {shopName}
          </Text>
        </View>
        {logoUrl ? (
          <Image
            source={{ uri: logoUrl }}
            style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)' }}
            resizeMode="contain"
          />
        ) : (
          <LogoMark size={48} />
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 22 }}>
        <AnimatedNumber
          value={points}
          style={{ color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: -1 }}
        />
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '700', marginLeft: 8 }}>
          points
        </Text>
      </View>

      {showProgress ? (
        <View style={{ marginTop: 16 }}>
          <ProgressBar progress={progress} color="#fff" trackColor="rgba(255,255,255,0.18)" height={8} />
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12.5, marginTop: 10, fontWeight: '700' }}>
            {eligible && mod === 0
              ? '🎉 Free reward ready — show this card to redeem'
              : `${ptsToNext} pts until your next free reward`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/* ----------------------------- Screen -------------------------------- */

export function Screen({ title, subtitle, children, scroll = true, contentAlign = 'top', right }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    headerAnim.setValue(0);
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  const headerStyle = {
    opacity: headerAnim,
    transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  };

  const Header = (
    <Animated.View style={[styles.header, headerStyle]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.headerRight}>{right}</View> : null}
      </View>
    </Animated.View>
  );

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.screen}>
          {Header}
          {children}
        </View>
      </SafeAreaView>
    );
  }

  const justifyMain = contentAlign === 'top' ? 'flex-start' : 'center';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        {Header}
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: justifyMain,
            paddingTop: contentAlign === 'top' ? 4 : 24,
            paddingBottom: 36,
          }}
        >
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ----------------------------- styles -------------------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  screen: { flex: 1, paddingHorizontal: SCREEN_GUTTER, backgroundColor: theme.bg },
  header: { paddingTop: 12, paddingBottom: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { marginLeft: 12 },
  title: { fontSize: 26, fontWeight: '900', color: theme.text, letterSpacing: -0.4 },
  subtitle: { marginTop: 6, fontSize: 13.5, color: theme.muted, lineHeight: 19 },

  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 12, color: theme.muted, marginBottom: 6, fontWeight: '800', letterSpacing: 0.2, textTransform: 'uppercase' },
  helper: { marginTop: 6, fontSize: 12, color: theme.muted, lineHeight: 16 },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: theme.surface,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.text,
  },

  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },

  btn: {
    backgroundColor: theme.brand,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: theme.brand2,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  btnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, letterSpacing: 0.2 },
  btnSecondary: { backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border, shadowOpacity: 0, elevation: 0 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 0, shadowOpacity: 0, elevation: 0 },
  btnTextSecondary: { color: theme.text },
  btnDanger: { backgroundColor: theme.danger, shadowColor: theme.danger },
  btnTextDanger: { color: '#FFFFFF' },
  btnDark: { backgroundColor: theme.ink, shadowColor: theme.ink },
  btnTextDark: { color: '#FFFFFF' },
  btnDisabled: { opacity: 0.5 },

  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: theme.surface2,
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#fff',
    shadowColor: theme.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  segmentText: { color: theme.muted, fontWeight: '800', fontSize: 13 },
  segmentTextActive: { color: theme.text },
});
