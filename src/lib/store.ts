import { useSyncExternalStore } from 'react';

import { borrow, canBorrow, returnItem, syncLoanIdCounter, type BorrowCheck } from './loan-rules';
import {
  applyReturnCheck,
  cancelReservation,
  markExtensionDenied,
  requestExtension,
  reserve,
} from './request-rules';
import {
  loadLoans,
  loadNotices,
  loadReservations,
  loadSession,
  saveLoans,
  saveNotices,
  saveReservations,
  saveSession,
} from './storage';
import type {
  Equipment,
  EquipmentId,
  Loan,
  Notice,
  Reservation,
  ReturnCheck,
  Session,
} from './types';

/** ผลการยืม สำเร็จแล้วบอก id ของรายการที่เพิ่งสร้าง */
export type BorrowResult = Extract<BorrowCheck, { ok: false }> | { ok: true; loanId: string };


export const EQUIPMENT: Equipment[] = [
  { id: '1', name: 'โน้ตบุ๊ก Dell', icon: 'laptop', note: 'Core i5 / RAM 16GB', serial: 'NB-002288' },
  { id: '2', name: 'โปรเจกเตอร์', icon: 'projector', note: 'Full HD พร้อมสาย HDMI', serial: 'PJ-010455' },
  { id: '3', name: 'สายชาร์จ USB-C', icon: 'usb', note: 'ยาว 2 เมตร 65W', serial: 'UC-230871' },
  { id: '4', name: 'ไมโครโฟน', icon: 'microphone', note: 'สำหรับอัดเสียงหรือประชุม', serial: 'MC-118023' },
  { id: '5', name: 'กล้องเว็บแคม', icon: 'webcam', note: '1080p ออโต้โฟกัส', serial: 'WC-556120' },
  { id: '6', name: 'ลำโพงบลูทูธ', icon: 'speaker', note: 'ใช้ในห้องประชุมเล็ก', serial: 'SP-704399' },
];

export function findEquipment(id: EquipmentId | undefined) {
  return EQUIPMENT.find((e) => e.id === id);
}

export function findLoan(id: string | undefined) {
  return loans.find((l) => l.id === id);
}

/* ------------------------------------------------------------------ */
/* สถานะกลางของแอป เก็บที่เดียว ทุกหน้าจออ่านผ่าน hook ด้านล่าง          */
/* ------------------------------------------------------------------ */

let loans: Loan[] = [];
let session: Session | null = null;
let reservations: Reservation[] = [];
let notices: Notice[] = [];
let ready = false;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** ชื่อผู้ใช้ที่ล็อกอินอยู่ ใช้เป็นเจ้าของรายการยืม */
export function currentUser(): string {
  return session?.username ?? '';
}

/* ------------------------------ โหลด ------------------------------ */

/** โหลดครั้งเดียวตอนเปิดแอป เรียกซ้ำได้ไม่มีผล */
export async function initStore() {
  if (ready) return;
  const [savedLoans, savedSession, savedRes, savedNotices] = await Promise.all([
    loadLoans(),
    loadSession(),
    loadReservations(),
    loadNotices(),
  ]);
  syncLoanIdCounter(savedLoans); // กัน id ใหม่ชนกับของที่โหลดมา
  loans = savedLoans;
  session = savedSession;
  reservations = savedRes;
  notices = savedNotices;
  ready = true;
  emit();
}

export function isReady() {
  return ready;
}

/* ------------------------------ hooks ----------------------------- */

export function useLoans(): Loan[] {
  return useSyncExternalStore(subscribe, () => loans, () => loans);
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, () => session, () => session);
}

export function useReservations(): Reservation[] {
  return useSyncExternalStore(subscribe, () => reservations, () => reservations);
}

export function useNotices(): Notice[] {
  return useSyncExternalStore(subscribe, () => notices, () => notices);
}

export function useReady(): boolean {
  return useSyncExternalStore(subscribe, () => ready, () => ready);
}

/* ------------------------- เข้าสู่ระบบ ---------------------------- */

export type LoginResult = { ok: true } | { ok: false; reason: string };

/**
 * เข้าสู่ระบบ
 *
 * แอปนี้ไม่มี server จึงแค่ตรวจว่ากรอกครบ แล้วจำชื่อไว้แสดงผล
 * ของจริงต้องส่งไปให้ server ตรวจ และเก็บรหัสผ่านเป็น hash เท่านั้น
 */
export async function login(username: string, password: string): Promise<LoginResult> {
  const name = username.trim();
  if (!name) return { ok: false, reason: 'กรุณากรอกชื่อผู้ใช้' };
  if (password.length < 4) return { ok: false, reason: 'รหัสผ่านต้องยาวอย่างน้อย 4 ตัว' };
  session = { username: name, loginAt: Date.now() };
  emit();
  await saveSession(session);
  return { ok: true };
}

