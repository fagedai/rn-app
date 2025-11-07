import { create } from 'zustand';

export type PlanType = 'pro' | 'basic' | null;

interface PlanState {
  selectedPlan: PlanType;
  setSelectedPlan: (plan: PlanType) => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  selectedPlan: null,
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
}));

