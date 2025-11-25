import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { GlassContainer } from '@/components/common/GlassContainer';
import { LinearGradient } from 'expo-linear-gradient';

interface CloseConfirmModalProps {
  visible: boolean;
  onReturn: () => void; // 返回（关闭弹窗，留在当前页）
  onClose: () => void; // 关闭（放弃草稿，返回列表页）
  onSave?: () => void; // 保存（可选，用于新增记忆页面）
  onDelete?: () => void; // 删除（可选，用于修改记忆页面）
}

/**
 * 关闭确认弹窗（通用于添加/修改记忆页面）
 */
export const CloseConfirmModal: React.FC<CloseConfirmModalProps> = ({
  visible,
  onReturn,
  onClose,
  onSave,
  onDelete,
}) => {
  // 如果有 onDelete 回调，使用删除确认设计（修改记忆页面）
  if (onDelete) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onReturn}
      >
        <TouchableOpacity
          style={styles.overlayNew}
          activeOpacity={1}
          onPress={onReturn}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContainerDelete}>
              {/* 内容 */}
              <View style={styles.contentNewDelete}>
                {/* 文本分成两层 */}
                <View style={styles.textContainer}>
                  <Text style={styles.textLine1}>删除这条记忆？</Text>
                  <Text style={styles.textLine2}>此操作将使NEST忘记与该主题相关的所有信息。</Text>
                </View>
                
                {/* 按钮容器 */}
                <View style={styles.buttonContainerNew}>
                  {/* 删除按钮 - 红色背景 */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={onDelete}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteButtonText}>删除</Text>
                  </TouchableOpacity>
                  
                  {/* 取消按钮 - 玻璃背景 */}
                  <TouchableOpacity
                    style={styles.leaveButton}
                    onPress={onReturn}
                    activeOpacity={0.8}
                  >
                    <GlassContainer
                      borderRadius={24}
                      intensity={5}
                      tint="light"
                      style={styles.leaveButtonGlass}
                    >
                      <Text style={styles.leaveButtonText}>取消</Text>
                    </GlassContainer>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  // 如果有 onSave 回调，使用新的设计（新增记忆页面）
  if (onSave) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onReturn}
      >
        <TouchableOpacity
          style={styles.overlayNew}
          activeOpacity={1}
          onPress={onReturn}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContainerNew}>
              {/* 内容 */}
              <View style={styles.contentNew}>
                {/* 文本分成两层 */}
                <View style={styles.textContainer}>
                  <Text style={styles.textLine1}>您还没有保存修改，</Text>
                  <Text style={styles.textLine2}>确定现在离开吗？</Text>
                </View>
                
                {/* 按钮容器 */}
                <View style={styles.buttonContainerNew}>
                  {/* 保存按钮 - 使用name页面的下一步按钮样式 */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
                    locations={[0, 0.5, 1]}
                    style={styles.saveButtonGradient}
                  >
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={onSave}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.saveButtonText}>保存</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                  
                  {/* 离开按钮 - 玻璃背景 */}
                  <TouchableOpacity
                    style={styles.leaveButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <GlassContainer
                      borderRadius={24}
                      intensity={5}
                      tint="light"
                      style={styles.leaveButtonGlass}
                    >
                      <Text style={styles.leaveButtonText}>离开</Text>
                    </GlassContainer>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  // 原有的设计（修改记忆页面）
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onReturn}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onReturn}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <GlassContainer
            borderRadius={18}
            intensity={20}
            tint="dark"
            style={styles.modalContainer}
          >
            {/* 内容 */}
            <View style={styles.content}>
              <Text style={styles.title}>关闭而不保存？</Text>
              <Text style={styles.description}>
                如果现在关闭，所有未保存的修改都将丢失。
              </Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.returnButton}
                  onPress={onReturn}
                >
                  <Text style={styles.returnButtonText}>返回</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Text style={styles.closeButtonText}>关闭</Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlassContainer>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayNew: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 250,
  },
  // 原有样式（修改记忆页面）
  modalContainer: {
    width: 300,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  content: {
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  returnButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  returnButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // 新样式（新增记忆页面）
  modalContainerNew: {
    width: 282,
    height: 249,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(240, 240, 240, 0.3)',
  },
  // 删除确认弹窗样式
  modalContainerDelete: {
    width: 282,
    height: 282,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(80, 80, 80, 1)', // 深灰色，模拟 #000 50% 的视觉效果但完全不透明
  },
  contentNew: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 37,
    paddingBottom: 33,
    backgroundColor: 'transparent',
  },
  contentNewDelete: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 37,
    paddingBottom: 33,
    backgroundColor: 'transparent',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 34,
  },
  textLine1: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  textLine2: {
    fontSize: 12,
    color: '#BFBFBF',
    textAlign: 'center',
  },
  buttonContainerNew: {
    gap: 12,
    alignItems: 'center',
  },
  saveButtonGradient: {
    width: 226,
    height: 48,
    borderRadius: 24,
    padding: 1,
  },
  saveButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  leaveButton: {
    width: 226,
    height: 48,
  },
  leaveButtonGlass: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // 删除按钮样式（删除确认弹窗）
  deleteButton: {
    width: 226,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(127, 23, 23, 0.7)', // #7F1717 70%
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

