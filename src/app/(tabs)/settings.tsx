import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, MIN_TAP } from '@/constants/status';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { thaiDate } from '@/lib/format';
import { logout, resetAll, useLoans, useNotices, useSession } from '@/lib/store';

export default function SettingsScreen() {
  const session = useSession();
  const loans = useLoans();
  const notices = useNotices();
  const theme = useTheme();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">ตั้งค่า</ThemedText>

          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <MaterialCommunityIcons name="account-circle" size={40} color={Brand.primary} />
            <View style={styles.info}>
              <ThemedText type="smallBold">{session?.username ?? 'ยังไม่ได้เข้าสู่ระบบ'}</ThemedText>
              {session && (
                <ThemedText type="small" themeColor="textSecondary">
                  เข้าสู่ระบบเมื่อ {thaiDate(session.loginAt)}
                </ThemedText>
              )}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.stat}>
              <ThemedText type="title">{loans.length}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                รายการยืมทั้งหมด
              </ThemedText>
            </View>
            <View style={styles.stat}>
              <ThemedText type="title">{notices.length}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                แจ้งเตือน
              </ThemedText>
            </View>
          </View>

          <ThemedText type="small" themeColor="textSecondary">
            แอปนี้เก็บข้อมูลไว้ในเครื่องเท่านั้น ยังไม่มีระบบหลังบ้าน
          </ThemedText>

          <Pressable
            onPress={resetAll}
            accessibilityRole="button"
            accessibilityLabel="ล้างข้อมูลสาธิตทั้งหมด"
            style={({ pressed }) => [
              styles.outlineButton,
              { borderColor: theme.backgroundSelected },
              pressed && styles.pressed,
            ]}>
            <MaterialCommunityIcons name="broom" size={18} color={theme.text} />
            <Text style={[styles.outlineLabel, { color: theme.text }]}>ล้างข้อมูลสาธิต</Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            accessibilityRole="button"
            style={({ pressed }) => [styles.outlineButton, styles.danger, pressed && styles.pressed]}>
            <MaterialCommunityIcons name="logout" size={18} color={Brand.danger} />
            <Text style={[styles.outlineLabel, { color: Brand.danger }]}>ออกจากระบบ</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  scroll: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  info: { flex: 1, gap: Spacing.half },
  stat: { flex: 1, alignItems: 'center', gap: Spacing.half },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 2,
    borderRadius: Spacing.three,
    minHeight: MIN_TAP,
  },
  danger: { borderColor: Brand.danger },
  outlineLabel: { fontWeight: '700', fontSize: 15 },
  pressed: { opacity: 0.7 },
});
