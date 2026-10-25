import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoCapture } from '@/components/photo-capture';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, MIN_TAP } from '@/constants/status';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { attachPhoto, findEquipment, recordReturnCheck, returnEquipment, useLoans } from '@/lib/store';

type Step = 'photo' | 'ok' | 'damaged';

export default function ReturnScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const loans = useLoans();
  const [step, setStep] = useState<Step>('photo');

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

  /**
   * บันทึกผลตรวจ
   * แอปนี้ให้ผู้ใช้กดเลือกเองเพื่อให้เห็นทั้งสองทาง
   * ของจริงเจ้าหน้าที่เป็นคนตรวจแล้วบันทึก (ดู design.md ข้อ 7)
   */
  function finish(check: 'ok' | 'damaged') {
    recordReturnCheck(loan!.id, check);
    returnEquipment(loan!.equipmentId);
    setStep(check);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {step === 'photo' && (
            <>
              <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                <MaterialCommunityIcons name={equipment.icon} size={32} color={theme.text} />
                <View style={styles.info}>
                  <ThemedText type="smallBold">{equipment.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    S/N: {equipment.serial}
                  </ThemedText>
                </View>
              </View>

              <ThemedText type="small">
                นำอุปกรณ์มาส่งคืนที่จุดบริการ แล้วถ่ายรูปสภาพก่อนส่งมอบ
              </ThemedText>

              <PhotoCapture
                label="สภาพอุปกรณ์วันคืน"
                uri={loan.photoAfter}
                onCaptured={(uri) => attachPhoto(loan.id, 'after', uri)}
              />

              <View style={styles.checkBox}>
                <ThemedText type="smallBold">ผลการตรวจสภาพโดยเจ้าหน้าที่</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  หน้าจอนี้ให้กดเลือกเองเพื่อสาธิต ของจริงเจ้าหน้าที่เป็นผู้บันทึก
                </ThemedText>

                <Pressable
                  onPress={() => finish('ok')}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
                  <Text style={styles.buttonLabel}>สภาพปกติ คืนสำเร็จ</Text>
                </Pressable>

                <Pressable
                  onPress={() => finish('damaged')}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}>
                  <Text style={styles.buttonLabel}>พบความเสียหาย</Text>
                </Pressable>
              </View>
            </>
          )}

          {step === 'ok' && (
            <View style={styles.result} accessibilityLiveRegion="polite">
              <MaterialCommunityIcons name="check-circle" size={64} color={Brand.primary} />
              <ThemedText type="subtitle">ส่งคืนสำเร็จ</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.resultText}>
                อุปกรณ์อยู่ในสภาพปกติ ยืมชิ้นใหม่ได้เลย
              </ThemedText>
              <Pressable
                onPress={() => router.replace('/(tabs)')}
                accessibilityRole="button"
                style={({ pressed }) => [styles.button, styles.wide, pressed && styles.pressed]}>
                <Text style={styles.buttonLabel}>กลับหน้ารายการอุปกรณ์</Text>
              </Pressable>
            </View>
          )}

          {step === 'damaged' && (
            <View style={styles.result} accessibilityLiveRegion="polite">
              <MaterialCommunityIcons name="close-circle" size={64} color={Brand.danger} />
              <ThemedText type="subtitle">บันทึกความเสียหายแล้ว</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.resultText}>
                ระบบออกใบแจ้งค่าปรับไว้แล้ว ดูได้ที่หน้าแจ้งเตือน
              </ThemedText>
              <Pressable
                onPress={() => router.replace('/(tabs)/notices')}
                accessibilityRole="button"
                style={({ pressed }) => [styles.button, styles.wide, pressed && styles.pressed]}>
                <Text style={styles.buttonLabel}>ดูใบแจ้งค่าปรับ</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
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
  checkBox: { gap: Spacing.two, marginTop: Spacing.two },
  button: {
    backgroundColor: Brand.primary,
    borderRadius: Spacing.three,
    minHeight: MIN_TAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: Brand.danger,
    borderRadius: Spacing.three,
    minHeight: MIN_TAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wide: { alignSelf: 'stretch', marginTop: Spacing.two },
  pressed: { opacity: 0.8 },
  buttonLabel: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  result: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.five },
  resultText: { textAlign: 'center' },
});
