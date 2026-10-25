import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EquipmentCard } from '@/components/equipment-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MIN_TAP } from '@/constants/status';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { statusOf } from '@/lib/loan-rules';
import { EQUIPMENT, useLoans } from '@/lib/store';

export default function EquipmentListScreen() {
  const router = useRouter();
  const loans = useLoans();
  const now = useNow();
  const theme = useTheme();
  const [query, setQuery] = useState('');

  // กรองตามคำค้น ค้นได้ทั้งชื่อและหมายเลขเครื่อง
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EQUIPMENT;
    return EQUIPMENT.filter(
      (e) => e.name.toLowerCase().includes(q) || e.serial.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          อุปกรณ์ในออฟฟิศ
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          ยืมได้ครั้งละ 1 ชิ้น คืนภายใน 3 วัน
        </ThemedText>

        <View
          style={[
            styles.searchRow,
            { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
          ]}>
          <MaterialCommunityIcons name="magnify" size={20} color={theme.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ค้นหาชื่อหรือหมายเลขเครื่อง"
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel="ค้นหาอุปกรณ์"
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="magnify-close" size={44} color={theme.textSecondary} />
              <ThemedText type="smallBold">ไม่พบอุปกรณ์ที่ค้นหา</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                ลองพิมพ์ชื่อให้สั้นลง หรือล้างคำค้น
              </ThemedText>
            </View>
          }
          renderItem={({ item, index }) => (
            <EquipmentCard
              equipment={item}
              status={statusOf(item.id, loans, now)}
              onPress={() => router.push(`/borrow/${item.id}`)}
              index={index}
            />
          )}
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
    gap: Spacing.one,
  },
  title: { marginTop: Spacing.three },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 2,
    marginTop: Spacing.two,
    minHeight: MIN_TAP,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: Spacing.two },
  list: { flex: 1, marginTop: Spacing.two },
  listContent: { gap: Spacing.two, paddingBottom: BottomTabInset + Spacing.four },
  empty: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.six },
});
