import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseConfig } from '../firebase/config';
import { testLiveFirebase } from '../firebase/status';
import { 
  Stethoscope, 
  LogOut, 
  UserPlus, 
  CalendarPlus, 
  User, 
  Database,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Flame
} from 'lucide-react';

interface NavbarProps {
  onOpenBookAppointment: () => void;
  onOpenNewPatient: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenBookAppointment, 
  onOpenNewPatient 
}) => {
  const { currentUser, logout } = useAuth();
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    authOk: boolean;
    authMsg: string;
    firestoreOk: boolean;
    firestoreMsg: string;
  } | null>(null);

  const handleTestFirebase = async () => {
    setTesting(true);
    try {
      const res = await testLiveFirebase();
      setTestResult(res);
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">CarePulse</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wider">
                  Clinic OS
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Patient Care & Billing Management</p>
            </div>
          </div>

          {/* Quick Actions, Firebase Status & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Firebase Status Badge */}
            <button
              onClick={() => {
                setShowFirebaseModal(true);
                if (!testResult) handleTestFirebase();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Click to view Firebase project connection status"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Firebase:</span>
              <span className="font-mono text-[11px] text-amber-800 truncate max-w-[120px]">
                {firebaseConfig.projectId}
              </span>
            </button>

            <button
              onClick={onOpenNewPatient}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200/80 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-teal-600" />
              <span>New Patient</span>
            </button>

            <button
              onClick={onOpenBookAppointment}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            {/* User Badge */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-semibold text-xs">
                {currentUser?.displayName ? (
                  currentUser.displayName.charAt(0).toUpperCase()
                ) : currentUser?.email ? (
                  currentUser.email.charAt(0).toUpperCase()
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[130px]">
                  {currentUser?.displayName || currentUser?.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Staff Active</span>
                </div>
              </div>

              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Firebase Diagnostics Modal */}
      {showFirebaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Firebase Cloud Integration</h2>
                  <p className="text-xs text-slate-500">Live configuration & cloud connection diagnostics</p>
                </div>
              </div>
              <button
                onClick={() => setShowFirebaseModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Config overview */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Project ID:</span>
                  <span className="font-mono font-bold text-slate-800">{firebaseConfig.projectId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Auth Domain:</span>
                  <span className="font-mono text-slate-700">{firebaseConfig.authDomain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Storage Bucket:</span>
                  <span className="font-mono text-slate-700">{firebaseConfig.storageBucket}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">App ID:</span>
                  <span className="font-mono text-slate-700 truncate max-w-[200px]">{firebaseConfig.appId}</span>
                </div>
              </div>

              {/* Live Test Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Cloud Services Status</h4>
                  <button
                    onClick={handleTestFirebase}
                    disabled={testing}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                    <span>Re-test Connection</span>
                  </button>
                </div>

                {testing ? (
                  <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                    <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Connecting to Google Firebase servers...
                  </div>
                ) : testResult ? (
                  <div className="space-y-2.5">
                    {/* Auth Status */}
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-900">Firebase App SDK Initialized</p>
                        <p className="text-emerald-700 mt-0.5">{testResult.authMsg}</p>
                      </div>
                    </div>

                    {/* Firestore Status */}
                    <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                      testResult.firestoreOk 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      {testResult.firestoreOk ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold">
                          {testResult.firestoreOk ? 'Cloud Firestore Active' : 'Cloud Firestore Notice'}
                        </p>
                        <p className="mt-0.5 leading-relaxed">{testResult.firestoreMsg}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Direct links to Firebase Console */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2">
                <p className="font-bold text-slate-700">Google Firebase Console Shortcuts:</p>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 hover:text-teal-800 font-medium hover:underline inline-flex items-center gap-1.5"
                  >
                    <span>1. Open Cloud Firestore Database Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 hover:text-teal-800 font-medium hover:underline inline-flex items-center gap-1.5"
                  >
                    <span>2. Open Firebase Authentication Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowFirebaseModal(false)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};
