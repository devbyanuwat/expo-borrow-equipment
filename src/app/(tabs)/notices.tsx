import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, StatusStyle } from '@/constants/status';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { thaiDate, thaiTime } from '@/lib/format';
import { markNoticeRead, useNotices } from '@/lib/store';

export default function NoticesScreen() {
  const notices = useNotices();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          แจ้งเตือน
        </ThemedText>

        <FlatList
          data={notices}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="bell-outline" size={44} color={theme.textSecondary} />
              <ThemedText type="smallBold">ยังไม่มีแจ้งเตือน</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                ใบแจ้งค่าปรับและข้อความจากเจ้าหน้าที่จะมาอยู่ที่นี่
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => {
            const unread = item.readAt === null;
            return (
              <Pressable
                onPress={() => markNoticeRead(item.id)}
                accessibilityRole="button"
                accessibilityLabel={unread ? 'ทำเครื่องหมายว่าอ่านแล้ว' : 'อ่านแล้ว'}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <MaterialCommunityIcons
                  name={item.kind === 'damaged' ? 'alert-octagon' : 'clock-alert-outline'}
                  size={26}
                  color={Brand.danger}
                />
                <View style={styles.info}>
                  <View style={styles.headRow}>
                    <ThemedText type="smallBold">
                      {item.kind === 'damaged' ? 'ใบแจ้งค่าปรับ' : 'เลยกำหนดคืน'}
                    </ThemedText>
                    {/* ไม่ได้บอกสถานะด้วยสีอย่างเดียว มีคำว่า ใหม่ กำกับ */}
                    {unread && (
                      <View style={[styles.badge, { backgroundColor: StatusStyle.overdue.bg }]}>
                        <Text style={[styles.badgeText, { color: StatusStyle.overdue.fg }]}>ใหม่</Text>
                      </View>
                    )}
                  </View>
                  <ThemedText type="small">{item.message}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {thaiDate(item.createdAt)} {thaiTime(item.createdAt)}
                  </ThemedText>
                </View>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
  },
  title: { marginTop: Spacing.three },
  list: { flex: 1, marginTop: Spacing.three },
  listContent: { gap: Spacing.two, paddingBottom: BottomTabInset + Spacing.four },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  info: { flex: 1, gap: Spacing.half },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.four,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  empty: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.six },
});
