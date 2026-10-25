/**
 * แปลงข้อมูลให้อ่านง่ายสำหรับคนไทย
 *
 * ข้อมูลเก็บเป็นตัวเลขมิลลิวินาทีเสมอ แปลงเป็นข้อความตอนแสดงผลเท่านั้น
 * ถ้าเก็บเป็นข้อความตั้งแต่แรกจะเรียงลำดับและคำนวณวันยาก
 */

const MONTHS_TH = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

/** วันที่แบบไทย เช่น 25 ต.ค. 69 (ปี พ.ศ. สองหลักท้าย) */
export function thaiDate(ms: number): string {
  const d = new Date(ms);
  const year = (d.getFullYear() + 543) % 100;
  return `${d.getDate()} ${MONTHS_TH[d.getMonth()]} ${String(year).padStart(2, '0')}`;
}

/** เวลาแบบ 14:30 */
export function thaiTime(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * นับถอยหลังแบบอ่านรู้เรื่อง
 * เลยกำหนดแล้วต้องบอกว่าเลยมากี่วัน ไม่ใช่โชว์เลขติดลบ
 */
export function countdownText(dueAt: number, now: number): string {
  const diff = dueAt - now;
  const dayMs = 24 * 60 * 60 * 1000;

  if (diff < 0) {
    const late = Math.ceil(-diff / dayMs);
    return `เลยกำหนด ${late} วัน`;
  }
  const days = Math.floor(diff / dayMs);
  const hours = Math.floor((diff % dayMs) / (60 * 60 * 1000));
  if (days > 0) return `เหลืออีก ${days} วัน ${hours} ชม.`;
  if (hours > 0) return `เหลืออีก ${hours} ชม.`;
  const minutes = Math.max(1, Math.floor((diff % (60 * 60 * 1000)) / 60000));
  return `เหลืออีก ${minutes} นาที`;
}
