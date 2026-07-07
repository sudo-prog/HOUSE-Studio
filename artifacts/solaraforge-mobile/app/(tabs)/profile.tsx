import { Feather } from "@expo/vector-icons";
import { useHealthCheck } from "@workspace/api-client-react";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useHealthCheck();

  const status = (data as { status?: string } | undefined)?.status ?? "unknown";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Feather name="sun" size={20} color={colors.primary} />
          <Text style={[styles.label, { color: colors.foreground }]}>SolaraForge</Text>
        </View>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          AI-powered regenerative habitat designer
        </Text>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>API status</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={[styles.pill, { backgroundColor: status === "ok" ? colors.primary : colors.secondary }]}>
              <Text style={[styles.pillText, { color: status === "ok" ? "#fff" : colors.mutedForeground }]}>
                {status}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  card: { margin: 16, borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { fontSize: 18, fontWeight: "700" },
  sub: { fontSize: 13 },
  divider: { height: 1, backgroundColor: "rgba(150,150,150,0.2)" },
  meta: { fontSize: 14 },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  pillText: { fontSize: 12, fontWeight: "600" },
});
