export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  address?: string;
  medicalHistory?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';
export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'Other';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  serviceName: string;
  doctorName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  status: AppointmentStatus;
  serviceAmount: number;
  paidAmount: number;
  pendingBalance: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  staffEmail?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentTransaction {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentTime: string;
  paymentMethod: PaymentMethod;
  recordedBy: string;
  note?: string;
}

export interface ClinicStats {
  totalAppointments: number;
  totalRevenue: number;
  totalCollected: number;
  totalPending: number;
  totalPatients: number;
  todayAppointmentsCount: number;
  todayRevenue: number;
  todayCollected: number;
}
