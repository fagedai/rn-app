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
  aiName: string;
  setAiName: (name: string) => void;
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
  aiName: 'Lisa',
  setAiName: (name) => set({ aiName: name }),
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
  resetCreateState: () => set({
    selectedRole: null,
    aiExpectation: null,
    selectedExperience: [],
    aiRoleType: null,
    aiName: 'Lisa',
    aiGender: 2, // 默认女 (1=男, 2=女, 3=不愿意透露)
    aiRelationship: '朋友',
    aiMemory: '随着时间的推移,NEST与用户之间的联系变得更加个性化。NEST会在夜间主动进行签到,感知用户何时感到孤独。',
    aiBackgroundStory: '',
    aiVoice: '清澈活泼女声-经典',
  }),
}));

