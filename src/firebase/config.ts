import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBsxifY5Z9gggTgnAqSQs-OiRI3EP6y8iw",
  authDomain: "clinic-management-softwa-79eb4.firebaseapp.com",
  projectId: "clinic-management-softwa-79eb4",
  storageBucket: "clinic-management-softwa-79eb4.firebasestorage.app",
  messagingSenderId: "508896894481",
  appId: "1:508896894481:web:1011d20f50cb0350505bb0",
  measurementId: "G-CNC0EN4QCY"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
