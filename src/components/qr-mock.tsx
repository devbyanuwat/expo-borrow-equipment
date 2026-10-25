import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

/**
 * ลาย QR จำลอง วาดจากข้อความด้วยตัวเลขสุ่มที่คงที่
 *
 * นี่ไม่ใช่ QR code จริง สแกนไม่ได้ ใช้เพื่อให้เห็นหน้าตาของจอเท่านั้น
 * ของจริงต้องใช้ไลบรารีสร้าง QR เช่น react-native-qrcode-svg (ดู design.md ข้อ 7)
 */

const GRID = 21; // QR จริงรุ่นเล็กสุดคือ 21x21 ช่อง ใช้ขนาดเดียวกันให้ดูสมจริง

/** สุ่มแบบคงที่: ข้อความเดิมต้องได้ลายเดิมทุกครั้ง ไม่ใช่เปลี่ยนทุกครั้งที่ render */
function hash(text: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

function isFinderArea(row: number, col: number): boolean {
  // สามมุมของ QR มีสี่เหลี่ยมใหญ่ไว้ให้กล้องจับตำแหน่ง
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= GRID - 7;
  const inBottomLeft = row >= GRID - 7 && col < 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

function finderFilled(row: number, col: number): boolean {
  const r = row < 7 ? row : row - (GRID - 7);
  const c = col < 7 ? col : col - (GRID - 7);
  const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
  return ring === 3 || ring <= 1; // ขอบนอกกับแกนกลางทึบ เว้นวงกลาง
}

export function QrMock({ value, size = 160 }: { value: string; size?: number }) {
  const cell = size / GRID;
  const cells: React.ReactNode[] = [];

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const filled = isFinderArea(row, col)
        ? finderFilled(row, col)
        : hash(`${value}:${row}:${col}`, 7) % 100 < 45;
      if (!filled) continue;
      cells.push(
        <View
          key={`${row}-${col}`}
          style={{
            position: 'absolute',
            left: col * cell,
            top: row * cell,
            width: cell,
            height: cell,
            backgroundColor: '#0f172a',
          }}
        />,
      );
    }
  }

  return (
    <View
      style={[styles.frame, { width: size + Spacing.three, height: size + Spacing.three }]}
      accessibilityRole="image"
      accessibilityLabel={`รหัสสำหรับแสดงเจ้าหน้าที่ หมายเลข ${value}`}>
      <View style={{ width: size, height: size }}>{cells}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#ffffff',
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
