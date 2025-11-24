import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

const DangerIcon = require('../../assets/Danger.png');

/**
 * 登录错误提示弹窗（统一使用 Danger 图标）
 */
export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = '操作失败',
  message,
  onClose,
  duration = 15000,
}) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.cardContainer}>
              <LinearGradient
                colors={['#5C5D63', '#3C3D43', '#303138']}
                start={{ x: 0.1, y: 0.1 }}
                end={{ x: 0.9, y: 0.9 }}
                style={styles.cardGradient}
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.06)', 'rgba(0,0,0,0.3)']}
                start={{ x: 0.25, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={styles.cardHighlight}
              />
              <View>
                <Image source={DangerIcon} style={{ marginBottom: 8 }} />
              </View>
              <Text style={styles.title}>{message}</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  cardContainer: {
    width: 164,
    height: 164,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 18,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
  },
  cardHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});


