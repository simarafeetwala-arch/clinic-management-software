import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Patient } from '../types';

import { getInitialPatients } from './seedData';

const COLLECTION_NAME = 'patients';
const LOCAL_STORAGE_KEY = 'carepulse_patients_backup';

// Helper to save to local backup
const saveLocalBackup = (patients: Patient[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error('Failed to save local backup', e);
  }
};

// Helper to load from local backup
export const getLocalBackup = (): Patient[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }
  const initial = getInitialPatients();
  saveLocalBackup(initial);
  return initial;
};

export const subscribeToPatients = (
  onData: (patients: Patient[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const patients: Patient[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            age: Number(data.age) || 0,
            gender: data.gender || 'Male',
            bloodGroup: data.bloodGroup || '',
            address: data.address || '',
            medicalHistory: data.medicalHistory || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt,
          } as Patient;
        });
        saveLocalBackup(patients);
        onData(patients);
      },
      (error) => {
        console.warn('Firestore patients snapshot listener error:', error);
        // Fallback to local storage if firestore rules require adjustment
        const backup = getLocalBackup();
        onData(backup);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Error setting up firestore patients listener:', err);
    onData(getLocalBackup());
    return () => {};
  }
};

export const createPatient = async (patientData: Omit<Patient, 'id' | 'createdAt'>): Promise<string> => {
  const cleanData = {
    ...patientData,
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData);
    return docRef.id;
  } catch (error: any) {
    console.warn('Firestore createPatient failed, writing to local backup:', error);
    // Local fallback
    const localId = 'pat_' + Date.now();
    const newPatient: Patient = {
      ...patientData,
      id: localId,
      createdAt: new Date().toISOString(),
    };
    const current = getLocalBackup();
    saveLocalBackup([newPatient, ...current]);
    return localId;
  }
};

export const updatePatient = async (id: string, updates: Partial<Patient>): Promise<void> => {
  const updatePayload = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.warn('Firestore updatePatient failed, updating local backup:', error);
    const current = getLocalBackup();
    const updated = current.map(p => p.id === id ? { ...p, ...updatePayload } : p);
    saveLocalBackup(updated);
  }
};

export const deletePatient = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore deletePatient failed, removing from local backup:', error);
    const current = getLocalBackup();
    saveLocalBackup(current.filter(p => p.id !== id));
  }
};
