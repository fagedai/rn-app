import React, { useState, useEffect, useMemo } from 'react';
import { View, ImageBackground, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LoginHeader } from '@/components/common/LoginHeader';
import { InterestItem } from '@/components/settings/InterestItem';
import { useUserStore } from '@/store/userStore';
import { updateUserInfo } from '@/services/api/user';
import { Toast } from '@/components/common/Toast';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useToast } from '@/hooks/useToast';

// 兴趣数据配置
interface InterestConfig {
  id: string;
  label: string;
  icon?: string;
}

interface InterestCategory {
  name: string;
  interests: InterestConfig[];
}

const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    name: '艺术与创意',
    interests: [
      { id: '1', label: '手工制作', icon: '🧵' },
      { id: '4', label: '艺术与设计', icon: '🎨' },
      { id: '14', label: '家居设计', icon: '🏠' },
      { id: '22', label: '时尚', icon: '👗' },
      { id: '26', label: '摄影', icon: '📷' },
    ],
  },
  {
    name: '娱乐与休闲',
    interests: [
      { id: '3', label: '动漫', icon: '🎌' },
      { id: '9', label: '娱乐', icon: '🎭' },
      { id: '11', label: '搞笑', icon: '😂' },
      { id: '12', label: '游戏', icon: '🎮' },
      { id: '15', label: '音乐', icon: '🎵' },
      { id: '17', label: '阅读', icon: '📖' },
      { id: '29', label: '电影', icon: '🎬' },
    ],
  },
  {
    name: '运动与健康',
    interests: [
      { id: '21', label: '运动', icon: '⚽' },
      { id: '25', label: '健康', icon: '💪' },
      { id: '28', label: '健身', icon: '🏋️' },
    ],
  },
  {
    name: '文化与学习',
    interests: [
      { id: '8', label: '教育', icon: '📚' },
      { id: '20', label: '科学', icon: '🔬' },
      { id: '23', label: '科技', icon: '💻' },
    ],
  },
  {
    name: '生活与兴趣',
    interests: [
      { id: '2', label: '动物与可爱', icon: '🐾' },
      { id: '10', label: '食物', icon: '🍽️' },
      { id: '16', label: '自然', icon: '🌿' },
      { id: '24', label: '旅行', icon: '✈️' },
      { id: '27', label: '烹饪', icon: '👨‍🍳' },
    ],
  },
  {
    name: '社交与关系',
    interests: [
      { id: '13', label: '爱好', icon: '🎯' },
      { id: '18', label: '人际关系', icon: '👥' },
      { id: '19', label: '浪漫', icon: '💕' },
    ],
  },
  {
    name: '职业与个人',
    interests: [
      { id: '5', label: '占星术', icon: '⭐' },
      { id: '6', label: '职业', icon: '💼' },
      { id: '7', label: '名人', icon: '⭐' },
    ],
  },
];

const MAX_SELECTIONS = 10;

