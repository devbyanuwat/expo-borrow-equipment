import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoCapture } from '@/components/photo-capture';
import { QrMock } from '@/components/qr-mock';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, MIN_TAP } from '@/constants/status';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { LOAN_DAYS, openLoansOf, statusOf } from '@/lib/loan-rules';
import {
  attachPhoto,
  borrowItem,
  currentUser,
  findEquipment,
  hasReserved,
  reserveItem,
  useLoans,
  useReservations,
} from '@/lib/store';
import { thaiDate } from '@/lib/format';

export default function BorrowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const loans = useLoans();
  useReservations(); // ให้จอวาดใหม่เมื่อคิวเปลี่ยน
  const now = useNow();

  const [loanId, setLoanId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reserved, setReserved] = useState(false);

  const equipment = findEquipment(id);

  if (!equipment) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.center}>
          <ThemedText type="subtitle">ไม่พบอุปกรณ์ชิ้นนี้</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const status = statusOf(equipment.id, loans, now);
  const available = status === 'available';
  const held = openLoansOf(currentUser(), loans);
  const blockedByOwnLoan = held.length > 0 && !loanId;
  const activeLoan = loanId ? loans.find((l) => l.id === loanId) : null;

  function handleBorrow() {
    const result = borrowItem(equipment!.id);
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }
    setMessage(null);
    // ใช้ id ที่ store คืนมา ไม่ไปหาเองจาก loans เพราะ loans เป็นค่าของรอบ render เดิม
    // ยังไม่มีรายการที่เพิ่งสร้าง (เคยพลาดตรงนี้จนจอขึ้นว่ายืมไม่ได้ทั้งที่ยืมสำเร็จแล้ว)
    setLoanId(result.loanId);
  }

  function handleReserve() {
    const ok = reserveItem(equipment!.id);
    setReserved(true);
    setMessage(
      ok
        ? 'บันทึกการจองแล้ว ระบบจะแจ้งเมื่ออุปกรณ์ว่าง'
        : 'คุณจองชิ้นนี้ไว้แล้ว รอคิวได้เลย',
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* ---------- หัวเรื่องอุปกรณ์ ---------- */}
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <MaterialCommunityIcons name={equipment.icon} size={44} color={theme.text} />
            <View style={styles.info}>
              <ThemedText type="subtitle">{equipment.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                S/N: {equipment.serial}
              </ThemedText>
            </View>
            <StatusBadge status={status} />
          </View>

          {/* ---------- เงื่อนไข ---------- */}
          <View style={styles.conditions}>
            <ConditionRow icon="calendar-check" text={`คืนภายใน ${LOAN_DAYS} วัน`} />
            <ConditionRow icon="numeric-1-box-outline" text="ยืมได้ครั้งละ 1 ชิ้น" />
            <ConditionRow icon="alert-outline" text="เลยกำหนดคืนจะต่อเวลาไม่ได้" />
          </View>

          {/* ---------- ยืมไม่ได้: อธิบายและเสนอทางออก ---------- */}
          {!activeLoan && (blockedByOwnLoan || !available) && (
            <View style={[styles.warn, { borderColor: Brand.danger }]}>
              <MaterialCommunityIcons name="alert" size={22} color={Brand.danger} />
              <View style={styles.warnBody}>
                <Text style={styles.warnTitle}>
                  {blockedByOwnLoan ? 'คืนของเดิมก่อนจึงจะยืมเพิ่มได้' : 'ชิ้นนี้ถูกยืมอยู่'}
                </Text>
                <Text style={[styles.warnText, { color: theme.textSecondary }]}>
                  {blockedByOwnLoan
                    ? 'ไปที่หน้า ของที่ฉันยืม แล้วกดคืนรายการเดิม'
                    : 'จองคิวไว้ได้ ระบบจะแจ้งเมื่ออุปกรณ์ว่าง'}
                </Text>
              </View>
            </View>
          )}

          {/* ---------- ยืมสำเร็จ: QR + รูป ---------- */}
          {activeLoan && (
            <View style={styles.success}>
              <View style={styles.successHead}>
                <MaterialCommunityIcons name="check-circle" size={22} color={Brand.primary} />
                <Text style={[styles.successText, { color: Brand.primary }]}>
                  ยืมสำเร็จ กำหนดคืน {thaiDate(activeLoan.dueAt)}
                </Text>
              </View>

              <View style={styles.qrWrap}>
                <QrMock value={activeLoan.id} />
                <ThemedText type="small" themeColor="textSecondary" style={styles.qrHint}>
                  แสดงรหัสนี้ให้เจ้าหน้าที่เพื่อรับเครื่อง
                </ThemedText>
              </View>

              <PhotoCapture
                label="สภาพอุปกรณ์ก่อนรับ"
                uri={activeLoan.photoBefore}
                onCaptured={(uri) => attachPhoto(activeLoan.id, 'before', uri)}
              />

              <Pressable
                onPress={() => router.replace('/(tabs)/my-loans')}
                accessibilityRole="button"
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
                <Text style={styles.buttonLabel}>ไปหน้าของที่ฉันยืม</Text>
              </Pressable>
            </View>
          )}

          {/* ---------- ปุ่มหลัก ---------- */}
          {!activeLoan && (
            <View style={styles.actions}>
              <Pressable
                onPress={handleBorrow}
                disabled={!available || blockedByOwnLoan}
                accessibilityRole="button"
                accessibilityState={{ disabled: !available || blockedByOwnLoan }}
                style={({ pressed }) => [
                  styles.button,
                  (!available || blockedByOwnLoan) && styles.buttonDisabled,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.buttonLabel}>ยืนยันการยืม</Text>
              </Pressable>

              {!available && (
                <Pressable
                  onPress={handleReserve}
                  disabled={reserved || hasReserved(equipment.id)}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: reserved || hasReserved(equipment.id) }}
                  style={({ pressed }) => [
                    styles.outlineButton,
                    (reserved || hasReserved(equipment.id)) && styles.buttonDisabled,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.outlineLabel, { color: Brand.primary }]}>
                    {reserved || hasReserved(equipment.id) ? 'จองคิวแล้ว' : 'จองคิวล่วงหน้า'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {message && (
            <View
              style={[styles.message, { backgroundColor: theme.backgroundElement }]}
              accessibilityLiveRegion="polite">
              <ThemedText type="small">{message}</ThemedText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ConditionRow({ icon, text }: { icon: 'calendar-check' | 'numeric-1-box-outline' | 'alert-outline'; text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.conditionRow}>
      <MaterialCommunityIcons name={icon} size={18} color={theme.textSecondary} />
      <ThemedText type="small">{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  scroll: { padding: Spacing.three, gap: Spacing.three },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  info: { flex: 1, gap: Spacing.half },
  conditions: { gap: Spacing.two },
  conditionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  warn: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderWidth: 2,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  warnBody: { flex: 1, gap: Spacing.half },
  warnTitle: { fontWeight: '700', fontSize: 15, color: '#991b1b' },
  warnText: { fontSize: 13 },
  success: { gap: Spacing.three },
  successHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  successText: { fontWeight: '700', fontSize: 15, flex: 1 },
  qrWrap: { alignItems: 'center', gap: Spacing.two },
  qrHint: { textAlign: 'center' },
  actions: { gap: Spacing.two },
  button: {
    backgroundColor: Brand.primary,
    borderRadius: Spacing.three,
    minHeight: MIN_TAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  buttonLabel: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  outlineButton: {
    borderWidth: 2,
    borderColor: Brand.primary,
    borderRadius: Spacing.three,
    minHeight: MIN_TAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineLabel: { fontWeight: '700', fontSize: 15 },
  message: { borderRadius: Spacing.three, padding: Spacing.three },
});
