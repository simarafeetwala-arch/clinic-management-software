import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';

export interface AppStaffUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isMock?: boolean;
}

interface AuthContextType {
  currentUser: AppStaffUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginDemoStaff: () => Promise<void>;
  enterDemoMode: (name?: string, email?: string) => void;
  error: string | null;
  setError: (err: string | null) => void;
  isConfigMissing: boolean;
}

const DEFAULT_STAFF: AppStaffUser = {
  uid: 'staff_admin_01',
  email: 'staff@carepulse-clinic.com',
  displayName: 'Dr. Sarah Mitchell (Staff Admin)',
  isMock: true,
};

const LOCAL_STAFF_KEY = 'carepulse_active_staff_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppStaffUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STAFF_KEY);
      if (saved) return JSON.parse(saved);
      // Auto-login default staff if first time or no session
      localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    } catch {
      return DEFAULT_STAFF;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigMissing, setIsConfigMissing] = useState<boolean>(false);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const appUser: AppStaffUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'Staff Member',
            isMock: false,
          };
          setCurrentUser(appUser);
          localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(appUser));
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase onAuthStateChanged error:', e);
    }
  }, []);

  const formatFirebaseError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/configuration-not-found') {
      setIsConfigMissing(true);
      return 'Firebase Authentication is not yet enabled in your Firebase Console. Go to Firebase Console > Authentication > Sign-in method > Enable "Email/Password", or use "Enter Instant Demo Mode" below to proceed immediately.';
    }
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please check your credentials or create a staff account.';
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please log in instead.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      default:
        return err?.message || 'Authentication error occurred.';
    }
  };

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const appUser: AppStaffUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || email.split('@')[0],
        isMock: false
      };
      setCurrentUser(appUser);
      localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(appUser));
    } catch (err: any) {
      const message = formatFirebaseError(err);
      setError(message);
      throw new Error(message);
    }
  };

  const signup = async (email: string, pass: string, displayName?: string) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (displayName && res.user) {
        await updateProfile(res.user, { displayName });
      }
      const appUser: AppStaffUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: displayName || email.split('@')[0],
        isMock: false
      };
      setCurrentUser(appUser);
      localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(appUser));
    } catch (err: any) {
      const message = formatFirebaseError(err);
      setError(message);
      throw new Error(message);
    }
  };

  const enterDemoMode = (name = 'Dr. Sarah Mitchell (Staff Admin)', email = 'staff@carepulse-clinic.com') => {
    setError(null);
    const demoUser: AppStaffUser = {
      uid: 'demo_staff_' + Date.now(),
      email,
      displayName: name,
      isMock: true
    };
    setCurrentUser(demoUser);
    localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(demoUser));
  };

  const logout = async () => {
    setError(null);
    localStorage.removeItem(LOCAL_STAFF_KEY);
    try {
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.warn('Firebase signout error:', err);
    }
    setCurrentUser(null);
  };

  const loginDemoStaff = async () => {
    setError(null);
    const demoEmail = 'staff@carepulse-clinic.com';
    const demoPass = 'Clinic@1234';
    try {
      const res = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      const appUser: AppStaffUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || 'Staff Admin',
        isMock: false
      };
      setCurrentUser(appUser);
      localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(appUser));
    } catch (loginErr: any) {
      if (loginErr?.code === 'auth/configuration-not-found') {
        setIsConfigMissing(true);
        // Seamless fallback so the user can immediately evaluate and test the entire software!
        enterDemoMode('Dr. Sarah Mitchell (Staff Admin)', demoEmail);
        return;
      }

      if (
        loginErr.code === 'auth/user-not-found' || 
        loginErr.code === 'auth/invalid-credential' ||
        loginErr.code === 'auth/invalid-login-credentials'
      ) {
        try {
          const res = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          if (res.user) {
            await updateProfile(res.user, { displayName: 'Staff Nurse/Admin' });
          }
          const appUser: AppStaffUser = {
            uid: res.user.uid,
            email: res.user.email,
            displayName: 'Staff Nurse/Admin',
            isMock: false
          };
          setCurrentUser(appUser);
          localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(appUser));
        } catch (signupErr: any) {
          if (signupErr?.code === 'auth/configuration-not-found') {
            setIsConfigMissing(true);
            enterDemoMode('Staff Nurse/Admin', demoEmail);
            return;
          }
          const msg = formatFirebaseError(signupErr);
          setError(msg);
          throw new Error(msg);
        }
      } else {
        const msg = formatFirebaseError(loginErr);
        setError(msg);
        throw new Error(msg);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      login, 
      signup, 
      logout, 
      loginDemoStaff, 
      enterDemoMode,
      error, 
      setError,
      isConfigMissing
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
