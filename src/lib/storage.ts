import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Loan, Notice, Reservation, Session } from './types';

const KEYS = {
  loans: 'borrow:loans',
  session: 'borrow:session',
  reservations: 'borrow:reservations',
  notices: 'borrow:notices',
} as const;

/** อ่าน JSON จากเครื่อง ข้อมูลเสียให้คืนค่าเริ่มต้น ไม่ใช่โยน error จนแอปเปิดไม่ขึ้น */
async function readJson<T>(key: string, fallback: T, expectArray: boolean): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback; // ยังไม่เคยบันทึก ถือว่าปกติ ไม่ใช่ข้อผิดพลาด
    const parsed: unknown = JSON.parse(raw);
    if (expectArray && !Array.isArray(parsed)) return fallback;
    return parsed as T;
  } catch (e) {
    console.warn(`อ่าน ${key} ไม่สำเร็จ ใช้ค่าเริ่มต้นแทน`, e);
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`บันทึก ${key} ไม่สำเร็จ`, e);
  }
}

/**
 * เติมฟิลด์ที่เพิ่มมาทีหลังให้ข้อมูลเก่า
 *
 * เครื่องที่เคยใช้แอปเวอร์ชันก่อนจะมี Loan ที่ยังไม่มี extension หรือ photoBefore
 * ถ้าไม่เติมให้ หน้าจอจะอ่านได้ undefined แล้วแสดงผลเพี้ยนโดยไม่ error
 */
function fillMissingFields(raw: Loan[]): Loan[] {
  return raw.map((l) => ({
    ...l,
    extension: l.extension ?? 'none',
    returnCheck: l.returnCheck ?? 'pending',
    photoBefore: l.photoBefore ?? null,
    photoAfter: l.photoAfter ?? null,
  }));
}

export async function loadLoans(): Promise<Loan[]> {
  return fillMissingFields(await readJson<Loan[]>(KEYS.loans, [], true));
}

export async function saveLoans(loans: Loan[]): Promise<void> {
  await writeJson(KEYS.loans, loans);
}

export async function loadSession(): Promise<Session | null> {
  return readJson<Session | null>(KEYS.session, null, false);
}

export async function saveSession(session: Session | null): Promise<void> {
  await writeJson(KEYS.session, session);
}

export async function loadReservations(): Promise<Reservation[]> {
  return readJson<Reservation[]>(KEYS.reservations, [], true);
}

export async function saveReservations(items: Reservation[]): Promise<void> {
  await writeJson(KEYS.reservations, items);
}

export async function loadNotices(): Promise<Notice[]> {
  return readJson<Notice[]>(KEYS.notices, [], true);
}

export async function saveNotices(items: Notice[]): Promise<void> {
  await writeJson(KEYS.notices, items);
}
