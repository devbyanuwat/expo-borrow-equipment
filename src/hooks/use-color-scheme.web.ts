import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

/**
 * บนเว็บ หน้าแรกถูก render ที่ server ซึ่งยังไม่รู้ว่าเครื่องผู้ใช้ตั้งโหมดอะไร
 * ถ้าเดาผิดแล้วค่อยแก้ใน useEffect ภาพจะกระพริบ และ React เตือนเรื่อง setState ใน effect
 *
 * useSyncExternalStore แก้ตรงจุดนี้: บอก snapshot ของ server แยกจาก client ได้
 * ทำให้รอบแรกเป็น 'light' เสมอ แล้วสลับตามเครื่องทันทีที่ hydrate เสร็จ
 */
function subscribe(onChange: () => void) {
  const sub = Appearance.addChangeListener(onChange);
  return () => sub.remove();
}

const getSnapshot = () => Appearance.getColorScheme() ?? 'light';
const getServerSnapshot = () => 'light' as const;

export function useColorScheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
