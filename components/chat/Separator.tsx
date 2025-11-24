import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * 会话分割线（仅在历史进入时显示）
 */
export const Separator: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>————</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  text: {
    marginHorizontal: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

