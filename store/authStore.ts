import { create } from 'zustand';
// import { UserRole } from '@/types/UserRole';
import {UserRole} from '@/types/index'

interface UserData {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: UserData | null;
  setUser: (user: UserData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}));
