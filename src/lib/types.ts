/** โครงข้อมูลของแอปยืมของ มาจาก flowchart ที่โหวตในชั้นเรียน */

import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

export type EquipmentId = string;

/** ชื่อ icon ของ MaterialCommunityIcons พิมพ์ผิดแล้ว TypeScript ฟ้องทันที */
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type Equipment = {
  id: EquipmentId;
  name: string;
  icon: IconName;
  note: string;
  /** หมายเลขเครื่อง ของจริงหนึ่งชิ้นมีเลขเดียว ใช้ยืนยันว่ารับคืนถูกชิ้น */
  serial: string;
};

/** สถานะคำขอต่อเวลา ดูผังใน design.md */
export type ExtensionState = 'none' | 'pending' | 'approved' | 'denied';

/** สถานะการตรวจสภาพตอนคืน */
export type ReturnCheck = 'pending' | 'ok' | 'damaged';

export type Loan = {
  id: string;
  equipmentId: EquipmentId;
  borrower: string;
  /** เก็บเวลาเป็นตัวเลข (มิลลิวินาที) เรียงและเทียบง่ายกว่าเก็บเป็นข้อความ */
  borrowedAt: number;
  dueAt: number;
  /** null = ยังไม่คืน */
  returnedAt: number | null;
  /** คำขอต่อเวลา เริ่มที่ none ทุกครั้งที่ยืมใหม่ */
  extension: ExtensionState;
  /** ผลตรวจสภาพ มีค่าเมื่อคืนแล้วเท่านั้น */
  returnCheck: ReturnCheck;
  /** รูปตอนรับของ เก็บเป็น URI ในเครื่อง null = ยังไม่ได้ถ่าย */
  photoBefore: string | null;
  /** รูปตอนคืนของ */
  photoAfter: string | null;
};

export type EquipmentStatus = 'available' | 'borrowed' | 'overdue';

/**
 * ผู้ใช้ที่เข้าสู่ระบบอยู่
 * แอปนี้ไม่มี server จึงเก็บแค่ชื่อไว้แสดงผล ไม่ได้เก็บรหัสผ่าน
 */
export type Session = {
  username: string;
  loginAt: number;
};

/** การจองคิวเมื่ออุปกรณ์ถูกคนอื่นยืมอยู่ */
export type Reservation = {
  id: string;
  equipmentId: EquipmentId;
  requester: string;
  createdAt: number;
};

/** ใบแจ้งเตือน เช่น ค่าปรับของชำรุด หรือเลยกำหนดคืน */
export type Notice = {
  id: string;
  kind: 'damaged' | 'overdue';
  equipmentId: EquipmentId;
  message: string;
  createdAt: number;
  readAt: number | null;
};
