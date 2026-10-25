/**
 * กติกาของคำขอต่อเวลา การจองคิว และการตรวจสภาพตอนคืน
 *
 * แอปนี้ไม่มี server การอนุมัติจึงตัดสินด้วยกติกาในเครื่อง
 * ของจริงต้องให้เจ้าหน้าที่กดอนุมัติผ่านระบบหลังบ้าน (ดู design.md ข้อ 7)
 *
 * แยกไฟล์จาก loan-rules.ts เพราะคนละเรื่อง: อันนั้นคือยืม-คืน อันนี้คือคำขอ
 */

import { DAY_MS } from './loan-rules';
import type { Loan, Notice, Reservation, ReturnCheck } from './types';

/** ต่อเวลาได้ครั้งละกี่วัน */
export const EXTEND_DAYS = 2;

export type ExtendResult =
  | { ok: true; loan: Loan }
  | { ok: false; reason: string };

/**
 * ขอต่อเวลา
 *
 * อนุมัติเมื่อ ยังไม่เลยกำหนด และยังไม่เคยต่อ
 * ไม่อนุมัติเมื่อ เลยกำหนดแล้ว หรือเคยต่อไปแล้ว (ตรงกับจอ "ไม่อนุญาตให้ต่อเวลา")
 *
 * เรียงลำดับการตรวจตามที่ผู้ใช้ควรเห็นเหตุผล: เรื่องที่แก้ไม่ได้ก่อน
 */
export function requestExtension(loan: Loan, now: number): ExtendResult {
  if (loan.returnedAt !== null) {
    return { ok: false, reason: 'รายการนี้คืนของไปแล้ว ต่อเวลาไม่ได้' };
  }
  if (loan.extension === 'approved') {
    return { ok: false, reason: 'ต่อเวลาได้ครั้งเดียวต่อการยืมหนึ่งครั้ง ครั้งนี้ต่อไปแล้ว' };
  }
  if (now > loan.dueAt) {
    return { ok: false, reason: 'เลยกำหนดคืนแล้ว กรุณานำของมาคืนก่อน' };
  }
  return {
    ok: true,
    loan: { ...loan, extension: 'approved', dueAt: loan.dueAt + EXTEND_DAYS * DAY_MS },
  };
}

/** บันทึกคำขอที่ถูกปฏิเสธไว้ด้วย เพื่อให้ผู้ใช้เห็นว่าเคยขอแล้ว */
export function markExtensionDenied(loan: Loan): Loan {
  return { ...loan, extension: 'denied' };
}

/**
 * จองคิวเมื่ออุปกรณ์ถูกคนอื่นยืมอยู่
 * จองซ้ำชิ้นเดิมไม่ได้ กันกดรัว ๆ แล้วได้คิวซ้อน
 */
export function reserve(
  equipmentId: string,
  requester: string,
  existing: Reservation[],
  now: number,
): Reservation[] | null {
  const already = existing.some((r) => r.equipmentId === equipmentId && r.requester === requester);
  if (already) return null;
  return [
    ...existing,
    { id: `res-${now}-${equipmentId}`, equipmentId, requester, createdAt: now },
  ];
}

/** ตัดคิวออกเมื่อได้ยืมแล้ว หรือกดยกเลิก */
export function cancelReservation(
  equipmentId: string,
  requester: string,
  existing: Reservation[],
): Reservation[] {
  return existing.filter((r) => !(r.equipmentId === equipmentId && r.requester === requester));
}

/**
 * บันทึกผลตรวจสภาพตอนคืน
 * ชำรุดจะได้ใบแจ้งค่าปรับกลับไปด้วย ปกติจะไม่มีใบ
 */
export function applyReturnCheck(
  loan: Loan,
  check: Exclude<ReturnCheck, 'pending'>,
  equipmentName: string,
  now: number,
): { loan: Loan; notice: Notice | null } {
  const updated: Loan = { ...loan, returnCheck: check };
  if (check === 'ok') return { loan: updated, notice: null };
  return {
    loan: updated,
    notice: {
      id: `notice-${now}-${loan.id}`,
      kind: 'damaged',
      equipmentId: loan.equipmentId,
      message: `พบความเสียหายของ ${equipmentName} เจ้าหน้าที่จะติดต่อกลับเรื่องค่าปรับ`,
      createdAt: now,
      readAt: null,
    },
  };
}

/** นับใบที่ยังไม่ได้อ่าน ใช้แสดงตัวเลขบนแท็บ */
export function unreadCount(notices: Notice[]): number {
  return notices.filter((n) => n.readAt === null).length;
}
