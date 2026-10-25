import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, MIN_TAP } from '@/constants/status';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { login } from '@/lib/store';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    setBusy(true);
    const result = await login(username, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setError(null);
    router.replace('/(tabs)');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <MaterialCommunityIcons name="package-variant-closed" size={56} color={Brand.primary} />
          <ThemedText type="title">ยินดีต้อนรับ</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            ระบบยืมอุปกรณ์ในออฟฟิศ
          </ThemedText>
        </View>

        <View style={styles.form}>
          {/* label ต้องมองเห็น ไม่ใช้ placeholder แทน label */}
          <Text style={[styles.label, { color: theme.text }]} nativeID="label-username">
            ชื่อผู้ใช้
          </Text>
          <TextInput
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              setError(null);
            }}
            placeholder="เช่น somchai"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabelledBy="label-username"
            accessibilityLabel="ชื่อผู้ใช้"
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />

          <Text style={[styles.label, { color: theme.text }]} nativeID="label-password">
            รหัสผ่าน
          </Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError(null);
              }}
              placeholder="อย่างน้อย 4 ตัว"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              accessibilityLabelledBy="label-password"
              accessibilityLabel="รหัสผ่าน"
              aria-invalid={error !== null}
              style={[
                styles.input,
                styles.passwordInput,
                { color: theme.text, borderColor: theme.backgroundSelected },
              ]}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              style={styles.eyeButton}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>

          {/* error ผูกกับฟอร์ม บอกทั้งสิ่งที่ผิดและสิ่งที่ต้องทำต่อ */}
          {error && (
            <View style={styles.errorRow} accessibilityLiveRegion="polite">
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color={Brand.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleLogin}
            disabled={busy}
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              busy && styles.buttonDisabled,
            ]}>
            <Text style={styles.buttonLabel}>{busy ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}</Text>
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            แอปตัวอย่างสำหรับเรียน ยังไม่มีระบบหลังบ้าน กรอกชื่ออะไรก็เข้าได้
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.five,
  },
  hero: { alignItems: 'center', gap: Spacing.two },
  form: { gap: Spacing.two },
  label: { fontSize: 14, fontWeight: '600', marginTop: Spacing.two },
  input: {
    borderWidth: 2,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    minHeight: MIN_TAP,
    fontSize: 16,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, paddingRight: MIN_TAP },
  eyeButton: {
    position: 'absolute',
    right: 0,
    width: MIN_TAP,
    height: MIN_TAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  errorText: { color: Brand.danger, fontSize: 14, flex: 1 },
  button: {
    backgroundColor: Brand.primary,
    borderRadius: Spacing.three,
    minHeight: MIN_TAP,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  buttonDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
  buttonLabel: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  hint: { textAlign: 'center', marginTop: Spacing.two },
});
