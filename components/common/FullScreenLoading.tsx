import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

interface FullScreenLoadingProps {
  visible: boolean;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});

