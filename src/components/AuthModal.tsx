import React, { useState } from 'react';
import { ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { UserProfile } from '../types';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

interface AuthModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, name: string, id?: string) => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  user,
  isOpen,
  onClose,
  onLogin,
  onOpenTerms,
  onOpenPrivacy
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (isSignUp && !agreedToTerms) {
      setErrorMsg('Please agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    if (!isFirebaseConfigured()) {
      // Offline / Local fallback mode
      onLogin(email, name || email.split('@')[0], `user_local_${Date.now()}`);
      onClose();
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = name || email.split('@')[0];
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName });
          // Explicitly verify session token availability before updating state
          await userCredential.user.getIdToken(true);
          onLogin(userCredential.user.email || email, displayName, userCredential.user.uid);
          onClose();
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          const userName = userCredential.user.displayName || userCredential.user.email?.split('@')[0] || name;
          // Explicitly verify session token availability before updating state
          await userCredential.user.getIdToken(true);
          onLogin(userCredential.user.email || email, userName, userCredential.user.uid);
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let friendlyMessage = err.message || 'An unexpected error occurred during authentication.';
      if (err.code === 'auth/operation-not-allowed') {
        friendlyMessage = 'Email/Password sign-in is not enabled in Firebase Console for this project. Please click "Continue with Google" above to sign in.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'An account with this email address already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        friendlyMessage = 'Sign in popup was closed before completing.';
      }
      setErrorMsg(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    if (!isFirebaseConfigured()) {
      onLogin('google.parent@gmail.com', 'Google Parent', `user_google_${Date.now()}`);
      onClose();
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const displayName = result.user.displayName || result.user.email?.split('@')[0] || 'Parent User';
        // Explicitly verify session token availability before updating state
        await result.user.getIdToken(true);
        onLogin(result.user.email || 'parent@example.com', displayName, result.user.uid);
        onClose();
      }
    } catch (err: any) {
      console.error('Firebase Google Auth Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Failed to initiate Google authentication.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isSignUp ? 'Create Parent Account' : 'Parent Sign In'}
              </h2>
              <p className="text-[11px] text-slate-500">IEP & 504 Meeting Prep</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleAuth}
          className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold py-2.5 rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-mono">or email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignUp && (
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="parent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {isSignUp && (
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms-checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
              />
              <label htmlFor="terms-checkbox" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="text-indigo-600 font-semibold underline hover:text-indigo-800"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="text-indigo-600 font-semibold underline hover:text-indigo-800"
                >
                  Privacy Policy
                </button>
                .
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl shadow transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : isSignUp ? (
              'Sign Up Free'
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center text-[11px] text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className="text-indigo-600 font-semibold underline cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Sign Up Free'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