export default function EditInterests() {
  const router = useRouter();
  const { top, bottom } = useSafeArea();
  const { userInfo, setInterests } = useUserStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast(1500);

  // 计算提示文字的位置：标题是绝对定位，header高度约44px，加上安全区域顶部，再加6px间距
  const hintTextContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: top + 44 + 6, // 安全区域 + header高度 + 6px间距
    left: 0,
    right: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }), [top]);

  // 按钮位置：距离底部57px
  // 按钮高度44px
  // 按钮顶部距离底部 = 57 + 44 = 101px
  // 列表应该在按钮顶部上方37px，所以列表底部距离屏幕底部 = 101 + 37 = 138px
  const buttonContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: bottom + 57, // 距离底部57px + 安全区域
    left: 0,
    right: 0,
    alignItems: 'center' as const,
    zIndex: 999,
  }), [bottom]);

  // 滚动列表的paddingBottom计算：
  // 按钮距离屏幕底部 = bottom + 57（包括安全区域）
  // 按钮高度 = 44px
  // 按钮顶部距离屏幕底部 = bottom + 57 + 44 = bottom + 101
  // 列表内容应该在按钮顶部上方37px，所以需要的总空间 = bottom + 101 + 37 = bottom + 138
  // ScrollView在SafeAreaView内，但按钮在SafeAreaView外（绝对定位）
  // SafeAreaView的底部已经在安全区域上方，所以按钮相对于SafeAreaView底部的距离 = 57 + 44 = 101px
  // 加上37px间距，所以paddingBottom = 101 + 37 + bottom = 138 + bottom
  // 为了确保有足够空间，额外增加20px的缓冲
  const scrollContentStyle = useMemo(() => ({
    paddingBottom: bottom + 158, // 138px基础间距 + 20px缓冲，确保列表内容在按钮上方37px处结束
  }), [bottom]);

  // 初始化：从 userStore 获取用户已选择的兴趣
  useEffect(() => {
    // 从 userStore 获取 interests，如果存在则设置为选中状态
    if (userInfo.interests && userInfo.interests.length > 0) {
      // userInfo.interests 存储的是 label（文字），需要转换为 id
      const selectedIdsFromLabels = userInfo.interests.map(label => {
        // 在所有分类中查找对应的兴趣项
        for (const category of INTEREST_CATEGORIES) {
          const interest = category.interests.find(item => item.label === label);
          if (interest) {
            return interest.id;
          }
        }
        return label; // 如果找不到，返回 label 本身（兜底，可能是旧数据格式）
      });
      setSelectedIds(selectedIdsFromLabels);
    } else {
      setSelectedIds([]);
    }
  }, [userInfo.interests]);

  // 处理兴趣项点击
  const handleInterestPress = (id: string) => {
    const isSelected = selectedIds.includes(id);
    
    if (isSelected) {
      // 已选中，取消选择
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      // 未选中，检查是否已达到最大选择数量
      if (selectedIds.length >= MAX_SELECTIONS) {
        // 已达到最大选择数量，显示提示
        toast.show('最多选择十个兴趣');
        return;
      }
      // 未达到最大选择数量，添加选择
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 处理保存按钮点击
  const handleSave = async () => {
    // 如果正在加载，禁止重复提交
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      
      // 将选中的 id 转换为对应的 label（文字）
      const selectedLabels = selectedIds.map(id => {
        // 在所有分类中查找对应的兴趣项
        for (const category of INTEREST_CATEGORIES) {
          const interest = category.interests.find(item => item.id === id);
          if (interest) {
            return interest.label;
          }
        }
        return id; // 如果找不到，返回 id 本身（兜底）
      });
      
      // 检查兴趣是否有变化（比较 label 数组）
      const currentInterests = userInfo.interests || [];
      const hasChanged = 
        selectedLabels.length !== currentInterests.length ||
        selectedLabels.some(label => !currentInterests.includes(label)) ||
        currentInterests.some(label => !selectedLabels.includes(label));
      
      if (!hasChanged) {
        router.back();
        return;
      }
      
      // 调用后端API更新兴趣（只传变更的字段，传文字而不是数字）
      if (userInfo.token) {
        await updateUserInfo(userInfo.token, {
          interests: selectedLabels,
        });
      }
      
      // 更新本地store（保存 label 文字）
      setInterests(selectedLabels);
      
      // 显示成功提示
      toast.show('已保存');
      
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error('保存兴趣失败:', error);
      // 显示失败提示
      const errorMessage = error instanceof Error ? error.message : '保存失败，请稍后重试';
      toast.show(errorMessage);
      // 失败时留在本页，保持用户选择
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/setting_backgorund.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="您的兴趣" backButton={true} />
      <SafeAreaView className="flex-1">
        {/* 提示文字 - 绝对定位 */}
        <View style={hintTextContainerStyle}>
          <Text style={styles.hintText}>
            Nest 会在对话中记住这些。如果您改变主意，可以稍后编辑它们。
          </Text>
        </View>

        <View 
          className="flex-1 px-6" 
          style={{ 
            paddingTop: top + 44 + 6 + 40, // 为提示文字和间距留出空间
            // 为按钮留出空间：按钮距离屏幕底部 bottom + 57，按钮高度44
            // 按钮顶部距离屏幕底部 = bottom + 57 + 44 = bottom + 101
            // SafeAreaView内容底部距离屏幕底部 = bottom
            // 所以按钮顶部相对于SafeAreaView内容底部的距离 = (bottom + 101) - bottom = 101
            // 加上37px间距，容器的paddingBottom应该是 101 + 37 = 138
            paddingBottom: 138, // 确保ScrollView不会滚动到按钮区域
          }}
        >
          {/* 兴趣列表 */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={scrollContentStyle}
          >
            {INTEREST_CATEGORIES.map((category, categoryIndex) => (
              <View key={category.name} style={styles.categorySection}>
                {/* 分类标题 - 水平居中 */}
                <Text style={styles.categoryTitle}>{category.name}</Text>
                {/* 分类下的兴趣选项 */}
                <View style={styles.interestsGrid}>
                  {category.interests.map((interest) => (
                    <InterestItem
                      key={interest.id}
                      id={interest.id}
                      label={interest.label}
                      icon={interest.icon}
                      isSelected={selectedIds.includes(interest.id)}
                      onPress={() => handleInterestPress(interest.id)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
      
      {/* 保存按钮 - 固定在底部，距离底部57px */}
      <View style={buttonContainerStyle}>
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
          locations={[0, 0.5, 1]}
          style={[
            styles.button,
            (loading || selectedIds.length === 0) && styles.buttonDisabled,
          ]}
        >
          <TouchableOpacity
            style={styles.buttonInner}
            onPress={handleSave}
            disabled={loading || selectedIds.length === 0}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>保存</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        duration={toast.duration}
        onHide={toast.hide}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hintText: {
    fontSize: 13,
    width: 221,
    color: '#D9D9D9',
    textAlign: 'center',
    lineHeight: 18,
  },
  categorySection: {
    marginBottom: 24, // 分类之间的间距
  },
  categoryTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center', // 水平居中
    marginBottom: 16,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // 水平居中，即使一行一个也要居中
    alignItems: 'flex-start',
    paddingHorizontal: 4, // 稍微内边距，确保第一个和最后一个不会贴边
  },
  button: {
    width: 298,
    height: 44,
    borderRadius: 22,
    padding: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonInner: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

