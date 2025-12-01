import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// 性别存储格式：1=男, 2=女, 3=不愿意透露
export type GenderType = 1 | 2 | 3;

// SecureStore 存储键名
const STORAGE_KEYS = {
  TOKEN: 'user_token',
  USER_ID: 'user_id',
} as const;

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
  isNewUser: number | null; // 是否新用户：0=已注册且已填完问卷，1=新用户（未完成问卷）
}

interface UserState {
  userInfo: UserInfo;
  isInitialized: boolean; // 是否已初始化（从持久化存储恢复）
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
  setIsNewUser: (isNewUser: number) => void;
  resetUserInfo: () => void;
  initializeFromStorage: () => Promise<void>; // 从持久化存储恢复
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
  isNewUser: null,
};

export const useUserStore = create<UserState>((set, get) => ({
  userInfo: initialUserInfo,
  isInitialized: false,
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
  setToken: async (token) => {
    // 保存到内存
    set((state) => ({
      userInfo: { ...state.userInfo, token },
    }));
    // 保存到持久化存储
    try {
      if (token) {
        await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
      }
    } catch (error) {
      console.error('[UserStore] 保存 token 失败:', error);
    }
  },
  setUserId: async (userId) => {
    // 保存到内存
    set((state) => ({
      userInfo: { ...state.userInfo, userId },
    }));
    // 保存到持久化存储
    try {
      if (userId) {
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, userId);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
      }
    } catch (error) {
      console.error('[UserStore] 保存 userId 失败:', error);
    }
  },
  setProfileId: (profileId) =>
    set((state) => ({
      userInfo: { ...state.userInfo, profileId },
    })),
  setIsNewUser: (isNewUser) =>
    set((state) => ({
      userInfo: { ...state.userInfo, isNewUser },
    })),
  resetUserInfo: async () => {
    // 清除内存
    set({
      userInfo: initialUserInfo,
    });
    // 清除持久化存储
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('[UserStore] 清除持久化存储失败:', error);
    }
  },
  initializeFromStorage: async () => {
    if (get().isInitialized) {
      return; // 已经初始化过了
    }

    try {
      // 从持久化存储恢复 token 和 userId
      const [token, userId] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.USER_ID),
      ]);

      if (token || userId) {
        set((state) => ({
          userInfo: {
            ...state.userInfo,
            token: token || null,
            userId: userId || null,
          },
          isInitialized: true,
        }));
        console.log('[UserStore] 从持久化存储恢复登录状态:', {
          hasToken: !!token,
          hasUserId: !!userId,
        });
      } else {
        set({ isInitialized: true });
        console.log('[UserStore] 未找到保存的登录状态');
      }
    } catch (error) {
      console.error('[UserStore] 从持久化存储恢复失败:', error);
      set({ isInitialized: true }); // 即使失败也标记为已初始化，避免重复尝试
    }
  },
}));

