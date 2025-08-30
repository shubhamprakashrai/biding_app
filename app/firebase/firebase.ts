import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signOut as firebaseSignOut,
  UserCredential,
  User
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAEafom6gEsn7W0uAOMIP1npC1crXOt1u8",
  authDomain: "sourcecodelelo-5b19c.firebaseapp.com",
  projectId: "sourcecodelelo-5b19c",
  storageBucket: "sourcecodelelo-5b19c.appspot.com", 
  messagingSenderId: "50283774428",
  appId: "1:50283774428:web:5b941b256d41f5a95e8f19",
  measurementId: "G-ZX5CQ2SHQX"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app); // 👈 removed duplicate line

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();


// Sign in with Google and create user if not exists
export const signInWithGoogle = async (): Promise<User> => {
  try {
    // Sign in with Google
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    if (!user) {
      throw new Error('No user returned from Google sign in');
    }
    
    console.log('Google user signed in:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
    
    // Check if user exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    // Normalize photoURL safely (without mutating user object)
    let photoURL = user.photoURL || '';
    if (photoURL.includes("googleusercontent.com")) {
      if (photoURL.includes("=s")) {
        photoURL = photoURL.replace(/=s\d+(-[a-zA-Z])?$/, "=s400");
      } else {
        photoURL = `${photoURL}=s400`;
      }
    }
    
    const userData = {
      uid: user.uid,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: photoURL,   // store normalized photoURL here
      role: 'USER', // Default role
      provider: 'google.com',
      emailVerified: user.emailVerified,
      updatedAt: serverTimestamp()
    };
    
    // If user doesn't exist, create a new user document
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      }, { merge: true });
      console.log('New user created in Firestore');
    } else {
      // Update last login time for existing user
      await setDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        photoURL: userData.photoURL || userDoc.data()?.photoURL || ''
      }, { merge: true });
    }
    
    // Return the complete user data
    const updatedUserDoc = await getDoc(userDocRef);
    const completeUserData = {
      ...userData,
      ...updatedUserDoc.data(),
      id: user.uid
    };
    
    // Store in localStorage for immediate UI update
    localStorage.setItem('user', JSON.stringify(completeUserData));
    
    // Force a refresh to update the Navigation component
    window.dispatchEvent(new Event('storage'));
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};


// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export { auth, db, database, googleProvider, storage };
export default app;
