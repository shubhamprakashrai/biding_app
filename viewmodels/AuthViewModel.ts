import { create } from 'zustand';
import { User } from 'firebase/auth';
import { authService, AuthResult, LoginCredentials, RegisterCredentials } from '@/services/firebase/AuthService';
import { userRepository, UserWithTokens } from '@/services/firebase/UserRepository';
import { UserRole } from '@/types';

interface AuthState {
  // State
  user: UserWithTokens | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => void;
  signInWithEmail: (credentials: LoginCredentials) => Promise<AuthResult>;
  registerWithEmail: (credentials: RegisterCredentials) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
  getRedirectPath: () => string;
}

/**
 * Auth ViewModel using Zustand
 * Manages authentication state and provides actions for auth operations
 */
export const useAuthViewModel = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  firebaseUser: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  /**
   * Initialize auth state from storage and set up listener
   */
  initialize: () => {
    // Load cached user from localStorage for immediate UI
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      set({ user: storedUser });
    }

    // Set up auth state listener
    authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch fresh user data from Firestore
        try {
          const userData = await userRepository.getUserById(firebaseUser.uid);
          if (userData) {
            const user: UserWithTokens = {
              ...userData,
              accessToken: get().user?.accessToken,
              refreshToken: get().user?.refreshToken
            };
            set({ user, firebaseUser, isInitialized: true });
          } else {
            // User exists in Firebase but not in Firestore
            set({
              user: storedUser,
              firebaseUser,
              isInitialized: true
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          set({ firebaseUser, isInitialized: true });
        }
      } else {
        set({ user: null, firebaseUser: null, isInitialized: true });
      }
    });
  },

  /**
   * Sign in with email and password
   */
  signInWithEmail: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.signInWithEmail(credentials);
      set({
        user: result.user,
        firebaseUser: result.firebaseUser,
        isLoading: false
      });
      return result;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * Register with email and password
   */
  registerWithEmail: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.registerWithEmail(credentials);
      set({
        user: result.user,
        firebaseUser: result.firebaseUser,
        isLoading: false
      });
      return result;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * Sign in with Google
   */
  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.signInWithGoogle();
      set({
        user: result.user,
        firebaseUser: result.firebaseUser,
        isLoading: false
      });
      return result;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * Sign out
   */
  signOut: async () => {
    set({ isLoading: true, error: null });

    try {
      await authService.signOut();
      set({
        user: null,
        firebaseUser: null,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: 'Failed to sign out', isLoading: false });
      throw error;
    }
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Refresh user data from Firestore
   */
  refreshUserData: async () => {
    const { firebaseUser, user } = get();

    if (!firebaseUser) return;

    try {
      const userData = await userRepository.getUserById(firebaseUser.uid);
      if (userData) {
        set({
          user: {
            ...userData,
            accessToken: user?.accessToken,
            refreshToken: user?.refreshToken
          }
        });
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  },

  /**
   * Get redirect path based on user role
   */
  getRedirectPath: () => {
    const { user } = get();
    if (!user) return '/login';
    return authService.getRedirectPathForRole(user.role);
  }
}));

/**
 * Helper function to get user-friendly error messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'Email is already registered';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
}

// Export for backward compatibility with old authStore
export const useAuthStore = useAuthViewModel;