export async function logout() {
  session = null;
  emit();
  await saveSession(null);
}

/* --------------------------- ยืม / คืน ---------------------------- */

function setLoans(next: Loan[]) {
  loans = next;
  emit();
  void saveLoans(next);
}

/**
 * ยืมของ ถ้าไม่ผ่านกติกาจะได้เหตุผลกลับไปแสดง
 *
 * สำเร็จแล้วคืน loanId ออกไปด้วย เพราะหน้าจอต้องใช้ผูกรูปและแสดง QR
 * ห้ามให้หน้าจอไปหาเองจาก list ที่ถืออยู่ เพราะ list นั้นเป็นค่าจากรอบ render เดิม
 * ยังไม่มีรายการใหม่ (ดู design.md ข้อ 5)
 */
export function borrowItem(equipmentId: EquipmentId, now = Date.now()): BorrowResult {
  const me = currentUser();
  const check = canBorrow(me, equipmentId, loans, now);
  if (!check.ok) return check;
  const created = borrow(me, equipmentId, now);
  setLoans([...loans, created]);
  // ได้ยืมแล้ว คิวที่จองไว้ไม่ต้องใช้อีก
  setReservations(cancelReservation(equipmentId, me, reservations));
  return { ok: true, loanId: created.id };
}

export function returnEquipment(equipmentId: EquipmentId, now = Date.now()) {
  setLoans(returnItem(equipmentId, loans, now));
}

/** เก็บรูปตอนรับของ หรือตอนคืนของ ลงในรายการยืม */
export function attachPhoto(loanId: string, which: 'before' | 'after', uri: string) {
  setLoans(
    loans.map((l) =>
      l.id === loanId ? { ...l, [which === 'before' ? 'photoBefore' : 'photoAfter']: uri } : l,
    ),
  );
}

/* --------------------------- ต่อเวลา ------------------------------ */

export type ExtendOutcome = { ok: true; newDueAt: number } | { ok: false; reason: string };

export function extendLoan(loanId: string, now = Date.now()): ExtendOutcome {
  const loan = loans.find((l) => l.id === loanId);
  if (!loan) return { ok: false, reason: 'ไม่พบรายการยืมนี้' };

  const result = requestExtension(loan, now);
  if (!result.ok) {
    // จดไว้ว่าเคยขอแล้วไม่ผ่าน ผู้ใช้จะได้เห็นสถานะ ไม่ใช่กดแล้วเงียบ
    setLoans(loans.map((l) => (l.id === loanId ? markExtensionDenied(l) : l)));
    return { ok: false, reason: result.reason };
  }
  setLoans(loans.map((l) => (l.id === loanId ? result.loan : l)));
  return { ok: true, newDueAt: result.loan.dueAt };
}

/* --------------------------- จองคิว ------------------------------- */

function setReservations(next: Reservation[]) {
  reservations = next;
  emit();
  void saveReservations(next);
}

/** จองคิว คืน false เมื่อจองชิ้นนี้ไว้อยู่แล้ว */
export function reserveItem(equipmentId: EquipmentId, now = Date.now()): boolean {
  const next = reserve(equipmentId, currentUser(), reservations, now);
  if (next === null) return false;
  setReservations(next);
  return true;
}

export function hasReserved(equipmentId: EquipmentId): boolean {
  const me = currentUser();
  return reservations.some((r) => r.equipmentId === equipmentId && r.requester === me);
}

/* ----------------------- ตรวจสภาพ / แจ้งเตือน --------------------- */

function setNotices(next: Notice[]) {
  notices = next;
  emit();
  void saveNotices(next);
}

/** บันทึกผลตรวจตอนคืน ชำรุดจะมีใบแจ้งค่าปรับตามมา */
export function recordReturnCheck(
  loanId: string,
  check: Exclude<ReturnCheck, 'pending'>,
  now = Date.now(),
) {
  const loan = loans.find((l) => l.id === loanId);
  if (!loan) return;
  const equipment = findEquipment(loan.equipmentId);
  const { loan: updated, notice } = applyReturnCheck(
    loan,
    check,
    equipment?.name ?? 'อุปกรณ์',
    now,
  );
  setLoans(loans.map((l) => (l.id === loanId ? updated : l)));
  if (notice) setNotices([notice, ...notices]);
}

export function markNoticeRead(id: string, now = Date.now()) {
  setNotices(notices.map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? now } : n)));
}

/** ล้างข้อมูลทั้งหมด ใช้ตอนสอนเพื่อเริ่มสาธิตใหม่ */
export function resetAll() {
  setLoans([]);
  setReservations([]);
  setNotices([]);
}
