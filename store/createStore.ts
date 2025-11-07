import { create } from 'zustand';

interface CreateState {
  selectedRole: string | null;
  setSelectedRole: (role: string | null) => void;
  resetCreateState: () => void;
}

export const useCreateStore = create<CreateState>((set) => ({
  selectedRole: null,
  setSelectedRole: (role) => set({ selectedRole: role }),
  resetCreateState: () => set({ selectedRole: null }),
}));

