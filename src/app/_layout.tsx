import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { initStore, useReady, useSession } from '@/lib/store';

SplashScreen.preventAutoHideAsync();

/**
 * พาไปหน้า login เมื่อยังไม่ได้เข้าสู่ระบบ และพาออกจาก login เมื่อเข้าแล้ว
 *
 * ต้องรอให้อ่านข้อมูลจากเครื่องเสร็จก่อน (useReady) ไม่งั้นจะเด้งไป login
 * ทุกครั้งที่เปิดแอป ทั้งที่ผู้ใช้เคยล็อกอินค้างไว้
 */
function useAuthRedirect() {
  const session = useSession();
  const ready = useReady();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const onLoginScreen = segments[0] === 'login';
    if (!session && !onLoginScreen) {
      router.replace('/login');
    } else if (session && onLoginScreen) {
      router.replace('/(tabs)');
    }
  }, [ready, session, segments, router]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // อ่านข้อมูลที่เก็บไว้ในเครื่อง ครั้งเดียวตอนเปิดแอป
  useEffect(() => {
    void initStore();
  }, []);

  useAuthRedirect();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* เปิดซ้อนขึ้นมาแบบ Stack จึงกดย้อนกลับได้ */}
        <Stack.Screen name="borrow/[id]" options={{ title: 'ยืนยันการยืม' }} />
        <Stack.Screen name="loan/[id]/extend" options={{ title: 'ขอต่อเวลา' }} />
        <Stack.Screen name="loan/[id]/return" options={{ title: 'คืนอุปกรณ์' }} />
      </Stack>
    </ThemeProvider>
  );
}
