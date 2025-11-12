import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();
  return (
    <ImageBackground
      source={require('../assets/background.png')}
      resizeMode="cover"
      style={styles.container}
    >
      <Text style={styles.title}>欢迎使用 NEST</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/settings')}>
        <Text style={styles.buttonText}>主页</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
        <Text style={styles.buttonText}>去登录</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/plan')}>
        <Text style={styles.buttonText}>跳过，直接进入</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 48,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
