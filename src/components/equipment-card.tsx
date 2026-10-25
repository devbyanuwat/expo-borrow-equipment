import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { StatusBadge } from './status-badge';
import { ThemedText } from './themed-text';

import { StatusStyle } from '@/constants/status';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Equipment, EquipmentStatus } from '@/lib/types';

type Props = {
  equipment: Equipment;
  status: EquipmentStatus;
  onPress: () => void;
  /** ลำดับในรายการ ใช้หน่วงให้การ์ดเข้าทีละใบ */
  index?: number;
};

export function EquipmentCard({ equipment, status, onPress, index = 0 }: Props) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  // กดแล้วการ์ดยุบลงเล็กน้อย ปล่อยแล้วเด้งกลับ ให้รู้สึกว่าของกดได้จริง
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    // Reanimated 4.7 ขึ้นไป transform ต้องไม่อยู่ View เดียวกับ entering หรือ layout
    // ไม่งั้น animation สองตัวแย่งกันเขียน transform ทับกัน
    // ชั้นนอกคุมการเข้า-ออก ชั้นในคุมการยุบตอนกด
    <Animated.View entering={reduced ? undefined : FadeInDown.delay(index * 60).duration(260)}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          // ทั้งใบคือปุ่มเดียว จึงต้องอ่านออกมาเป็นประโยคเดียว
          // ถ้าไม่ใส่ โปรแกรมอ่านหน้าจอจะเจอแค่ช่องกดได้ที่ไม่มีชื่อ
          accessibilityLabel={`${equipment.name} สถานะ ${StatusStyle[status].label}`}
          accessibilityHint="กดเพื่อดูรายละเอียดและยืม"
          onPressIn={() => {
            scale.set(withSpring(reduced ? 1 : 0.97, { damping: 18, stiffness: 320 }));
          }}
          onPressOut={() => {
            scale.set(withSpring(1, { damping: 14, stiffness: 260 }));
          }}
          style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <MaterialCommunityIcons name={equipment.icon} size={28} color={theme.text} />
          <View style={styles.info}>
            <ThemedText type="smallBold">{equipment.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {equipment.note}
            </ThemedText>
          </View>
          <StatusBadge status={status} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  info: { flex: 1, gap: Spacing.half },
});
