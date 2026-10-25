/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  // RN 0.88 (Strict TypeScript API) คืน 'light' | 'dark' | null
  // null เกิดเมื่อระบบยังบอกไม่ได้ว่าเครื่องตั้งโหมดอะไร จึงถือเป็นโหมดสว่าง
  const scheme = useColorScheme();

  return Colors[scheme ?? 'light'];
}
