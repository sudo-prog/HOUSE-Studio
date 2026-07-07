import { Feather } from "@expo/vector-icons";
import { useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function ProjectDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const id = String(params.id ?? "");
  const projectId = Number(id);
  const { data, isLoading, isError } = useGetProject(projectId, {
    query: { queryKey: getGetProjectQueryKey(projectId), enabled: !!projectId, retry: false },
  });

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Project not found</Text>
      </View>
    );
  }

  const project = data as {
    name: string;
    description?: string;
    biome?: string;
    phase?: string;
    status?: string;
    solarScore?: number | null;
    estimatedCost?: number | null;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 12, padding: 20, gap: 16 }}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>{project.name}</Text>
      {project.description && (
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>{project.description}</Text>
      )}
      <View style={[styles.statRow]}>
        <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Biome</Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{project.biome ?? "—"}</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Phase</Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{project.phase ?? "—"}</Text>
        </View>
      </View>
      <View style={[styles.statRow]}>
        <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Solar score</Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {project.solarScore ?? "—"}
          </Text>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Est. cost</Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {project.estimatedCost != null ? `$${project.estimatedCost}` : "—"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "700" },
  desc: { fontSize: 15, lineHeight: 22 },
  statRow: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, gap: 4 },
  statLabel: { fontSize: 12, textTransform: "uppercase" },
  statValue: { fontSize: 18, fontWeight: "600" },
  errorText: { fontSize: 15 },
});
