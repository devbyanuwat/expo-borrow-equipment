import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { StatusStyle } from '@/constants/status';
import { Spacing } from '@/constants/theme';
import type { EquipmentStatus } from '@/lib/types';

export function StatusBadge({ status }: { status: EquipmentStatus }) {
  const s = StatusStyle[status];
  // ผู้ใช้ที่ตั้งค่า "ลดการเคลื่อนไหว" ในเครื่อง ต้องได้แอปที่นิ่ง
  const reduced = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    // เลยกำหนดคืน = เต้นเบา ๆ วนไป ให้สายตาจับได้ก่อนสถานะอื่น
    if (status === 'overdue' && !reduced) {
      pulse.set(
        withRepeat(
          withSequence(withTiming(1.08, { duration: 600 }), withTiming(1, { duration: 600 })),
          -1,
        ),
      );
      return;
    }
    pulse.set(withTiming(1, { duration: 150 }));
  }, [status, reduced, pulse]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: pulse.get() }] }));

  return (
    <Animated.View style={[styles.badge, { backgroundColor: s.bg }, style]}>
      <Text style={[styles.label, { color: s.fg }]}>{s.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.four,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
