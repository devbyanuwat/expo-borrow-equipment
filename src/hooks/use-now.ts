import { useSyncExternalStore } from 'react';

/**
 * เวลาปัจจุบันแบบที่ React ใช้ได้
 *
 * เรียก Date.now() ตรง ๆ ตอน render ไม่ได้ (กฎ purity ของ React) และยังมีบั๊กจริงด้วย:
 * หน้าจอที่ render รอบเดียวจะค้างเวลาเดิมไว้ สถานะ "เลยกำหนด" จะไม่ขึ้นเองจนกดรีเฟรช
 * ตัวนี้เก็บเวลาไว้ที่เดียว เดินนาฬิกาหนึ่งตัว แล้วบอกทุกหน้าจอที่ใช้พร้อมกัน
 */
const TICK_MS = 30_000;

let now = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // เริ่มเดินนาฬิกาเมื่อมีคนใช้คนแรก
  if (timer === null) {
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((fn) => fn());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(onChange);
    // ไม่มีใครใช้แล้ว หยุดนาฬิกา ไม่ปล่อยให้ timer ค้าง
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => now,
  );
}
