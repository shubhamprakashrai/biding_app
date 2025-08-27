import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAEafom6gEsn7W0uAOMIP1npC1crXOt1u8",
  authDomain: "sourcecodelelo-5b19c.firebaseapp.com",
  projectId: "sourcecodelelo-5b19c",
  storageBucket: "sourcecodelelo-5b19c.firebasestorage.app",
  messagingSenderId: "50283774428",
  appId: "1:50283774428:web:5b941b256d41f5a95e8f19",
  measurementId: "G-ZX5CQ2SHQX"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { auth, db, database };
export default app;
