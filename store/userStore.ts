import { create } from 'zustand';

export type GenderType = '男' | '女' | '其他';

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
}

interface UserState {
  userInfo: UserInfo;
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  setCode: (code: string) => void;
  setGender: (gender: GenderType) => void;
  setBirthday: (birthday: { year: number; month: number; day: number }) => void;
  resetUserInfo: () => void;
}

const initialUserInfo: UserInfo = {
  name: '',
  phone: '',
  code: '',
  gender: null,
  birthday: null,
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
  resetUserInfo: () =>
    set({
      userInfo: initialUserInfo,
    }),
}));

