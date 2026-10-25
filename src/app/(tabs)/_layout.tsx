import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { Brand } from '@/constants/status';
import { unreadCount } from '@/lib/request-rules';
import { useNotices } from '@/lib/store';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** พารามิเตอร์ที่แถบแท็บส่งให้ tabBarIcon ดึงจาก type ของ Tabs เองเพื่อไม่ต้องเดา */
type TabOptions = Extract<ComponentProps<typeof Tabs.Screen>['options'], { tabBarIcon?: unknown }>;
type TabIconProps = Parameters<NonNullable<TabOptions['tabBarIcon']>>[0];

/**
 * ไอคอนของแถบแท็บ
 *
 * ตั้งแต่ RN 0.88 (Strict TypeScript API) สีที่แถบแท็บส่งมาเป็นได้ทั้ง
 * string, number (สีที่ประมวลผลแล้ว) และ null ส่วนไอคอนรับได้แค่ string
 * ของจริงแถบแท็บส่ง string เสมอ ที่เหลือจึงให้ไอคอนใช้สีเริ่มต้นแทน
 *
 * เขียนเป็นฟังก์ชันเดียวไว้ตรงนี้ จะได้ไม่ต้องแปะ ?? undefined ซ้ำทุกแท็บ
 */
function tabIcon(name: IconName) {
  function TabBarIcon({ color, size }: TabIconProps) {
    return (
      <MaterialCommunityIcons
        name={name}
        size={size}
        color={typeof color === 'string' ? color : undefined}
      />
    );
  }
  return TabBarIcon;
}

// ไฟล์ src/app/(tabs)/_layout.tsx = ตัวตั้งแถบแท็บ ครอบแค่หน้าที่อยู่ใน (tabs)/
export default function TabsLayout() {
  const notices = useNotices();
  const unread = unreadCount(notices);

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Brand.primary }}>
      {/* name = ชื่อไฟล์ (ไม่ใส่ .tsx) */}
      <Tabs.Screen
        name="index"
        options={{ title: 'อุปกรณ์', tabBarIcon: tabIcon('format-list-bulleted') }}
      />
      <Tabs.Screen
        name="my-loans"
        options={{ title: 'ของที่ฉันยืม', tabBarIcon: tabIcon('clipboard-check-outline') }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          title: 'แจ้งเตือน',
          // ตัวเลขบนแท็บบอกจำนวนที่ยังไม่ได้อ่าน
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarIcon: tabIcon('bell-outline'),
        }}
      />
      <Tabs.Screen name="settings" options={{ title: 'ตั้งค่า', tabBarIcon: tabIcon('cog-outline') }} />
    </Tabs>
  );
}
