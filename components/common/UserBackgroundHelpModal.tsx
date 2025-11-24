import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface UserBackgroundHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export const UserBackgroundHelpModal: React.FC<UserBackgroundHelpModalProps> = ({ visible, onClose }) => {
  const { width, height } = Dimensions.get('window');
  
  const modalWidth = Math.min(323, width - 40);
  const modalContainerStyle = {
    position: 'absolute' as const,
    top: Math.max(120, Math.min(180, height * 0.22)),
    left: (width - modalWidth) / 2, // 居中计算
    width: modalWidth,
    height: Math.min(431, height * 0.6),
    borderRadius: 23,
    overflow: 'hidden' as const,
    borderWidth: 0.5, // 减小边框宽度
    borderColor: 'rgba(255, 255, 255, 0.5)', // 使用半透明边框
  };
  
  const buttonGradientStyle = {
    width: Math.max(180, Math.min(226, width * 0.56)),
    height: Math.max(40, Math.min(48, height * 0.058)),
    borderRadius: 24,
    padding: 1,
  };
  
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
            <View style={modalContainerStyle}>
              <View style={styles.modalContent}>
                {/* 主渐变背景 */}
                <LinearGradient
                  colors={['#000000', '#9010A0', '#3A2F80']}
                  locations={[0, 0.35, 0.83]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 23,
                    opacity: 1,
                  }}
                />

                {/* 内容 */}
                <ScrollView
                  style={styles.content}
                  contentContainerStyle={styles.contentContainer}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.sectionTitle}>如何编写背景故事</Text>
                  <Text style={styles.sectionText}>
                    你可以在Beiaoli的个人资料设置中稍后编辑或删除
                  </Text>

                  <Text style={[styles.sectionTitle, styles.sectionTitleMargin]}>
                    保持安全和尊重
                  </Text>
                  <Text style={styles.sectionText}>
                    避免使用冒犯性语言、虐待的引用或性内容以及有害材料。
                  </Text>

                  <Text style={[styles.sectionTitle, styles.sectionTitleMargin]}>
                    保持简短和详细
                  </Text>
                  <Text style={styles.sectionText}>
                    添加关于偏好、个性等的详细信息。使用简短句子并提及NEST以获得最佳效果。
                  </Text>
                </ScrollView>

                {/* 了解按钮 */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 34,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                  }}
                >
                  {/* 外层渐变边框 */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
                    locations={[0, 0.5, 1]}
                    style={buttonGradientStyle}
                  >
                    {/* 内层半透明背景 */}
                    <TouchableOpacity
                      onPress={onClose}
                      activeOpacity={0.8}
                      style={{
                        flex: 1,
                        borderRadius: 24,
                        overflow: 'hidden',
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={styles.understandButtonText}>了解</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    // 样式在组件内部动态生成
  },
  modalContent: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 80,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionTitleMargin: {
    marginTop: 24,
  },
  sectionText: {
    color: '#BFBFBF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  understandButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

