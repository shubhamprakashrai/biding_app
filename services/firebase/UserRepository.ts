import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { firebaseService } from './FirebaseService';
import { UserRole } from '@/types';

export interface UserData {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  provider?: string;
  emailVerified?: boolean;
  createdAt?: any;
  lastLogin?: any;
  updatedAt?: any;
}

export interface UserWithTokens extends UserData {
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Repository class for user-related Firestore operations
 * Follows the Repository pattern for data access
 */
class UserRepository {
  private static instance: UserRepository;
  private readonly collectionName = 'users';

  private constructor() {}

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  private get db() {
    return firebaseService.db;
  }

  /**
   * Get user by UID
   */
  async getUserById(uid: string): Promise<UserData | null> {
    try {
      const userDocRef = doc(this.db, this.collectionName, uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return null;
      }

      return { uid, ...userDoc.data() } as UserData;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Check if user exists
   */
  async userExists(uid: string): Promise<boolean> {
    const user = await this.getUserById(uid);
    return user !== null;
  }

  /**
   * Create a new user
   */
  async createUser(userData: Partial<UserData>): Promise<void> {
    try {
      if (!userData.uid) {
        throw new Error('User UID is required');
      }

      const userDocRef = doc(this.db, this.collectionName, userData.uid);
      await setDoc(userDocRef, {
        ...userData,
        role: userData.role || 'USER',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update existing user
   */
  async updateUser(uid: string, data: Partial<UserData>): Promise<void> {
    try {
      const userDocRef = doc(this.db, this.collectionName, uid);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(uid: string): Promise<void> {
    try {
      const userDocRef = doc(this.db, this.collectionName, uid);
      await setDoc(userDocRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Create or update user (upsert)
   */
  async upsertUser(userData: Partial<UserData>): Promise<void> {
    try {
      if (!userData.uid) {
        throw new Error('User UID is required');
      }

      const exists = await this.userExists(userData.uid);

      if (exists) {
        await this.updateUser(userData.uid, userData);
      } else {
        await this.createUser(userData);
      }
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserData[]> {
    try {
      const usersRef = collection(this.db, this.collectionName);
      const snapshot = await getDocs(usersRef);

      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserData));
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<UserData[]> {
    try {
      const usersRef = collection(this.db, this.collectionName);
      const q = query(usersRef, where('role', '==', role));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserData));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }
}

export const userRepository = UserRepository.getInstance();
export default userRepository;
