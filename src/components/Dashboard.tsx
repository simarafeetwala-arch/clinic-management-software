import React from 'react';
import { Appointment, Patient } from '../types';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  CalendarPlus, 
  UserPlus, 
  ArrowRight,
  Printer,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  appointments: Appointment[];
  patients: Patient[];
  onOpenBookAppointment: () => void;
  onOpenNewPatient: () => void;
  onNavigateToTab: (tab: 'appointments' | 'patients' | 'records') => void;
  onViewReceipt: (appointment: Appointment) => void;
  onCollectPayment: (appointment: Appointment) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  appointments,
  patients,
  onOpenBookAppointment,
  onOpenNewPatient,
  onNavigateToTab,
  onViewReceipt,
  onCollectPayment
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Totals across all time
  const totalAppointments = appointments.length;
  const totalCollected = appointments.reduce((acc, a) => acc + a.paidAmount, 0);
  const totalBilled = appointments.reduce((acc, a) => acc + a.serviceAmount, 0);
  const totalPending = appointments.reduce((acc, a) => acc + a.pendingBalance, 0);
  const totalPatients = patients.length;

  // Today's metrics
  const todayAppointments = appointments.filter(a => a.appointmentDate === todayStr);
  const todayCollected = todayAppointments.reduce((acc, a) => acc + a.paidAmount, 0);

  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-semibold backdrop-blur-xs mb-3 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Firebase Sync Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Clinic Operations Dashboard
            </h1>
            <p className="text-teal-100 text-sm mt-1 max-w-xl">
              Track appointments, patient registrations, fee collections and outstanding balances in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewPatient}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/30 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Patient</span>
            </button>
            <button
              onClick={onOpenBookAppointment}
              className="px-5 py-2.5 bg-white text-teal-900 hover:bg-teal-50 text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4 text-teal-600" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards - Requirement 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Appointments
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{totalAppointments}</p>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-500">Today: <strong className="text-teal-700">{todayAppointments.length} visits</strong></span>
            <button 
              onClick={() => onNavigateToTab('appointments')}
              className="text-teal-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Total Amount Collected */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-sm transition-all bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Amount Collected
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-700 mt-3">
            ₹{totalCollected.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs text-emerald-600">
            <span>Today collected: <strong>₹{todayCollected.toLocaleString('en-IN')}</strong></span>
            <span className="font-semibold text-emerald-800">{collectionRate}% rate</span>
          </div>
        </div>

        {/* Total Pending Balance */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs hover:shadow-sm transition-all bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pending Balance
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-800 mt-3">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-amber-700">Outstanding patient dues</span>
            <button 
              onClick={() => onNavigateToTab('records')}
              className="text-amber-800 font-semibold hover:underline flex items-center gap-0.5"
            >
              Collect <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Total Registered Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Patients
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{totalPatients}</p>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>Registered in database</span>
            <button 
              onClick={() => onNavigateToTab('patients')}
              className="text-sky-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              Directory <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Today's Appointments Spotlight */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Today's Appointment Schedule</h2>
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('appointments')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Appointments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-600">No appointments scheduled for today yet.</p>
            <button
              onClick={onOpenBookAppointment}
              className="mt-2 text-xs font-bold text-teal-600 hover:underline inline-flex items-center gap-1"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Book today's first appointment</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    {apt.appointmentTime}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{apt.patientName}</h4>
                    <p className="text-xs text-teal-700 font-medium">{apt.serviceName} • {apt.doctorName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="font-bold text-slate-800">Fee: ₹{apt.serviceAmount}</span>
                    <span className="block text-[11px] text-emerald-700">Paid: ₹{apt.paidAmount}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    apt.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : apt.paymentStatus === 'Partial'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {apt.paymentStatus}
                  </span>

                  {apt.pendingBalance > 0 && (
                    <button
                      onClick={() => onCollectPayment(apt)}
                      className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer"
                    >
                      Collect ₹{apt.pendingBalance}
                    </button>
                  )}

                  <button
                    onClick={() => onViewReceipt(apt)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings & Quick Help */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Bookings table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Recent Appointments</h3>
            <button
              onClick={() => onNavigateToTab('appointments')}
              className="text-xs text-teal-600 font-medium hover:underline"
            >
              View More
            </button>
          </div>

          {appointments.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No appointments booked yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.slice(0, 5).map(apt => (
                <div key={apt.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{apt.patientName}</p>
                    <p className="text-[11px] text-slate-500">{apt.serviceName} • {apt.appointmentDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">₹{apt.serviceAmount}</p>
                    <p className={`text-[10px] font-semibold ${apt.pendingBalance > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                      {apt.pendingBalance > 0 ? `Due: ₹${apt.pendingBalance}` : 'Fully Paid'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operations Guide */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Clinic Workflow Checklist</h3>
          <ul className="text-xs text-slate-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span><strong>1. Staff Auth:</strong> Secure login with Firebase Auth & role session persistence.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span><strong>2. Patient Registration:</strong> Register patient once, easily select on future visits.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span><strong>3. Service & Fee:</strong> Pick from 10+ standard medical services or set custom fee.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span><strong>4. Balance Calculation:</strong> Auto-computes pending dues & updates payment receipts.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span><strong>5. Date-wise Audit:</strong> Filter collections by date and export CSV reports.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
