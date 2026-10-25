import type { EquipmentId, EquipmentStatus, Loan } from './types';

/** ยืมได้ครั้งละ 1 ชิ้น คืนภายใน 3 วัน ตามโจทย์ที่โหวต */
export const LOAN_DAYS = 3;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** สถานะของอุปกรณ์ชิ้นหนึ่ง ณ เวลาหนึ่ง */
export function statusOf(equipmentId: EquipmentId, loans: Loan[], now: number): EquipmentStatus {
  const open = loans.find((l) => l.equipmentId === equipmentId && l.returnedAt === null);
  if (!open) return 'available';
  return now > open.dueAt ? 'overdue' : 'borrowed';
}

/** รายการที่คนคนนี้ยืมอยู่และยังไม่คืน */
export function openLoansOf(borrower: string, loans: Loan[]): Loan[] {
  return loans.filter((l) => l.borrower === borrower && l.returnedAt === null);
}

export type BorrowCheck = { ok: true } | { ok: false; reason: string };

/**
 * สามทางแยกใน flowchart ที่โหวต เรียงลำดับเดียวกับในภาพ
 *   1. มีของค้างส่งในมือไหม  -> เตือนให้คืนก่อน
 *   2. อุปกรณ์ชิ้นนี้ว่างไหม -> เตือนให้เลือกชิ้นอื่น
 *   3. ผ่านทั้งสองข้อ        -> ยืมได้
 */
export function canBorrow(
  borrower: string,
  equipmentId: EquipmentId,
  loans: Loan[],
  now: number,
): BorrowCheck {
  if (openLoansOf(borrower, loans).length > 0) {
    return { ok: false, reason: 'กรุณานำของเดิมมาคืนก่อนยืมเพิ่ม' };
  }
  if (statusOf(equipmentId, loans, now) !== 'available') {
    return { ok: false, reason: 'ของถูกยืมไปแล้ว กรุณาเลือกชิ้นอื่น' };
  }
  return { ok: true };
}

let nextLoanId = 0;

/**
 * ห้ามใช้ Date.now() เป็น id เพราะยืมสองครั้งในมิลลิวินาทีเดียวกันจะได้ id ซ้ำ
 * ใช้ตัวนับเพิ่มทีละหนึ่งแทน
 */
export function makeLoanId(): string {
  return `loan-${++nextLoanId}`;
}

/** ตั้งตัวนับต่อจากข้อมูลที่โหลดมาจากเครื่อง กัน id ชนกับของเดิม */
export function syncLoanIdCounter(loans: Loan[]) {
  for (const l of loans) {
    const n = Number(l.id.replace('loan-', ''));
    if (Number.isFinite(n) && n > nextLoanId) nextLoanId = n;
  }
}

/** สร้างรายการยืม ผู้เรียกต้องผ่าน canBorrow มาก่อน */
export function borrow(borrower: string, equipmentId: EquipmentId, now: number): Loan {
  return {
    id: makeLoanId(),
    equipmentId,
    borrower,
    borrowedAt: now,
    dueAt: now + LOAN_DAYS * DAY_MS,
    returnedAt: null,
    extension: 'none',
    returnCheck: 'pending',
    photoBefore: null,
    photoAfter: null,
  };
}

/** คืนของ: ปิดรายการที่ยังเปิดอยู่ คืน array ใหม่เสมอ ไม่แก้ของเดิม */
export function returnItem(equipmentId: EquipmentId, loans: Loan[], now: number): Loan[] {
  return loans.map((l) =>
    l.equipmentId === equipmentId && l.returnedAt === null ? { ...l, returnedAt: now } : l,
  );
}

/** เหลืออีกกี่วันถึงกำหนดคืน ติดลบ = เลยกำหนดมาแล้วกี่วัน */
export function daysLeft(dueAt: number, now: number): number {
  return Math.ceil((dueAt - now) / DAY_MS);
}
