import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView } from './components/AuthView';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AppointmentsList } from './components/AppointmentsList';
import { PatientList } from './components/PatientList';
import { DateWiseRecords } from './components/DateWiseRecords';
import { PatientModal } from './components/PatientModal';
import { AppointmentModal } from './components/AppointmentModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';

import { Patient, Appointment } from './types';
import { subscribeToPatients } from './services/patientService';
import { subscribeToAppointments } from './services/appointmentService';

import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  TrendingUp, 
  Stethoscope 
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'patients' | 'records'>('dashboard');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [preSelectedPatientId, setPreSelectedPatientId] = useState<string | undefined>(undefined);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAppointmentForPayment, setSelectedAppointmentForPayment] = useState<Appointment | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedAppointmentForReceipt, setSelectedAppointmentForReceipt] = useState<Appointment | null>(null);

  // Subscribe to realtime patient and appointment streams
  useEffect(() => {
    if (!currentUser) return;

    const unsubPatients = subscribeToPatients((pats) => {
      setPatients(pats);
    });

    const unsubAppointments = subscribeToAppointments((apts) => {
      setAppointments(apts);
    });

    return () => {
      unsubPatients();
      unsubAppointments();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white mb-4 shadow-lg animate-bounce">
          <Stethoscope className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Connecting to CarePulse Clinic...</p>
        <p className="text-xs text-slate-400 mt-1">Initializing Firebase Authentication</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView />;
  }

  // Action handlers
  const handleOpenNewPatient = () => {
    setPatientToEdit(null);
    setIsPatientModalOpen(true);
  };

  const handleEditPatient = (pat: Patient) => {
    setPatientToEdit(pat);
    setIsPatientModalOpen(true);
  };

  const handleOpenBookAppointment = (patientId?: string) => {
    setAppointmentToEdit(null);
    setPreSelectedPatientId(patientId);
    setIsAppointmentModalOpen(true);
  };

  const handleEditAppointment = (apt: Appointment) => {
    setAppointmentToEdit(apt);
    setPreSelectedPatientId(undefined);
    setIsAppointmentModalOpen(true);
  };

  const handleCollectPayment = (apt: Appointment) => {
    setSelectedAppointmentForPayment(apt);
    setIsPaymentModalOpen(true);
  };

  const handleViewReceipt = (apt: Appointment) => {
    setSelectedAppointmentForReceipt(apt);
    setIsReceiptModalOpen(true);
  };

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: appointments.length },
    { id: 'patients', label: 'Patients', icon: Users, badge: patients.length },
    { id: 'records', label: 'Date-wise Records & Billing', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      <Navbar 
        onOpenBookAppointment={() => handleOpenBookAppointment()} 
        onOpenNewPatient={handleOpenNewPatient} 
      />

      {/* Main Tab Navigation Bar */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-teal-200/70 text-teal-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {activeTab === 'dashboard' && (
          <Dashboard 
            appointments={appointments} 
            patients={patients}
            onOpenBookAppointment={() => handleOpenBookAppointment()}
            onOpenNewPatient={handleOpenNewPatient}
            onNavigateToTab={(t) => setActiveTab(t)}
            onViewReceipt={handleViewReceipt}
            onCollectPayment={handleCollectPayment}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsList 
            appointments={appointments}
            onOpenBookAppointment={() => handleOpenBookAppointment()}
            onEditAppointment={handleEditAppointment}
            onCollectPayment={handleCollectPayment}
            onViewReceipt={handleViewReceipt}
          />
        )}

        {activeTab === 'patients' && (
          <PatientList 
            patients={patients}
            appointments={appointments}
            onOpenNewPatient={handleOpenNewPatient}
            onEditPatient={handleEditPatient}
            onBookForPatient={(p) => handleOpenBookAppointment(p.id)}
          />
        )}

        {activeTab === 'records' && (
          <DateWiseRecords 
            appointments={appointments}
            onViewReceipt={handleViewReceipt}
            onCollectPayment={handleCollectPayment}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>CarePulse Clinic Management Software • Powered by Firebase & Antigravity</p>
      </footer>

      {/* Modals */}
      <PatientModal 
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        patientToEdit={patientToEdit}
      />

      <AppointmentModal 
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        patients={patients}
        appointmentToEdit={appointmentToEdit}
        selectedPatientId={preSelectedPatientId}
        onOpenNewPatientModal={() => {
          setIsAppointmentModalOpen(false);
          setIsPatientModalOpen(true);
        }}
      />

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedAppointmentForPayment(null);
        }}
        appointment={selectedAppointmentForPayment}
        onPaymentSuccess={(updatedApt) => {
          handleViewReceipt(updatedApt);
        }}
      />

      <ReceiptModal 
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedAppointmentForReceipt(null);
        }}
        appointment={selectedAppointmentForReceipt}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
