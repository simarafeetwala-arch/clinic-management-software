import React, { useState } from 'react';
import { Appointment, AppointmentStatus, PaymentStatus } from '../types';
import { updateAppointment, deleteAppointment } from '../services/appointmentService';
import { 
  Calendar, 
  Search, 
  Clock, 
  User, 
  Phone, 
  DollarSign, 
  Printer, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Filter, 
  Edit3, 
  Trash2, 
  CalendarPlus 
} from 'lucide-react';

interface AppointmentsListProps {
  appointments: Appointment[];
  onOpenBookAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onCollectPayment: (appointment: Appointment) => void;
  onViewReceipt: (appointment: Appointment) => void;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  onOpenBookAppointment,
  onEditAppointment,
  onCollectPayment,
  onViewReceipt
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | PaymentStatus>('All');
  const [dateFilter, setDateFilter] = useState('');

  // Quick status toggle
  const handleToggleStatus = async (appointment: Appointment, newStatus: AppointmentStatus) => {
    try {
      await updateAppointment(appointment.id, { status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel and remove this appointment record?')) {
      await deleteAppointment(id);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = 
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.patientPhone.includes(search) ||
      a.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || a.paymentStatus === paymentFilter;
    const matchesDate = !dateFilter || a.appointmentDate === dateFilter;

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  return (
    <div className="space-y-6">
      
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>Clinic Appointments</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Realtime schedule, service fees, payment balances and patient consultation records
          </p>
        </div>

        <button
          onClick={onOpenBookAppointment}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient, doctor, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            />
          </div>

          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white text-slate-700"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            >
              <option value="All">All Visit Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid">Fully Paid</option>
              <option value="Partial">Partial Dues</option>
              <option value="Pending">Unpaid (Pending)</option>
            </select>
          </div>

        </div>

        {dateFilter && (
          <div className="flex items-center justify-between text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
            <span>Showing appointments for <strong>{dateFilter}</strong></span>
            <button
              onClick={() => setDateFilter('')}
              className="font-semibold underline cursor-pointer"
            >
              Clear Date Filter
            </button>
          </div>
        )}
      </div>

      {/* Appointments List / Table */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No appointments found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {search || dateFilter || statusFilter !== 'All' 
              ? 'Try clearing active filters to see all appointments.'
              : 'Book an appointment with patient details to get started.'}
          </p>
          <button
            onClick={onOpenBookAppointment}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              
              {/* Left Column: Date, Time & Patient */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase text-teal-600 tracking-wider">
                    {new Date(apt.appointmentDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-black text-slate-800 leading-none mt-0.5">
                    {new Date(apt.appointmentDate + 'T12:00:00').getDate()}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5 font-medium">
                    {apt.appointmentTime}
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{apt.patientName}</h3>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">{apt.patientPhone}</span>
                    
                    {/* Status Pill */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      apt.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : apt.status === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-sky-100 text-sky-800 border border-sky-200'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-teal-700 mt-1">
                    {apt.serviceName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Doctor: <span className="text-slate-700 font-medium">{apt.doctorName}</span>
                  </p>
                  
                  {apt.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 px-2 py-1 rounded-md inline-block">
                      Note: {apt.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Middle / Right: Financial figures & Payment Status */}
              <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                
                <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70 text-right min-w-[120px]">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Fee / Paid</p>
                  <p className="text-xs font-bold text-slate-800">
                    ₹{apt.serviceAmount} <span className="text-slate-400">/</span> <span className="text-emerald-700 font-black">₹{apt.paidAmount}</span>
                  </p>
                  <div className="mt-0.5 flex items-center justify-end gap-1">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      apt.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.paymentStatus === 'Partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {apt.paymentStatus === 'Paid' ? 'Paid' : `Due: ₹${apt.pendingBalance}`}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5">
                  {apt.pendingBalance > 0 && (
                    <button
                      onClick={() => onCollectPayment(apt)}
                      className="px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Collect Pending Due"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Collect ₹{apt.pendingBalance}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onViewReceipt(apt)}
                    className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditAppointment(apt)}
                    className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    title="Edit Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Quick Status dropdown/toggle */}
                  {apt.status === 'Scheduled' && (
                    <button
                      onClick={() => handleToggleStatus(apt, 'Completed')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer"
                      title="Mark as Completed"
                    >
                      Complete
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(apt.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Cancel Appointment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
