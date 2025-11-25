/**
 * Firebase Configuration - Backward Compatibility Layer
 *
 * This file re-exports from the new singleton FirebaseService for backward compatibility.
 * New code should import directly from '@/services/firebase' instead.
 *
 * @deprecated Use '@/services/firebase' for new code
 */

// Re-export everything from the new singleton service
export {
  firebaseService,
  auth,
  db,
  database,
  storage,
  googleProvider
} from '@/services/firebase/FirebaseService';

export { authService } from '@/services/firebase/AuthService';
export { userRepository } from '@/services/firebase/UserRepository';

// Re-export default app
export { default } from '@/services/firebase/FirebaseService';

// Legacy function exports for backward compatibility
import { authService } from '@/services/firebase/AuthService';
import { User } from 'firebase/auth';

/**
 * @deprecated Use authService.signInWithGoogle() instead
 */
export const signInWithGoogle = async (): Promise<User> => {
  const result = await authService.signInWithGoogle();
  return result.firebaseUser;
};

/**
 * @deprecated Use authService.signOut() instead
 */
export const signOut = async (): Promise<void> => {
  await authService.signOut();
};
