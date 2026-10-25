import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutLeft,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, MIN_TAP, StatusStyle } from '@/constants/status';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { countdownText } from '@/lib/format';
import { openLoansOf } from '@/lib/loan-rules';
import { currentUser, findEquipment, useLoans } from '@/lib/store';

export default function MyLoansScreen() {
  const loans = useLoans();
  const theme = useTheme();
  const router = useRouter();
  const now = useNow();
  const reduced = useReducedMotion();
  const held = openLoansOf(currentUser(), loans);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          ของที่ฉันยืม
        </ThemedText>

        <Animated.FlatList
          data={held}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          // หน้าตอนยังไม่มีข้อมูล ต้องมีเสมอเมื่อแสดงรายการ
          ListEmptyComponent={
            <Animated.View
              entering={reduced ? undefined : FadeIn.duration(260)}
              style={styles.empty}>
              <MaterialCommunityIcons name="package-variant" size={44} color={theme.textSecondary} />
              <ThemedText type="smallBold">ยังไม่ได้ยืมอะไร</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                เลือกอุปกรณ์จากหน้ารายการได้เลย
              </ThemedText>
            </Animated.View>
          }
          renderItem={({ item, index }) => {
            const equipment = findEquipment(item.equipmentId);
            const late = item.dueAt < now;
            const extended = item.extension === 'approved';
            return (
              // คืนของแล้วแถวเลื่อนออกทางซ้าย แถวที่เหลือไหลขึ้นแทนที่ ไม่กระตุก
              <Animated.View
                entering={reduced ? undefined : FadeInDown.delay(index * 60).duration(260)}
                exiting={reduced ? undefined : FadeOutLeft.duration(220)}
                layout={reduced ? undefined : LinearTransition.springify().damping(18)}
                style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.head}>
                  {equipment && (
                    <MaterialCommunityIcons name={equipment.icon} size={28} color={theme.text} />
                  )}
                  <View style={styles.info}>
                    <ThemedText type="smallBold">{equipment?.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      S/N: {equipment?.serial}
                    </ThemedText>
                  </View>
                  {/* สถานะมีคำกำกับเสมอ ไม่ได้บอกด้วยสีอย่างเดียว */}
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: late ? StatusStyle.overdue.bg : StatusStyle.borrowed.bg },
                    ]}>
                    <Text
                      style={[
                        styles.badgeText,
                        { color: late ? StatusStyle.overdue.fg : StatusStyle.borrowed.fg },
                      ]}>
                      {countdownText(item.dueAt, now)}
                    </Text>
                  </View>
                </View>

                {extended && (
                  <Text style={[styles.note, { color: theme.textSecondary }]}>
                    ต่อเวลาแล้ว 1 ครั้ง ต่อเพิ่มอีกไม่ได้
                  </Text>
                )}
                {item.extension === 'denied' && (
                  <Text style={[styles.note, { color: Brand.danger }]}>
                    คำขอต่อเวลาถูกปฏิเสธ กรุณานำของมาคืน
                  </Text>
                )}

                <View style={styles.actions}>
                  <Pressable
                    onPress={() => router.push(`/loan/${item.id}/extend`)}
                    disabled={extended}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: extended }}
                    style={({ pressed }) => [
                      styles.outlineButton,
                      extended && styles.disabled,
                      pressed && styles.pressed,
                    ]}>
                    <Text style={[styles.outlineLabel, { color: Brand.primary }]}>ขอต่อเวลา</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push(`/loan/${item.id}/return`)}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.solidButton, pressed && styles.pressed]}>
                    <Text style={styles.solidLabel}>คืนอุปกรณ์</Text>
                  </Pressable>
                </View>
              </Animated.View>
            );
          }}
        />
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
    paddingHorizontal: Spacing.three,
  },
  title: { marginTop: Spacing.three },
  list: { flex: 1, marginTop: Spacing.three },
  listContent: { gap: Spacing.two, paddingBottom: BottomTabInset + Spacing.four },
  row: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  info: { flex: 1, gap: Spacing.half },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.four,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  note: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: Spacing.two },
  outlineButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: Brand.primary,
    borderRadius: Spacing.two,
    minHeight: MIN_TAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineLabel: { fontWeight: '700', fontSize: 14 },
  solidButton: {
    flex: 1,
    backgroundColor: Brand.primary,
    borderRadius: Spacing.two,
    minHeight: MIN_TAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidLabel: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  empty: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.six },
});
