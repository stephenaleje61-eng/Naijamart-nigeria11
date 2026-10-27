import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authMode, 
    setAuthMode, 
    signInWithEmail, 
    signUpWithEmail, 
    sendPasswordReset,
    signInGuest 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === 'signin') {
        await signInWithEmail(email, password);
      } else if (authMode === 'signup') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password);
      } else if (authMode === 'reset') {
        await sendPasswordReset(email);
        setResetSent(true);
      }
    } catch (err: any) {
      const errCode = String(err?.code || '');
      const errMsg = String(err?.message || '');
      if (errCode === 'auth/operation-not-allowed' || errCode.includes('operation-not-allowed') || errMsg.includes('operation-not-allowed')) {
        // Fallback user created in AuthContext, safely dismiss modal
        closeAuthModal();
        return;
      }
      console.warn('Auth notice:', errCode || errMsg);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please check your credentials or click "Forgot Password".');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account already exists with this email address. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication request could not be completed. Please check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151515] border border-[#2A2A2A] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-fadeIn text-[#EDEDED]">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-[#2A2A2A] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#0A0A0A] border border-[#2A2A2A] text-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-white">
            {authMode === 'signin' && 'Sign In to Your Account'}
            {authMode === 'signup' && 'Create Your Owner Account'}
            {authMode === 'reset' && 'Reset Your Password'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {authMode === 'signin' && 'Access your registered devices and live GPS tracking'}
            {authMode === 'signup' && 'Protect your phone and secure ownership verification'}
            {authMode === 'reset' && 'Enter your registered email to receive a recovery link'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 font-bold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resetSent && authMode === 'reset' ? (
          <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#2A2A2A] text-center space-y-3">
            <CheckCircle className="w-8 h-8 text-[#10B981] mx-auto" />
            <h4 className="font-bold text-sm text-white">Password Reset Email Dispatched</h4>
            <p className="text-xs text-gray-400">
              Check your inbox for <strong className="text-white">{email}</strong> and follow instructions to set a new password.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setAuthMode('signin');
              }}
              className="text-xs font-bold text-[#10B981] hover:underline cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. emmanuel@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#10B981] font-medium"
                />
              </div>
            </div>

            {authMode !== 'reset' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-300">
                    Password
                  </label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setAuthMode('reset');
                      }}
                      className="text-[11px] text-[#10B981] font-bold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#008751] hover:bg-[#007043] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-600/30"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {authMode === 'signin' && 'Sign In'}
                    {authMode === 'signup' && 'Create Free Account'}
                    {authMode === 'reset' && 'Send Password Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Guest sign-in shortcut for quick registration testing */}
        <div className="mt-4 pt-4 border-t border-[#2A2A2A] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={signInGuest}
            className="text-gray-400 hover:text-gray-200 text-[11px] font-semibold underline cursor-pointer"
          >
            Quick Guest Demo Sign In
          </button>

          <div>
            {authMode === 'signin' ? (
              <span className="text-gray-400">
                New user?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setAuthMode('signup');
                  }}
                  className="font-bold text-[#10B981] hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </span>
            ) : (
              <span className="text-gray-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setAuthMode('signin');
                  }}
                  className="font-bold text-[#10B981] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
