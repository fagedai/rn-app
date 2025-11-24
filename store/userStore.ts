import { create } from 'zustand';

// 性别存储格式：1=男, 2=女, 3=不愿意透露
export type GenderType = 1 | 2 | 3;

export interface UserInfo {
  name: string;
  phone: string;
  code: string;
  gender: GenderType | null;
  birthday: {
    year: number;
    month: number;
    day: number;
  } | null;
  interests: string[]; // 兴趣数组
  backgroundStory: string | null;
  token: string | null; // 登录 token
  userId: string | null; // 用户 ID
  profileId: string | null; // AI Profile ID（从提交问卷接口返回）
}

interface UserState {
  userInfo: UserInfo;
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  setCode: (code: string) => void;
  setGender: (gender: GenderType) => void;
  setBirthday: (birthday: { year: number; month: number; day: number }) => void;
  setInterests: (interests: string[]) => void;
  setBackgroundStory: (backgroundStory: string) => void;
  setToken: (token: string) => void;
  setUserId: (userId: string) => void;
  setProfileId: (profileId: string) => void;
  resetUserInfo: () => void;
}

const initialUserInfo: UserInfo = {
  name: '',
  phone: '',
  code: '',
  gender: null,
  birthday: null,
  interests: [],
  backgroundStory: null,
  token: null,
  userId: null,
  profileId: null,
};

export const useUserStore = create<UserState>((set) => ({
  userInfo: initialUserInfo,
  setName: (name) =>
    set((state) => ({
      userInfo: { ...state.userInfo, name },
    })),
  setPhone: (phone) =>
    set((state) => ({
      userInfo: { ...state.userInfo, phone },
    })),
  setCode: (code) =>
    set((state) => ({
      userInfo: { ...state.userInfo, code },
    })),
  setGender: (gender) =>
    set((state) => ({
      userInfo: { ...state.userInfo, gender },
    })),
  setBirthday: (birthday) =>
    set((state) => ({
      userInfo: { ...state.userInfo, birthday },
    })),
  setInterests: (interests) =>
    set((state) => ({
      userInfo: { ...state.userInfo, interests },
    })),
  setBackgroundStory: (backgroundStory) =>
    set((state) => ({
      userInfo: { ...state.userInfo, backgroundStory },
    })),
  setToken: (token) =>
    set((state) => ({
      userInfo: { ...state.userInfo, token },
    })),
  setUserId: (userId) =>
    set((state) => ({
      userInfo: { ...state.userInfo, userId },
    })),
  setProfileId: (profileId) =>
    set((state) => ({
      userInfo: { ...state.userInfo, profileId },
    })),
  resetUserInfo: () =>
    set({
      userInfo: initialUserInfo,
    }),
}));

