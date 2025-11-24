import { create } from 'zustand';

/**
 * 问卷答案临时缓存（仅当前会话，不持久化）
 */
export interface QuestionnaireAnswers {
  // Q1: 姓名
  name: string | null;
  // Q2: 性别 (1=男, 2=女, 3=不愿意透露)
  gender: 1 | 2 | 3 | null;
  // Q3: 生日
  birthday: {
    year: number;
    month: number;
    day: number;
  } | null;
  // Q4: 角色
  role: string | null;
  // Q5: NEST性别
  nestGender: 1 | 2 | 3 | null; // 1=男, 2=女, 3=不愿意透露
  // Q6: AI期望
  aiExpectation: string | null;
  // Q7: 经历（多选）
  experience: string[];
  // Q8: AI角色类型
  aiRoleType: string | null;
}

interface QuestionnaireState {
  answers: QuestionnaireAnswers;
  // 设置答案
  setQ1Name: (name: string | null) => void;
  setQ2Gender: (gender: 1 | 2 | 3 | null) => void;
  setQ3Birthday: (birthday: { year: number; month: number; day: number } | null) => void;
  setQ4Role: (role: string | null) => void;
  setQ5NestGender: (gender: 1 | 2 | 3 | null) => void;
  setQ6AiExpectation: (expectation: string | null) => void;
  setQ7Experience: (experience: string[]) => void;
  setQ8AiRoleType: (roleType: string | null) => void;
  // 检查是否所有题目都已完成
  isAllCompleted: () => boolean;
  // 重置所有答案（会话结束或中断时调用）
  resetAnswers: () => void;
  // 获取提交数据
  getSubmitData: () => QuestionnaireAnswers | null;
}

const initialAnswers: QuestionnaireAnswers = {
  name: null,
  gender: null,
  birthday: null,
  role: null,
  nestGender: null,
  aiExpectation: null,
  experience: [],
  aiRoleType: null,
};

export const useQuestionnaireStore = create<QuestionnaireState>((set, get) => ({
  answers: initialAnswers,
  
  setQ1Name: (name) =>
    set((state) => ({
      answers: { ...state.answers, name },
    })),
  
  setQ2Gender: (gender) =>
    set((state) => ({
      answers: { ...state.answers, gender },
    })),
  
  setQ3Birthday: (birthday) =>
    set((state) => ({
      answers: { ...state.answers, birthday },
    })),
  
  setQ4Role: (role) =>
    set((state) => ({
      answers: { ...state.answers, role },
    })),
  
  setQ5NestGender: (nestGender) =>
    set((state) => ({
      answers: { ...state.answers, nestGender },
    })),
  
  setQ6AiExpectation: (aiExpectation) =>
    set((state) => ({
      answers: { ...state.answers, aiExpectation },
    })),
  
  setQ7Experience: (experience) =>
    set((state) => ({
      answers: { ...state.answers, experience },
    })),
  
  setQ8AiRoleType: (aiRoleType) =>
    set((state) => ({
      answers: { ...state.answers, aiRoleType },
    })),
  
  isAllCompleted: () => {
    const { answers } = get();
    return (
      answers.name !== null &&
      answers.gender !== null &&
      answers.birthday !== null &&
      answers.role !== null &&
      answers.nestGender !== null &&
      answers.aiExpectation !== null &&
      answers.experience.length > 0 &&
      answers.aiRoleType !== null
    );
  },
  
  resetAnswers: () =>
    set({
      answers: initialAnswers,
    }),
  
  getSubmitData: () => {
    const { answers, isAllCompleted } = get();
    if (isAllCompleted()) {
      return answers;
    }
    return null;
  },
}));

