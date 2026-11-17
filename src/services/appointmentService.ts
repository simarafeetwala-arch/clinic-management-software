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
import { Appointment, PaymentStatus, PaymentMethod } from '../types';

import { getInitialAppointments } from './seedData';

const COLLECTION_NAME = 'appointments';
const LOCAL_STORAGE_KEY = 'carepulse_appointments_backup';

const saveLocalBackup = (appointments: Appointment[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.error('Failed to save appointments local backup', e);
  }
};

export const getAppointmentsBackup = (): Appointment[] => {
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
  const initial = getInitialAppointments();
  saveLocalBackup(initial);
  return initial;
};

export const subscribeToAppointments = (
  onData: (appointments: Appointment[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('appointmentDate', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointments: Appointment[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const serviceAmount = Number(data.serviceAmount) || 0;
          const paidAmount = Number(data.paidAmount) || 0;
          const pendingBalance = Math.max(0, serviceAmount - paidAmount);
          let paymentStatus: PaymentStatus = 'Pending';
          if (paidAmount >= serviceAmount && serviceAmount > 0) {
            paymentStatus = 'Paid';
          } else if (paidAmount > 0) {
            paymentStatus = 'Partial';
          }

          return {
            id: docSnap.id,
            patientId: data.patientId || '',
            patientName: data.patientName || '',
            patientPhone: data.patientPhone || '',
            serviceName: data.serviceName || 'General Consultation',
            doctorName: data.doctorName || 'Dr. Smith',
            appointmentDate: data.appointmentDate || new Date().toISOString().split('T')[0],
            appointmentTime: data.appointmentTime || '10:00',
            status: data.status || 'Scheduled',
            serviceAmount,
            paidAmount,
            pendingBalance,
            paymentStatus: data.paymentStatus || paymentStatus,
            paymentMethod: data.paymentMethod || 'Cash',
            notes: data.notes || '',
            staffEmail: data.staffEmail || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt,
          } as Appointment;
        });

        // Sort by date descending, then time
        appointments.sort((a, b) => {
          const dateComp = b.appointmentDate.localeCompare(a.appointmentDate);
          if (dateComp !== 0) return dateComp;
          return b.appointmentTime.localeCompare(a.appointmentTime);
        });

        saveLocalBackup(appointments);
        onData(appointments);
      },
      (error) => {
        console.warn('Firestore appointments snapshot listener error:', error);
        const backup = getAppointmentsBackup();
        onData(backup);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Error setting up appointments listener:', err);
    onData(getAppointmentsBackup());
    return () => {};
  }
};

export const createAppointment = async (
  appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'pendingBalance' | 'paymentStatus'>
): Promise<string> => {
  const serviceAmount = Number(appointmentData.serviceAmount) || 0;
  const paidAmount = Number(appointmentData.paidAmount) || 0;
  const pendingBalance = Math.max(0, serviceAmount - paidAmount);

  let paymentStatus: PaymentStatus = 'Pending';
  if (paidAmount >= serviceAmount && serviceAmount > 0) {
    paymentStatus = 'Paid';
  } else if (paidAmount > 0) {
    paymentStatus = 'Partial';
  }

  const payload = {
    ...appointmentData,
    serviceAmount,
    paidAmount,
    pendingBalance,
    paymentStatus,
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return docRef.id;
  } catch (error) {
    console.warn('Firestore createAppointment failed, using local backup:', error);
    const localId = 'apt_' + Date.now();
    const newAppointment: Appointment = {
      ...payload,
      id: localId,
    };
    const current = getAppointmentsBackup();
    saveLocalBackup([newAppointment, ...current]);
    return localId;
  }
};

export const updateAppointment = async (
  id: string, 
  updates: Partial<Appointment>
): Promise<void> => {
  const updatePayload: any = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (updates.serviceAmount !== undefined || updates.paidAmount !== undefined) {
    const serviceAmount = Number(updates.serviceAmount ?? 0);
    const paidAmount = Number(updates.paidAmount ?? 0);
    const pendingBalance = Math.max(0, serviceAmount - paidAmount);
    
    let paymentStatus: PaymentStatus = 'Pending';
    if (paidAmount >= serviceAmount && serviceAmount > 0) {
      paymentStatus = 'Paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'Partial';
    }
    updatePayload.pendingBalance = pendingBalance;
    updatePayload.paymentStatus = paymentStatus;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.warn('Firestore updateAppointment failed, updating local backup:', error);
    const current = getAppointmentsBackup();
    const updated = current.map(a => a.id === id ? { ...a, ...updatePayload } : a);
    saveLocalBackup(updated);
  }
};

export const recordPayment = async (
  appointment: Appointment,
  additionalAmount: number,
  method: PaymentMethod,
  note?: string
): Promise<void> => {
  const newPaidAmount = appointment.paidAmount + additionalAmount;
  const newPendingBalance = Math.max(0, appointment.serviceAmount - newPaidAmount);
  
  let newPaymentStatus: PaymentStatus = 'Pending';
  if (newPaidAmount >= appointment.serviceAmount) {
    newPaymentStatus = 'Paid';
  } else if (newPaidAmount > 0) {
    newPaymentStatus = 'Partial';
  }

  const updates: Partial<Appointment> = {
    paidAmount: newPaidAmount,
    pendingBalance: newPendingBalance,
    paymentStatus: newPaymentStatus,
    paymentMethod: method,
    notes: note ? `${appointment.notes ? appointment.notes + ' | ' : ''}Payment of ₹${additionalAmount} received via ${method} on ${new Date().toLocaleDateString()}` : appointment.notes,
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, appointment.id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.warn('Firestore recordPayment failed, updating local backup:', error);
    const current = getAppointmentsBackup();
    const updated = current.map(a => a.id === appointment.id ? { ...a, ...updates } : a);
    saveLocalBackup(updated);
  }
};

export const deleteAppointment = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore deleteAppointment failed, removing from local backup:', error);
    const current = getAppointmentsBackup();
    saveLocalBackup(current.filter(a => a.id !== id));
  }
};
