import React from 'react';
import { Appointment } from '../types';
import { X, Printer, Stethoscope, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  appointment
}) => {
  if (!isOpen || !appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = `CP-${appointment.id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Modal Toolbar (hidden when printing) */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 print:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Payment Invoice & Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-8 bg-white text-slate-800 space-y-6">
          
          {/* Clinic Brand Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">CarePulse Clinic</h1>
                <p className="text-xs text-slate-500">Comprehensive Medical & Healthcare Services</p>
                <p className="text-[11px] text-slate-400">Tel: +91 98765 00000 • contact@carepulse.med</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                OFFICIAL RECEIPT
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1.5">{receiptNumber}</p>
              <p className="text-[11px] text-slate-500">Date: {appointment.appointmentDate}</p>
            </div>
          </div>

          {/* Patient Details & Doctor */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Patient Details</p>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{appointment.patientName}</p>
              <p className="text-slate-600">Contact: {appointment.patientPhone}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Attending Doctor</p>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{appointment.doctorName}</p>
              <p className="text-slate-600">Time: {appointment.appointmentTime}</p>
            </div>
          </div>

          {/* Service Line Item Table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-left">
                <th className="py-2">Service Description</th>
                <th className="py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3">
                  <p className="font-bold text-slate-800">{appointment.serviceName}</p>
                  <p className="text-[11px] text-slate-500">Mode: {appointment.paymentMethod}</p>
                  {appointment.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-0.5">Note: {appointment.notes}</p>
                  )}
                </td>
                <td className="py-3 text-right font-semibold text-slate-800">
                  ₹{appointment.serviceAmount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Financial Breakdown */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-right">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Service Fee:</span>
              <span className="font-bold text-slate-800">₹{appointment.serviceAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Received ({appointment.paymentMethod}):</span>
              <span className="font-bold text-emerald-700">₹{appointment.paidAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-black border-t border-dashed border-slate-300 pt-2">
              <span className={appointment.pendingBalance > 0 ? 'text-amber-800' : 'text-slate-700'}>
                Remaining Balance:
              </span>
              <span className={appointment.pendingBalance > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                ₹{appointment.pendingBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Status Badge & Stamp */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Status: {appointment.paymentStatus.toUpperCase()}</span>
            </div>
            <div className="text-center">
              <div className="h-8 w-24 border-b border-slate-300 mx-auto" />
              <p className="text-[10px] text-slate-400 mt-1">Authorized Signatory</p>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-400 border-t border-slate-100 pt-3">
            Thank you for trusting CarePulse Clinic. Wishing you good health!
          </p>
        </div>

      </div>
    </div>
  );
};
