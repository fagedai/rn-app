import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage 存储键名
const STORAGE_KEY = 'create_store';

interface CreateState {
  selectedRole: string | null;
  setSelectedRole: (role: string | null) => void;
  aiExpectation: string | null; // Q6: 最重要的是，你希望你的 AI 是……
  setAiExpectation: (expectation: string | null) => void;
  selectedExperience: string[];
  setSelectedExperience: (experience: string[]) => void;
  aiRoleType: string | null; // Q8: 你的 AI 具有哪种角色类型
  setAiRoleType: (roleType: string | null) => void;
  // AI设置相关（创建时的临时值）
  aiNestName: string;
  setnestName: (name: string) => void;
  aiGender: 1 | 2 | 3; // 1=男, 2=女, 3=不愿意透露
  setAiGender: (gender: 1 | 2 | 3) => void;
  aiRelationship: string;
  setAiRelationship: (relationship: string) => void;
  aiMemory: string;
  setAiMemory: (memory: string) => void;
  aiBackgroundStory: string;
  setAiBackgroundStory: (story: string) => void;
  aiVoice: string;
  setAiVoice: (voice: string) => void;
  // AI基本设置信息（从 nestInfo 接口获取）
  nestName: string | null;
  setNestName: (name: string | null) => void;
  nestRelationship: string | null;
  setNestRelationship: (relationship: string | null) => void;
  nestLastMemory: string | null;
  setNestLastMemory: (memory: string | null) => void;
  nestBackstory: string | null;
  setNestBackstory: (backstory: string | null) => void;
  // 本地记录最后创建/编辑的记忆（用于从记忆页面返回时更新记忆卡片）
  lastCreatedMemory: string | null;
  setLastCreatedMemory: (memory: string | null) => void;
  resetCreateState: () => void;
  initializeFromStorage: () => Promise<void>; // 从持久化存储恢复
}

// 默认值
const defaultState = {
  selectedRole: null,
  aiExpectation: null,
  selectedExperience: [],
  aiRoleType: null,
  aiNestName: 'NEST',
  aiGender: 2 as const,
  aiRelationship: '朋友',
  aiMemory: '随着时间的推移,NEST与用户之间的联系变得更加个性化。NEST会在夜间主动进行签到,感知用户何时感到孤独。',
  aiBackgroundStory: '',
  aiVoice: '清澈活泼女声-经典',
  nestName: null,
  nestRelationship: null,
  nestLastMemory: null,
  nestBackstory: null,
  lastCreatedMemory: null,
};

export const useCreateStore = create<CreateState>((set, get) => {
  // 保存 get 函数供 saveToStorage 使用
  storeGet = get;
  
  return {
  ...defaultState,
  setSelectedRole: (role) => {
    set({ selectedRole: role });
    saveToStorage();
  },
  setAiExpectation: (expectation) => {
    set({ aiExpectation: expectation });
    saveToStorage();
  },
  setSelectedExperience: (experience) => {
    set({ selectedExperience: experience });
    saveToStorage();
  },
  setAiRoleType: (roleType) => {
    set({ aiRoleType: roleType });
    saveToStorage();
  },
  setnestName: (name) => {
    set({ aiNestName: name });
    saveToStorage();
  },
  setAiGender: (gender) => {
    set({ aiGender: gender });
    saveToStorage();
  },
  setAiRelationship: (relationship) => {
    set({ aiRelationship: relationship });
    saveToStorage();
  },
  setAiMemory: (memory) => {
    set({ aiMemory: memory });
    saveToStorage();
  },
  setAiBackgroundStory: (story) => {
    set({ aiBackgroundStory: story });
    saveToStorage();
  },
  setAiVoice: (voice) => {
    set({ aiVoice: voice });
    saveToStorage();
  },
  setNestName: (name) => {
    set({ nestName: name });
    saveToStorage();
  },
  setNestRelationship: (relationship) => {
    set({ nestRelationship: relationship });
    saveToStorage();
  },
  setNestLastMemory: (memory) => {
    set({ nestLastMemory: memory });
    saveToStorage();
  },
  setNestBackstory: (backstory) => {
    set({ nestBackstory: backstory });
    saveToStorage();
  },
  setLastCreatedMemory: (memory) => {
    set({ lastCreatedMemory: memory });
    saveToStorage();
  },
  resetCreateState: async () => {
    set(defaultState);
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
  initializeFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          ...defaultState,
          ...parsed,
        });
        console.log('[CreateStore] 从持久化存储恢复数据');
      }
    } catch (error) {
      console.error('[CreateStore] 从持久化存储恢复失败:', error);
    }
  },
  };
});

// 保存到持久化存储（防抖）
let saveTimeout: NodeJS.Timeout | null = null;
let storeGet: (() => CreateState) | null = null;
const saveToStorage = () => {
  if (!storeGet) return;
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(async () => {
    if (!storeGet) return;
    try {
      const state = storeGet();
      const dataToSave = {
        aiNestName: state.aiNestName, // 创建时的临时名字
        aiGender: state.aiGender,
        aiRelationship: state.aiRelationship,
        aiMemory: state.aiMemory,
        aiBackgroundStory: state.aiBackgroundStory,
        aiVoice: state.aiVoice,
        // 从API获取的 nestInfo 相关字段
        nestName: state.nestName, // 从 API 获取的名字
        nestRelationship: state.nestRelationship,
        nestLastMemory: state.nestLastMemory,
        nestBackstory: state.nestBackstory,
        lastCreatedMemory: state.lastCreatedMemory,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('[CreateStore] 保存到持久化存储失败:', error);
    }
  }, 500); // 500ms 防抖
};

