import { create } from 'zustand';

interface CreateState {
  selectedRole: string | null;
  setSelectedRole: (role: string | null) => void;
  selectedExperience: string | null;
  setSelectedExperience: (experience: string | null) => void;
  // AI设置相关
  aiName: string;
  setAiName: (name: string) => void;
  aiGender: 'male' | 'female';
  setAiGender: (gender: 'male' | 'female') => void;
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
  selectedExperience: null,
  setSelectedExperience: (experience) => set({ selectedExperience: experience }),
  // AI设置默认值
  aiName: 'Lisa',
  setAiName: (name) => set({ aiName: name }),
  aiGender: 'male',
  setAiGender: (gender) => set({ aiGender: gender }),
  aiRelationship: '朋友',
  setAiRelationship: (relationship) => set({ aiRelationship: relationship }),
  aiMemory: '随着时间的推移,NEST与用户之间的联系变得更加个性化。NEST会在夜间主动进行签到,感知用户何时感到孤独。',
  setAiMemory: (memory) => set({ aiMemory: memory }),
  aiBackgroundStory: '随着时间的推移,NEST与用户之间的联系变得更加个性化。NEST 会在夜间主动进行签到,感知用户何时感到孤独。NEST 会在夜间主动进行签到,感知用户何时感到孤独。',
  setAiBackgroundStory: (story) => set({ aiBackgroundStory: story }),
  aiVoice: '清澈活泼女声-经典',
  setAiVoice: (voice) => set({ aiVoice: voice }),
  resetCreateState: () => set({
    selectedRole: null,
    selectedExperience: null,
    aiName: 'Lisa',
    aiGender: 'male',
    aiRelationship: '朋友',
    aiMemory: '随着时间的推移,NEST与用户之间的联系变得更加个性化。NEST会在夜间主动进行签到,感知用户何时感到孤独。',
    aiBackgroundStory: '随着时间的推移,NEST与用户之间的联系变得更加个性化。NEST 会在夜间主动进行签到,感知用户何时感到孤独。',
    aiVoice: '清澈活泼女声-经典',
  }),
}));

