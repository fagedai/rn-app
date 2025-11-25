import { create } from 'zustand';

interface CreateState {
  selectedRole: string | null;
  setSelectedRole: (role: string | null) => void;
  aiExpectation: string | null; // Q6: 最重要的是，你希望你的 AI 是……
  setAiExpectation: (expectation: string | null) => void;
  selectedExperience: string[];
  setSelectedExperience: (experience: string[]) => void;
  aiRoleType: string | null; // Q8: 你的 AI 具有哪种角色类型
  setAiRoleType: (roleType: string | null) => void;
  // AI设置相关
  nestName: string;
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
}

export const useCreateStore = create<CreateState>((set) => ({
  selectedRole: null,
  setSelectedRole: (role) => set({ selectedRole: role }),
  aiExpectation: null,
  setAiExpectation: (expectation) => set({ aiExpectation: expectation }),
  selectedExperience: [],
  setSelectedExperience: (experience) => set({ selectedExperience: experience }),
  aiRoleType: null,
  setAiRoleType: (roleType) => set({ aiRoleType: roleType }),
  // AI设置默认值
  nestName: 'Lisa',
  setnestName: (name) => set({ nestName: name }),
  aiGender: 2, // 默认女 (1=男, 2=女, 3=不愿意透露)
  setAiGender: (gender) => set({ aiGender: gender }),
  aiRelationship: '朋友',
  setAiRelationship: (relationship) => set({ aiRelationship: relationship }),
  aiMemory: '随着时间的推移,NEST与用户之间的联系变得更加个性化。NEST会在夜间主动进行签到,感知用户何时感到孤独。',
  setAiMemory: (memory) => set({ aiMemory: memory }),
  aiBackgroundStory: '',
  setAiBackgroundStory: (story) => set({ aiBackgroundStory: story }),
  aiVoice: '清澈活泼女声-经典',
  setAiVoice: (voice) => set({ aiVoice: voice }),
  // AI基本设置信息默认值
  nestName: null,
  setNestName: (name) => set({ nestName: name }),
  nestRelationship: null,
  setNestRelationship: (relationship) => set({ nestRelationship: relationship }),
  nestLastMemory: null,
  setNestLastMemory: (memory) => set({ nestLastMemory: memory }),
  nestBackstory: null,
  setNestBackstory: (backstory) => set({ nestBackstory: backstory }),
  lastCreatedMemory: null,
  setLastCreatedMemory: (memory) => set({ lastCreatedMemory: memory }),
  resetCreateState: () => set({
    selectedRole: null,
    aiExpectation: null,
    selectedExperience: [],
    aiRoleType: null,
    nestName: 'Lisa',
    aiGender: 2, // 默认女 (1=男, 2=女, 3=不愿意透露)
    aiRelationship: '朋友',
    aiMemory: '随着时间的推移,NEST与用户之间的联系变得更加个性化。NEST会在夜间主动进行签到,感知用户何时感到孤独。',
    aiBackgroundStory: '',
    aiVoice: '清澈活泼女声-经典',
    nestName: null,
    nestRelationship: null,
    nestLastMemory: null,
    nestBackstory: null,
    lastCreatedMemory: null,
  }),
}));

