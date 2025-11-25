import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Database, getDatabase } from 'firebase/database';
import { FirebaseStorage, getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAEafom6gEsn7W0uAOMIP1npC1crXOt1u8",
  authDomain: "sourcecodelelo-5b19c.firebaseapp.com",
  projectId: "sourcecodelelo-5b19c",
  storageBucket: "sourcecodelelo-5b19c.firebasestorage.app",
  messagingSenderId: "50283774428",
  appId: "1:50283774428:web:5b941b256d41f5a95e8f19",
  measurementId: "G-ZX5CQ2SHQX"
};

/**
 * Singleton class for Firebase services
 * Ensures only one instance of Firebase is initialized across the app
 */
class FirebaseService {
  private static instance: FirebaseService;
  private _app: FirebaseApp;
  private _auth: Auth;
  private _db: Firestore;
  private _database: Database;
  private _storage: FirebaseStorage;
  private _googleProvider: GoogleAuthProvider;

  private constructor() {
    this._app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    this._auth = getAuth(this._app);
    this._db = getFirestore(this._app);
    this._database = getDatabase(this._app);
    this._storage = getStorage(this._app);
    this._googleProvider = new GoogleAuthProvider();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  get app(): FirebaseApp {
    return this._app;
  }

  get auth(): Auth {
    return this._auth;
  }

  get db(): Firestore {
    return this._db;
  }

  get database(): Database {
    return this._database;
  }

  get storage(): FirebaseStorage {
    return this._storage;
  }

  get googleProvider(): GoogleAuthProvider {
    return this._googleProvider;
  }
}

// Export singleton instance
export const firebaseService = FirebaseService.getInstance();

// Export convenience getters for backward compatibility
export const auth = firebaseService.auth;
export const db = firebaseService.db;
export const database = firebaseService.database;
export const storage = firebaseService.storage;
export const googleProvider = firebaseService.googleProvider;
export default firebaseService.app;
