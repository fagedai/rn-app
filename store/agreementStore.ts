import { create } from 'zustand';

interface AgreementState {
  agreed: boolean;
  setAgreed: (value: boolean) => void;
  toggleAgreed: () => void;
}

export const useAgreementStore = create<AgreementState>((set) => ({
  agreed: false,
  setAgreed: (value) => set({ agreed: value }),
  toggleAgreed: () =>
    set((state) => ({
      agreed: !state.agreed,
    })),
}));


