import React, { useState, useEffect } from 'react';
import { Patient, Appointment, PaymentMethod, AppointmentStatus } from '../types';
import { createAppointment, updateAppointment } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Stethoscope, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Check, 
  Plus, 
  AlertCircle 
} from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  appointmentToEdit?: Appointment | null;
  onOpenNewPatientModal: () => void;
  selectedPatientId?: string;
}

const COMMON_SERVICES = [
  { name: 'General Consultation', fee: 500, doctor: 'Dr. Sarah Mitchell (General Physician)' },
  { name: 'Dental Cleaning & Polish', fee: 1200, doctor: 'Dr. Rajiv Patel (Dentist)' },
  { name: 'Root Canal Treatment', fee: 4500, doctor: 'Dr. Rajiv Patel (Endodontist)' },
  { name: 'Cardiology Consultation', fee: 1500, doctor: 'Dr. Marcus Vance (Cardiologist)' },
  { name: 'Dermatology & Skin Check', fee: 900, doctor: 'Dr. Elena Rostova (Dermatologist)' },
  { name: 'Orthopedic Joint Consultation', fee: 1200, doctor: 'Dr. Vikram Seth (Orthopedics)' },
  { name: 'Pediatric Child Care', fee: 700, doctor: 'Dr. Ananya Roy (Pediatrician)' },
  { name: 'Complete Blood & Lipid Lab Profile', fee: 1800, doctor: 'CarePulse Diagnostics Lab' },
  { name: 'Ultrasound / Radiology Scan', fee: 2200, doctor: 'Dr. Neil Armstrong (Radiologist)' },
  { name: 'Eye Checkup & Refraction', fee: 600, doctor: 'Dr. Clara Oswald (Ophthalmologist)' },
];

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  patients,
  appointmentToEdit,
  onOpenNewPatientModal,
  selectedPatientId
}) => {
  const { currentUser } = useAuth();
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [serviceName, setServiceName] = useState('General Consultation');
  const [customServiceName, setCustomServiceName] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Mitchell (General Physician)');
  const [appointmentDate, setAppointmentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [status, setStatus] = useState<AppointmentStatus>('Scheduled');
  
  const [serviceAmount, setServiceAmount] = useState<number>(500);
  const [paidAmount, setPaidAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset
  useEffect(() => {
    if (appointmentToEdit) {
      const pat = patients.find(p => p.id === appointmentToEdit.patientId);
      if (pat) {
        setSelectedPatient(pat);
        setPatientSearch(pat.name);
      } else {
        setSelectedPatient({
          id: appointmentToEdit.patientId,
          name: appointmentToEdit.patientName,
          phone: appointmentToEdit.patientPhone,
          age: 0,
          gender: 'Male',
          createdAt: ''
        });
        setPatientSearch(appointmentToEdit.patientName);
      }
      setServiceName(appointmentToEdit.serviceName);
      setDoctorName(appointmentToEdit.doctorName);
      setAppointmentDate(appointmentToEdit.appointmentDate);
      setAppointmentTime(appointmentToEdit.appointmentTime);
      setStatus(appointmentToEdit.status);
      setServiceAmount(appointmentToEdit.serviceAmount);
      setPaidAmount(appointmentToEdit.paidAmount);
      setPaymentMethod(appointmentToEdit.paymentMethod);
      setNotes(appointmentToEdit.notes || '');
    } else {
      if (selectedPatientId) {
        const pat = patients.find(p => p.id === selectedPatientId);
        if (pat) {
          setSelectedPatient(pat);
          setPatientSearch(pat.name);
        }
      } else {
        setSelectedPatient(null);
        setPatientSearch('');
      }
      setServiceName('General Consultation');
      setCustomServiceName('');
      setDoctorName('Dr. Sarah Mitchell (General Physician)');
      setAppointmentDate(new Date().toISOString().split('T')[0]);
      setAppointmentTime('10:00');
      setStatus('Scheduled');
      setServiceAmount(500);
      setPaidAmount(500);
      setPaymentMethod('Cash');
      setNotes('');
    }
    setError(null);
  }, [appointmentToEdit, isOpen, selectedPatientId, patients]);

  if (!isOpen) return null;

  // Filter patients based on search
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone.includes(patientSearch)
  );

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.name);
  };

  const handleServiceChange = (name: string) => {
    setServiceName(name);
    const preset = COMMON_SERVICES.find(s => s.name === name);
    if (preset) {
      setServiceAmount(preset.fee);
      setPaidAmount(preset.fee); // default full paid
      setDoctorName(preset.doctor);
    }
  };

  const pendingBalance = Math.max(0, serviceAmount - paidAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      setError('Please select or register a patient for this appointment.');
      return;
    }

    const finalService = serviceName === 'Custom' ? customServiceName.trim() : serviceName;
    if (!finalService) {
      setError('Please enter service details.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientPhone: selectedPatient.phone,
      serviceName: finalService,
      doctorName: doctorName.trim() || 'General Physician',
      appointmentDate,
      appointmentTime,
      status,
      serviceAmount: Number(serviceAmount) || 0,
      paidAmount: Number(paidAmount) || 0,
      paymentMethod,
      notes: notes.trim() || undefined,
      staffEmail: currentUser?.email || 'staff@clinic.com',
    };

    try {
      if (appointmentToEdit) {
        await updateAppointment(appointmentToEdit.id, payload);
      } else {
        await createAppointment(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record appointment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {appointmentToEdit ? 'Edit Appointment' : 'Book New Appointment'}
              </h2>
              <p className="text-xs text-slate-500">Service details, doctor assignment and billing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Selection Box */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-600" />
                <span>1. Select Patient *</span>
              </label>
              <button
                type="button"
                onClick={onOpenNewPatientModal}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register New Patient</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient by name or phone number..."
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  if (selectedPatient && selectedPatient.name !== e.target.value) {
                    setSelectedPatient(null);
                  }
                }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
              />
            </div>

            {/* Selected Patient Banner or Patient Suggestions */}
            {selectedPatient ? (
              <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-teal-900">{selectedPatient.name}</p>
                  <p className="text-xs text-teal-700 font-medium">
                    Phone: {selectedPatient.phone} {selectedPatient.age ? `• ${selectedPatient.age} yrs` : ''} {selectedPatient.gender ? `• ${selectedPatient.gender}` : ''} {selectedPatient.bloodGroup ? `• Blood: ${selectedPatient.bloodGroup}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}
                  className="text-xs font-medium text-teal-700 hover:text-rose-600 underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : patientSearch.trim() && (
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 shadow-sm">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => handleSelectPatient(p)}
                      className="w-full text-left px-3 py-2 hover:bg-teal-50/50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.phone} • {p.gender} • {p.age || 'N/A'} yrs</p>
                      </div>
                      <span className="text-xs font-semibold text-teal-600">Select</span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No matching patient found.
                    <button
                      type="button"
                      onClick={onOpenNewPatientModal}
                      className="block mx-auto mt-1 font-semibold text-teal-600 hover:underline"
                    >
                      + Register "{patientSearch}" now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Service & Doctor Details */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>2. Service & Doctor Details</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Service / Procedure
                </label>
                <select
                  value={serviceName}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  {COMMON_SERVICES.map(s => (
                    <option key={s.name} value={s.name}>
                      {s.name} (₹{s.fee})
                    </option>
                  ))}
                  <option value="Custom">Custom Service...</option>
                </select>
              </div>

              {serviceName === 'Custom' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Custom Service Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Physiotherapy Session"
                    value={customServiceName}
                    onChange={(e) => setCustomServiceName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Assigned Doctor / Specialist
                </label>
                <input
                  type="text"
                  required
                  placeholder="Doctor's name"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Appointment Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Time Slot
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    required
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Appointment Status
                </label>
                <div className="flex gap-2">
                  {(['Scheduled', 'Completed', 'Cancelled'] as AppointmentStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        status === st
                          ? st === 'Completed'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : st === 'Cancelled'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Billing & Payment Details */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>3. Financial & Billing Records</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Service Amount (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={serviceAmount}
                  onChange={(e) => setServiceAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Paid Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  max={serviceAmount}
                  required
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Math.min(serviceAmount, Math.max(0, Number(e.target.value))))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Pending Balance (₹)
                </label>
                <div className={`px-3 py-2 text-sm font-bold rounded-xl border ${
                  pendingBalance > 0 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  ₹{pendingBalance.toLocaleString('en-IN')}
                  <span className="text-[10px] ml-1 font-medium">
                    {pendingBalance === 0 ? '(Fully Paid)' : '(Due)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Insurance">Medical Insurance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Quick Paid Presets
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaidAmount(serviceAmount)}
                    className="flex-1 py-1.5 text-xs font-medium bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    Full (₹{serviceAmount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidAmount(Math.round(serviceAmount / 2))}
                    className="flex-1 py-1.5 text-xs font-medium bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    Half (₹{Math.round(serviceAmount / 2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidAmount(0)}
                    className="flex-1 py-1.5 text-xs font-medium bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    None (₹0)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Consultation / Clinical Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Prescription summary, symptoms or follow-up instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
              />
            </div>
          </div>

          {/* Footer Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{appointmentToEdit ? 'Update Appointment' : 'Confirm & Book Appointment'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
