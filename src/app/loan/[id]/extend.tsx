import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, MIN_TAP } from '@/constants/status';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { countdownText, thaiDate } from '@/lib/format';
import { EXTEND_DAYS } from '@/lib/request-rules';
import { extendLoan, findEquipment, useLoans } from '@/lib/store';

type Outcome = { kind: 'approved'; newDueAt: number } | { kind: 'denied'; reason: string };

export default function ExtendScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const loans = useLoans();
  const now = useNow();

  const [reason, setReason] = useState('');
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const loan = loans.find((l) => l.id === id);
  const equipment = loan ? findEquipment(loan.equipmentId) : undefined;

  if (!loan || !equipment) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.center}>
          <ThemedText type="subtitle">ไม่พบรายการยืมนี้</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  function handleSubmit() {
    const result = extendLoan(loan!.id);
    setOutcome(
      result.ok
        ? { kind: 'approved', newDueAt: result.newDueAt }
        : { kind: 'denied', reason: result.reason },
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <MaterialCommunityIcons name={equipment.icon} size={32} color={theme.text} />
          <View style={styles.info}>
            <ThemedText type="smallBold">{equipment.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {/* หลังอนุมัติ loan.dueAt เลื่อนไปแล้ว คำว่า "เดิม" จะกลายเป็นคำโกหก */}
              {outcome?.kind === 'approved' ? 'กำหนดคืนใหม่ ' : 'กำหนดคืน '}
              {thaiDate(loan.dueAt)} · {countdownText(loan.dueAt, now)}
            </ThemedText>
          </View>
        </View>

        {/* ---------- ยังไม่ได้ส่งคำขอ ---------- */}
        {!outcome && (
          <View style={styles.form}>
            <ThemedText type="small">
              ขอต่อเวลาได้ครั้งละ {EXTEND_DAYS} วัน และต่อได้ครั้งเดียวต่อการยืมหนึ่งครั้ง
            </ThemedText>

            <Text style={[styles.label, { color: theme.text }]} nativeID="label-reason">
              เหตุผล (ไม่บังคับ)
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="เช่น ใช้งานยังไม่เสร็จ"
              placeholderTextColor={theme.textSecondary}
              multiline
              accessibilityLabelledBy="label-reason"
              accessibilityLabel="เหตุผลที่ขอต่อเวลา"
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />

            <Pressable
              onPress={handleSubmit}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <Text style={styles.buttonLabel}>ส่งคำขอ</Text>
            </Pressable>
          </View>
        )}

        {/* ---------- อนุมัติ ---------- */}
        {outcome?.kind === 'approved' && (
          <View style={styles.result} accessibilityLiveRegion="polite">
            <MaterialCommunityIcons name="check-circle" size={56} color={Brand.primary} />
            <ThemedText type="subtitle">ต่อเวลาสำเร็จ</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.resultText}>
              ได้รับเวลาเพิ่ม {EXTEND_DAYS} วัน กำหนดคืนใหม่คือ {thaiDate(outcome.newDueAt)}
            </ThemedText>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, styles.wide, pressed && styles.pressed]}>
              <Text style={styles.buttonLabel}>กลับหน้ารายการ</Text>
            </Pressable>
          </View>
        )}

        {/* ---------- ไม่อนุมัติ: บอกเหตุผลและสิ่งที่ต้องทำต่อ ---------- */}
        {outcome?.kind === 'denied' && (
          <View style={styles.result} accessibilityLiveRegion="polite">
            <MaterialCommunityIcons name="alert-circle" size={56} color={Brand.danger} />
            <ThemedText type="subtitle">ไม่อนุญาตให้ต่อเวลา</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.resultText}>
              {outcome.reason}
            </ThemedText>
            <Pressable
              onPress={() => router.replace(`/loan/${loan.id}/return`)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, styles.wide, pressed && styles.pressed]}>
              <Text style={styles.buttonLabel}>ไปหน้าคืนอุปกรณ์</Text>
            </Pressable>
          </View>
        )}
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
    padding: Spacing.three,
    gap: Spacing.three,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  info: { flex: 1, gap: Spacing.half },
  form: { gap: Spacing.two },
  label: { fontSize: 14, fontWeight: '600', marginTop: Spacing.two },
  input: {
    borderWidth: 2,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    minHeight: 88,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Brand.primary,
    borderRadius: Spacing.three,
    minHeight: MIN_TAP,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  wide: { alignSelf: 'stretch' },
  pressed: { opacity: 0.8 },
  buttonLabel: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  result: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.five },
  resultText: { textAlign: 'center' },
});
