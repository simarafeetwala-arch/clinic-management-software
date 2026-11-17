import React, { useState } from 'react';
import { Patient, Appointment } from '../types';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  Calendar, 
  AlertCircle, 
  CalendarPlus, 
  Edit3, 
  FileText,
  Clock,
  ArrowRight,
  Heart,
  ChevronRight
} from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  appointments: Appointment[];
  onOpenNewPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onBookForPatient: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  appointments,
  onOpenNewPatient,
  onEditPatient,
  onBookForPatient
}) => {
  const [search, setSearch] = useState('');
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Calculate patient financials
  const getPatientSummary = (patientId: string) => {
    const patientAppointments = appointments.filter(a => a.patientId === patientId);
    const totalVisits = patientAppointments.length;
    const totalSpent = patientAppointments.reduce((acc, curr) => acc + curr.serviceAmount, 0);
    const totalPaid = patientAppointments.reduce((acc, curr) => acc + curr.paidAmount, 0);
    const totalDue = patientAppointments.reduce((acc, curr) => acc + curr.pendingBalance, 0);
    return { totalVisits, totalSpent, totalPaid, totalDue, appointments: patientAppointments };
  };

  return (
    <div className="space-y-6">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>Patient Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage registered patients, visit history and billing profiles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            />
          </div>

          <button
            onClick={onOpenNewPatient}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Cards / Table */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No patients found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {search ? 'Try adjusting your search query.' : 'Get started by registering your first clinic patient.'}
          </p>
          <button
            onClick={onOpenNewPatient}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all cursor-pointer border border-teal-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const summary = getPatientSummary(patient.id);
            return (
              <div 
                key={patient.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{patient.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{patient.phone}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {patient.gender} • {patient.age ? `${patient.age}y` : 'Age N/A'}
                    </span>
                  </div>

                  {/* Badges / Medical Info */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {patient.bloodGroup && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        <Heart className="w-3 h-3 text-rose-500" />
                        {patient.bloodGroup}
                      </span>
                    )}
                    {patient.medicalHistory && (
                      <span className="text-[10px] text-slate-600 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 truncate max-w-[200px]" title={patient.medicalHistory}>
                        Notes: {patient.medicalHistory}
                      </span>
                    )}
                  </div>

                  {/* Financial Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <p className="text-[10px] text-slate-500 font-medium">Visits</p>
                      <p className="text-xs font-bold text-slate-800">{summary.totalVisits}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <p className="text-[10px] text-slate-500 font-medium">Paid</p>
                      <p className="text-xs font-bold text-emerald-700">₹{summary.totalPaid}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${summary.totalDue > 0 ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-800'}`}>
                      <p className="text-[10px] opacity-80 font-medium">Balance Due</p>
                      <p className="text-xs font-bold">₹{summary.totalDue}</p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => onEditPatient(patient)}
                    className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Patient"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedPatientHistory(patient)}
                    className="text-slate-600 hover:text-slate-900 font-medium hover:underline text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>View History</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onBookForPatient(patient)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Book</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Patient History Modal */}
      {selectedPatientHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-base font-bold text-slate-800">{selectedPatientHistory.name} - Patient Record</h3>
                <p className="text-xs text-slate-500">{selectedPatientHistory.phone} • {selectedPatientHistory.gender} • {selectedPatientHistory.age} yrs</p>
              </div>
              <button
                onClick={() => setSelectedPatientHistory(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Appointment & Billing History</h4>
              
              {(() => {
                const hist = getPatientSummary(selectedPatientHistory.id);
                if (hist.appointments.length === 0) {
                  return <p className="text-xs text-slate-400 py-4 text-center">No appointment records yet for this patient.</p>;
                }
                return (
                  <div className="space-y-3">
                    {hist.appointments.map((apt) => (
                      <div key={apt.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{apt.serviceName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              apt.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              apt.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {apt.paymentStatus}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-1">
                            {apt.appointmentDate} at {apt.appointmentTime} • {apt.doctorName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">₹{apt.serviceAmount}</p>
                          <p className="text-emerald-700 font-semibold">Paid: ₹{apt.paidAmount}</p>
                          {apt.pendingBalance > 0 && (
                            <p className="text-amber-800 font-bold">Due: ₹{apt.pendingBalance}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
