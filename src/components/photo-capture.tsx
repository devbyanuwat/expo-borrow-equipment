import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Brand, MIN_TAP } from '@/constants/status';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * ถ่ายรูปสภาพอุปกรณ์
 *
 * บนเว็บไม่มีกล้องให้เรียกแบบเดียวกับมือถือ จึงเปิดคลังรูปแทน
 * ผู้ใช้ปฏิเสธสิทธิ์ได้เสมอ ต้องบอกว่าทำอะไรต่อ ไม่ใช่เงียบไป
 */
export function PhotoCapture({
  label,
  uri,
  onCaptured,
}: {
  label: string;
  uri: string | null;
  onCaptured: (uri: string) => void;
}) {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);

  async function pick() {
    setError(null);
    try {
      // เว็บเรียกกล้องแบบมือถือไม่ได้ ใช้คลังรูปแทนเพื่อให้ flow เดินต่อได้
      const useCamera = Platform.OS !== 'web';
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError('แอปยังไม่ได้รับสิทธิ์ใช้กล้อง เปิดสิทธิ์ในตั้งค่าเครื่องแล้วลองใหม่');
          return;
        }
      }
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.5 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });

      if (result.canceled) return; // ผู้ใช้กดยกเลิกเอง ไม่ใช่ข้อผิดพลาด
      const picked = result.assets[0]?.uri;
      if (picked) onCaptured(picked);
    } catch (e) {
      console.warn('เปิดกล้องไม่สำเร็จ', e);
      setError('เปิดกล้องไม่สำเร็จ ลองใหม่อีกครั้ง หรือข้ามขั้นตอนนี้ไปก่อน');
    }
  }

  return (
    <View style={styles.wrap}>
      <ThemedText type="smallBold">{label}</ThemedText>

      <Pressable
        onPress={pick}
        accessibilityRole="button"
        accessibilityLabel={uri ? `ถ่ายรูป${label}ใหม่` : `ถ่ายรูป${label}`}
        style={({ pressed }) => [
          styles.box,
          { borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}>
        {uri ? (
          <Image source={{ uri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="camera-outline" size={32} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              แตะเพื่อถ่ายรูป
            </ThemedText>
          </View>
        )}
      </Pressable>

      {uri && (
        <View style={styles.doneRow}>
          <MaterialCommunityIcons name="check-circle" size={16} color={Brand.primary} />
          {/* ไม่บอกผลด้วยสีอย่างเดียว มีคำกำกับเสมอ */}
          <Text style={[styles.doneText, { color: Brand.primary }]}>ถ่ายแล้ว</Text>
        </View>
      )}

      {error && (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  box: {
    height: 150,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: Spacing.three,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TAP,
  },
  pressed: { opacity: 0.75 },
  preview: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', gap: Spacing.one },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  doneText: { fontSize: 13, fontWeight: '600' },
  errorText: { color: Brand.danger, fontSize: 13 },
});
