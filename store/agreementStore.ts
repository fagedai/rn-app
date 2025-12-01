import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage 存储键名
const STORAGE_KEY = 'agreement_store';

interface AgreementState {
  agreed: boolean;
  setAgreed: (value: boolean) => void;
  toggleAgreed: () => void;
  resetAgreement: () => Promise<void>; // 清除持久化存储
  initializeFromStorage: () => Promise<void>; // 从持久化存储恢复
}

export const useAgreementStore = create<AgreementState>((set, get) => ({
  agreed: false,
  setAgreed: async (value) => {
    set({ agreed: value });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ agreed: value }));
    } catch (error) {
      console.error('[AgreementStore] 保存到持久化存储失败:', error);
    }
  },
  toggleAgreed: async () => {
    const newValue = !get().agreed;
    set({ agreed: newValue });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ agreed: newValue }));
    } catch (error) {
      console.error('[AgreementStore] 保存到持久化存储失败:', error);
    }
  },
  resetAgreement: async () => {
    set({ agreed: false });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('[AgreementStore] 已清除持久化存储');
    } catch (error) {
      console.error('[AgreementStore] 清除持久化存储失败:', error);
    }
  },
  initializeFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ agreed: parsed.agreed || false });
        console.log('[AgreementStore] 从持久化存储恢复数据');
      }
    } catch (error) {
      console.error('[AgreementStore] 从持久化存储恢复失败:', error);
    }
  },
}));


