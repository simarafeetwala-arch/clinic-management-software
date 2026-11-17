import { auth, db, firebaseConfig } from './config';
import { collection, addDoc, deleteDoc } from 'firebase/firestore';

export interface FirebaseConnectionStatus {
  initialized: boolean;
  projectId: string;
  authReady: boolean;
  authError?: string;
  firestoreReady: boolean;
  firestoreError?: string;
  testing: boolean;
}

export const testLiveFirebase = async (): Promise<{
  authOk: boolean;
  authMsg: string;
  firestoreOk: boolean;
  firestoreMsg: string;
}> => {
  let authOk = false;
  let authMsg = '';
  let firestoreOk = false;
  let firestoreMsg = '';

  // 1. Check Auth
  try {
    if (auth.app) {
      authOk = true;
      authMsg = `Connected to Firebase Project (${firebaseConfig.projectId})`;
    }
  } catch (e: any) {
    authOk = false;
    authMsg = e?.message || 'Auth initialization failed';
  }

  // 2. Check Firestore Write/Read
  try {
    const testCol = collection(db, '_connection_test');
    const docRef = await addDoc(testCol, {
      test: true,
      timestamp: new Date().toISOString()
    });
    // Clean up test doc
    try {
      await deleteDoc(docRef);
    } catch {}
    firestoreOk = true;
    firestoreMsg = 'Cloud Firestore is live and accepting reads & writes!';
  } catch (e: any) {
    firestoreOk = false;
    if (e?.code === 'permission-denied' || e?.message?.includes('Cloud Firestore API has not been used')) {
      firestoreMsg = 'Cloud Firestore database has not been created yet in Firebase Console. Click "Create Database" in Firebase Console to activate cloud storage.';
    } else {
      firestoreMsg = e?.message || 'Firestore connection check failed.';
    }
  }

  return { authOk, authMsg, firestoreOk, firestoreMsg };
};
