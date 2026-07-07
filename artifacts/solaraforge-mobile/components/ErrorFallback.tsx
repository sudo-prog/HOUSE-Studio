import React from "react";
import { Text, View, StyleSheet } from "react-native";

import { useColors } from "@/hooks/useColors";

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        Something went wrong
      </Text>
      <Text style={[styles.message, { color: colors.mutedForeground }]}>
        {error?.message ?? "An unexpected error occurred."}
      </Text>
      {onRetry && (
        <Text style={[styles.retry, { color: colors.primary }]} onPress={onRetry}>
          Tap to retry
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 18, fontWeight: "700" },
  message: { fontSize: 14, textAlign: "center" },
  retry: { fontSize: 14, fontWeight: "600", marginTop: 8 },
});
