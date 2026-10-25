import type { EquipmentStatus } from '@/lib/types';

/**
 * สีของแต่ละสถานะ เก็บไว้ที่เดียว แก้ที่นี่เปลี่ยนทั้งแอป
 * ตั้งชื่อตามหน้าที่ ไม่ใช่ตามสี เพราะวันหนึ่งสีอาจเปลี่ยน
 * ทุกคู่สีวัด contrast แล้วผ่าน WCAG AA (ดูตัวเลขใน design.md)
 */
export const StatusStyle: Record<EquipmentStatus, { label: string; bg: string; fg: string }> = {
  available: { label: 'ว่าง', bg: '#dcfce7', fg: '#166534' },
  borrowed: { label: 'ถูกยืม', bg: '#fef3c7', fg: '#92400e' },
  overdue: { label: 'เลยกำหนด', bg: '#fee2e2', fg: '#991b1b' },
};

export const Brand = {
  /**
   * สีแบรนด์สำหรับงานที่มีตัวหนังสือ ตัวอักษรขาวบนพื้นนี้ได้ contrast 5.47 ผ่าน AA
   * เดิมใช้ #0d9488 ซึ่งได้แค่ 3.74 ตัวหนังสือขาวบนพื้นนั้นอ่านยากเกินเกณฑ์
   */
  primary: '#0f766e',
  /** ใช้กับขอบและไอคอนตกแต่งเท่านั้น ห้ามใช้กับตัวหนังสือขนาดเล็ก */
  primaryTint: '#0d9488',
  danger: '#dc2626',
};

/** ขนาดจุดกดขั้นต่ำตามเกณฑ์ Apple เข้มกว่า WCAG จึงใช้ค่านี้ */
export const MIN_TAP = 44;
