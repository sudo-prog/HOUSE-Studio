import { Feather } from "@expo/vector-icons";
import { useGetFeaturedMaterials, useListMaterials } from "@workspace/api-client-react";
import type { Material } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["Featured", "All"];

function MaterialCard({ item }: { item: Material }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.isFeatured && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: "#fff" }]}>Featured</Text>
          </View>
        )}
      </View>
      <Text style={[styles.cardCategory, { color: colors.mutedForeground }]} numberOfLines={1}>
        {item.category} · {item.localAvailability}
      </Text>
      <View style={styles.tagRow}>
        {(item.tags ?? []).slice(0, 3).map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function MaterialsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState("Featured");
  const featured = useGetFeaturedMaterials();
  const all = useListMaterials();
  const isLoading = tab === "Featured" ? featured.isLoading : all.isLoading;
  const isError = tab === "Featured" ? featured.isError : all.isError;
  const data = tab === "Featured" ? featured.data : all.data;
  const refetch = tab === "Featured" ? featured.refetch : all.refetch;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const materials = (data as Material[] | undefined) ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Materials</Text>
      </View>
      <View style={styles.tabRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.tab,
              { backgroundColor: tab === c ? colors.primary : colors.secondary },
            ]}
            onPress={() => setTab(c)}
          >
            <Text style={[styles.tabText, { color: tab === c ? "#fff" : colors.mutedForeground }]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            Failed to load materials
          </Text>
        </View>
      ) : (
        <FlatList
          data={materials}
          keyExtractor={(m) => String(m.id)}
          renderItem={({ item }) => <MaterialCard item={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="layers" size={40} color={colors.mutedForeground} />
              <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
                No materials
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  tabRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  tabText: { fontSize: 13, fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 6 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: "600", flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  cardCategory: { fontSize: 13 },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 4, flexWrap: "wrap" },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  tagText: { fontSize: 10 },
  errorText: { fontSize: 15 },
});
