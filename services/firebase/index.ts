// Firebase Services - Centralized exports
export { firebaseService, auth, db, database, storage, googleProvider } from './FirebaseService';
export { authService } from './AuthService';
export { userRepository } from './UserRepository';

// Types
export type { UserData, UserWithTokens } from './UserRepository';
export type { AuthResult, LoginCredentials, RegisterCredentials } from './AuthService';
