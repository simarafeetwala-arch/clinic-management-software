import React, { useState, useMemo } from 'react';
import { Appointment, PaymentStatus } from '../types';
import { 
  Calendar, 
  DollarSign, 
  Download, 
  Printer, 
  TrendingUp, 
  CreditCard, 
  Clock, 
  FileText,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DateWiseRecordsProps {
  appointments: Appointment[];
  onViewReceipt: (appointment: Appointment) => void;
  onCollectPayment: (appointment: Appointment) => void;
}

export const DateWiseRecords: React.FC<DateWiseRecordsProps> = ({
  appointments,
  onViewReceipt,
  onCollectPayment
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom' | 'all'>('today');
  
  // Custom range
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [paymentFilter, setPaymentFilter] = useState<'All' | PaymentStatus>('All');

  // Compute active date boundaries based on preset
  const { filterStart, filterEnd } = useMemo(() => {
    const now = new Date();
    if (datePreset === 'all') {
      return { filterStart: '', filterEnd: '' };
    }
    if (datePreset === 'today') {
      return { filterStart: todayStr, filterEnd: todayStr };
    }
    if (datePreset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      return { filterStart: yStr, filterEnd: yStr };
    }
    if (datePreset === 'week') {
      const pastWeek = new Date(now);
      pastWeek.setDate(pastWeek.getDate() - 7);
      return { filterStart: pastWeek.toISOString().split('T')[0], filterEnd: todayStr };
    }
    if (datePreset === 'month') {
      const pastMonth = new Date(now);
      pastMonth.setDate(pastMonth.getDate() - 30);
      return { filterStart: pastMonth.toISOString().split('T')[0], filterEnd: todayStr };
    }
    // custom
    return { filterStart: startDate, filterEnd: endDate };
  }, [datePreset, startDate, endDate, todayStr]);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (filterStart && a.appointmentDate < filterStart) return false;
      if (filterEnd && a.appointmentDate > filterEnd) return false;
      if (paymentFilter !== 'All' && a.paymentStatus !== paymentFilter) return false;
      return true;
    });
  }, [appointments, filterStart, filterEnd, paymentFilter]);

  // Aggregate financials
  const summary = useMemo(() => {
    const totalAppointments = filteredAppointments.length;
    const totalRevenue = filteredAppointments.reduce((acc, curr) => acc + curr.serviceAmount, 0);
    const totalCollected = filteredAppointments.reduce((acc, curr) => acc + curr.paidAmount, 0);
    const totalPending = filteredAppointments.reduce((acc, curr) => acc + curr.pendingBalance, 0);

    // Group by date
    const dateMap: { [date: string]: { appointments: Appointment[]; revenue: number; collected: number; pending: number } } = {};
    filteredAppointments.forEach(a => {
      if (!dateMap[a.appointmentDate]) {
        dateMap[a.appointmentDate] = { appointments: [], revenue: 0, collected: 0, pending: 0 };
      }
      dateMap[a.appointmentDate].appointments.push(a);
      dateMap[a.appointmentDate].revenue += a.serviceAmount;
      dateMap[a.appointmentDate].collected += a.paidAmount;
      dateMap[a.appointmentDate].pending += a.pendingBalance;
    });

    const datesSorted = Object.keys(dateMap).sort((a, b) => b.localeCompare(a));

    return { totalAppointments, totalRevenue, totalCollected, totalPending, dateMap, datesSorted };
  }, [filteredAppointments]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Time', 'Patient Name', 'Phone', 'Doctor', 'Service', 'Total Fee', 'Paid Amount', 'Pending Due', 'Payment Status', 'Method', 'Visit Status'];
    const rows = filteredAppointments.map(a => [
      a.appointmentDate,
      a.appointmentTime,
      `"${a.patientName.replace(/"/g, '""')}"`,
      `"${a.patientPhone}"`,
      `"${a.doctorName.replace(/"/g, '""')}"`,
      `"${a.serviceName.replace(/"/g, '""')}"`,
      a.serviceAmount,
      a.paidAmount,
      a.pendingBalance,
      a.paymentStatus,
      a.paymentMethod,
      a.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CarePulse_Financial_Report_${filterStart || 'all'}_to_${filterEnd || 'records'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <span>Date-wise Appointments & Payment Records</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit daily clinic visits, collections, outstanding patient dues and export reports
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredAppointments.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Date Filter Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Date Preset:
          </span>
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'Last 30 Days' },
            { id: 'all', label: 'All Records' },
            { id: 'custom', label: 'Custom Range' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setDatePreset(p.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                datePreset === p.id 
                  ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-2xs' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Range Row */}
        {datePreset === 'custom' && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Aggregate Financial Metrics for this filter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{summary.totalAppointments}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Visits in selected period</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Billed</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">₹{summary.totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Gross service fees</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Amount Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">₹{summary.totalCollected.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Received payments</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Pending Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-800 mt-2">₹{summary.totalPending.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-amber-700 mt-0.5">Unsettled patient dues</p>
        </div>

      </div>

      {/* Date Groups Breakdown */}
      {summary.datesSorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <p className="text-sm font-bold text-slate-700">No records found for the selected dates</p>
          <p className="text-xs text-slate-500 mt-1">Try switching to 'All Records' or selecting another date.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {summary.datesSorted.map(dateKey => {
            const dayData = summary.dateMap[dateKey];
            const dateObj = new Date(dateKey + 'T12:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div key={dateKey} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                
                {/* Date Header Strip */}
                <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      {dateObj.getDate()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{formattedDate}</h3>
                      <p className="text-[11px] text-slate-500">{dayData.appointments.length} appointment(s)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-slate-600">
                      Billed: <strong className="text-slate-900">₹{dayData.revenue.toLocaleString('en-IN')}</strong>
                    </span>
                    <span className="text-emerald-700">
                      Collected: <strong>₹{dayData.collected.toLocaleString('en-IN')}</strong>
                    </span>
                    {dayData.pending > 0 && (
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Pending: ₹{dayData.pending.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day's appointments table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/40 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Time</th>
                        <th className="py-2.5 px-4 font-semibold">Patient</th>
                        <th className="py-2.5 px-4 font-semibold">Service & Doctor</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Service Fee</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Paid</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Balance Due</th>
                        <th className="py-2.5 px-4 font-semibold">Payment Status</th>
                        <th className="py-2.5 px-4 font-semibold text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dayData.appointments.map(apt => (
                        <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {apt.appointmentTime}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-800">{apt.patientName}</p>
                            <p className="text-[11px] text-slate-500">{apt.patientPhone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-teal-800">{apt.serviceName}</p>
                            <p className="text-[11px] text-slate-500">{apt.doctorName}</p>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">
                            ₹{apt.serviceAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-700">
                            ₹{apt.paidAmount.toLocaleString('en-IN')}
                            <span className="block text-[10px] text-slate-400 font-normal">{apt.paymentMethod}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold">
                            {apt.pendingBalance > 0 ? (
                              <button
                                onClick={() => onCollectPayment(apt)}
                                className="text-amber-800 underline hover:text-amber-900 cursor-pointer"
                                title="Click to collect balance"
                              >
                                ₹{apt.pendingBalance.toLocaleString('en-IN')}
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-semibold">₹0 (Paid)</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              apt.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : apt.paymentStatus === 'Partial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {apt.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => onViewReceipt(apt)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Print / View Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Print</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
