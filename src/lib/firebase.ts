import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const meta = import.meta as any;

const firebaseConfig = {
  apiKey: meta.env?.VITE_FIREBASE_API_KEY || firebaseAppletConfig?.apiKey || '',
  authDomain: meta.env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig?.authDomain || '',
  projectId: meta.env?.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig?.projectId || '',
  storageBucket: meta.env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig?.storageBucket || '',
  messagingSenderId: meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig?.messagingSenderId || '',
  appId: meta.env?.VITE_FIREBASE_APP_ID || firebaseAppletConfig?.appId || ''
};

const databaseId = meta.env?.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig?.firestoreDatabaseId || '(default)';

export const isFirebaseConfigured = (): boolean => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
};

// Initialize or get Firebase App
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export { app };
export const auth: Auth = getAuth(app);
export const db: Firestore = (databaseId && databaseId !== '(default)') 
  ? getFirestore(app, databaseId) 
  : getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const getAuthToken = async (): Promise<string> => {
  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (e) {
      console.error('Error getting Firebase ID token:', e);
    }
  }
  return 'demo_token';
};

