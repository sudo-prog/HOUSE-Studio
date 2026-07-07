import { Feather } from "@expo/vector-icons";
import { useListProjects } from "@workspace/api-client-react";
import type { Project } from "@workspace/api-client-react";
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

function ProjectCard({ item, onPress }: { item: Project; onPress: () => void }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.biome && (
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{item.biome}</Text>
          </View>
        )}
      </View>
      {item.description && (
        <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.cardMeta}>
        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
          {item.status} · {item.phase}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useListProjects();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const projects = (data as Project[] | undefined) ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>SolaraForge</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          Regenerative habitat projects
        </Text>
      </View>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            Failed to load projects
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={[styles.retry, { color: colors.primary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => (
            <ProjectCard
              item={item}
              onPress={() => {
                // navigation handled by router; simple alert fallback
                console.log("open project", item.id);
              }}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="home" size={40} color={colors.mutedForeground} />
              <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
                No projects yet
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
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 2 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  headerSub: { fontSize: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  list: { padding: 16, gap: 12 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: "600", flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  cardMeta: { flexDirection: "row" },
  metaText: { fontSize: 12, textTransform: "capitalize" },
  errorText: { fontSize: 15 },
  retry: { fontSize: 14, fontWeight: "600", marginTop: 4 },
});
