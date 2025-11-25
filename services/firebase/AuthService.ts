import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential,
  Unsubscribe
} from 'firebase/auth';
import Cookies from 'js-cookie';
import { firebaseService } from './FirebaseService';
import { userRepository, UserData, UserWithTokens } from './UserRepository';
import { UserRole } from '@/types';

export interface AuthResult {
  user: UserWithTokens;
  firebaseUser: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

/**
 * Singleton service for authentication operations
 * Handles all auth logic and user session management
 */
class AuthService {
  private static instance: AuthService;
  private readonly COOKIE_EXPIRY_DAYS = 7;
  private readonly USER_COOKIE_KEY = 'user';
  private readonly USER_STORAGE_KEY = 'user';
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private get auth() {
    return firebaseService.auth;
  }

  private get googleProvider() {
    return firebaseService.googleProvider;
  }

  /**
   * Extract tokens from Firebase user
   */
  private extractTokens(user: User): { accessToken: string; refreshToken: string } {
    const tokenManager = (user as any).stsTokenManager;
    return {
      accessToken: tokenManager?.accessToken || '',
      refreshToken: tokenManager?.refreshToken || ''
    };
  }

  /**
   * Normalize Google photo URL to higher resolution
   */
  private normalizePhotoURL(photoURL: string | null): string {
    if (!photoURL) return '';

    if (photoURL.includes('googleusercontent.com')) {
      if (photoURL.includes('=s')) {
        return photoURL.replace(/=s\d+(-[a-zA-Z])?$/, '=s400');
      }
      return `${photoURL}=s400`;
    }

    return photoURL;
  }

  /**
   * Persist user session to localStorage and cookies
   */
  private persistSession(user: UserWithTokens): void {
    const userJson = JSON.stringify(user);

    // Save to localStorage
    localStorage.setItem(this.USER_STORAGE_KEY, userJson);
    if (user.accessToken) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, user.accessToken);
    }
    if (user.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, user.refreshToken);
    }

    // Save to cookie for middleware
    Cookies.set(this.USER_COOKIE_KEY, userJson, { expires: this.COOKIE_EXPIRY_DAYS });
  }

  /**
   * Clear user session from localStorage and cookies
   */
  private clearSession(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    Cookies.remove(this.USER_COOKIE_KEY);
  }

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): UserWithTokens | null {
    try {
      const userJson = localStorage.getItem(this.USER_STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password } = credentials;

    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch user data from Firestore
    const userData = await userRepository.getUserById(firebaseUser.uid);

    if (!userData) {
      throw new Error('User record not found in database');
    }

    // Update last login
    await userRepository.updateLastLogin(firebaseUser.uid);

    // Extract tokens
    const tokens = this.extractTokens(firebaseUser);

    // Build user object
    const user: UserWithTokens = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: userData.name || firebaseUser.email?.split('@')[0] || 'User',
      role: userData.role || 'USER',
      photoURL: userData.photoURL,
      ...tokens
    };

    // Persist session
    this.persistSession(user);

    return { user, firebaseUser };
  }

  /**
   * Register with email and password
   */
  async registerWithEmail(credentials: RegisterCredentials): Promise<AuthResult> {
    const { email, password, name, role = 'USER' } = credentials;

    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const firebaseUser = userCredential.user;

    // Update Firebase profile
    await updateProfile(firebaseUser, { displayName: name });

    // Create user in Firestore
    const userData: UserData = {
      uid: firebaseUser.uid,
      email: email,
      name: name,
      role: role,
      provider: 'email',
      emailVerified: firebaseUser.emailVerified
    };

    await userRepository.createUser(userData);

    // Extract tokens
    const tokens = this.extractTokens(firebaseUser);

    // Build user object
    const user: UserWithTokens = {
      ...userData,
      ...tokens
    };

    // Persist session
    this.persistSession(user);

    return { user, firebaseUser };
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthResult> {
    const result = await signInWithPopup(this.auth, this.googleProvider);
    const firebaseUser = result.user;

    if (!firebaseUser) {
      throw new Error('No user returned from Google sign in');
    }

    // Check if user exists
    const existingUser = await userRepository.getUserById(firebaseUser.uid);
    const photoURL = this.normalizePhotoURL(firebaseUser.photoURL);

    const userData: Partial<UserData> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      photoURL: photoURL,
      provider: 'google.com',
      emailVerified: firebaseUser.emailVerified
    };

    if (!existingUser) {
      // Create new user with default role
      await userRepository.createUser({
        ...userData,
        role: 'USER'
      } as UserData);
    } else {
      // Update existing user's last login and photo
      await userRepository.updateUser(firebaseUser.uid, {
        lastLogin: new Date(),
        photoURL: photoURL || existingUser.photoURL
      });
    }

    // Fetch complete user data
    const completeUserData = await userRepository.getUserById(firebaseUser.uid);

    // Extract tokens
    const tokens = this.extractTokens(firebaseUser);

    // Build user object
    const user: UserWithTokens = {
      uid: firebaseUser.uid,
      email: completeUserData?.email || firebaseUser.email || '',
      name: completeUserData?.name || firebaseUser.displayName || 'User',
      role: completeUserData?.role || 'USER',
      photoURL: completeUserData?.photoURL || photoURL,
      ...tokens
    };

    // Persist session
    this.persistSession(user);

    // Dispatch storage event for UI updates
    window.dispatchEvent(new Event('storage'));

    return { user, firebaseUser };
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
    this.clearSession();
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Get current Firebase user
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Get redirect path based on user role
   */
  getRedirectPathForRole(role: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'DEV':
        return '/dev-dashboard';
      default:
        return '/dashboard';
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;
