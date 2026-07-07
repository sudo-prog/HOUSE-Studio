import React from "react";
import { StyleSheet, View } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.error) {
      return <View style={styles.container}>{this.props.children}</View>;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
