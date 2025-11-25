// Firebase services
export {
  firebaseService,
  auth,
  db,
  database,
  storage,
  googleProvider
} from './firebase/FirebaseService';

export { authService } from './firebase/AuthService';
export { userRepository } from './firebase/UserRepository';

// Types
export type { UserData, UserWithTokens } from './firebase/UserRepository';
export type { AuthResult, LoginCredentials, RegisterCredentials } from './firebase/AuthService';

// Other services
export { HomePageService } from './homePageService';
