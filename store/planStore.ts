import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlanType = 'pro' | 'basic' | null;

// AsyncStorage 存储键名
const STORAGE_KEY = 'plan_store';

interface PlanState {
  selectedPlan: PlanType;
  setSelectedPlan: (plan: PlanType) => void;
  resetPlan: () => Promise<void>; // 清除持久化存储
  initializeFromStorage: () => Promise<void>; // 从持久化存储恢复
}

export const usePlanStore = create<PlanState>((set, get) => ({
  selectedPlan: null,
  setSelectedPlan: async (plan) => {
    set({ selectedPlan: plan });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedPlan: plan }));
    } catch (error) {
      console.error('[PlanStore] 保存到持久化存储失败:', error);
    }
  },
  resetPlan: async () => {
    set({ selectedPlan: null });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('[PlanStore] 已清除持久化存储');
    } catch (error) {
      console.error('[PlanStore] 清除持久化存储失败:', error);
    }
  },
  initializeFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ selectedPlan: parsed.selectedPlan || null });
        console.log('[PlanStore] 从持久化存储恢复数据');
      }
    } catch (error) {
      console.error('[PlanStore] 从持久化存储恢复失败:', error);
    }
  },
}));

