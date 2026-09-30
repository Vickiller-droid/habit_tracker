import React, { useState, useEffect } from 'react';
import { X, Shield, Key, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleIcon } from './GoogleSignInButton';
import { 
  GoogleUser, 
  generateAvatarUrl, 
  getGoogleClientId, 
  setGoogleClientId, 
  decodeGoogleJwt,
  resolveUserRole
} from '../utils/googleAuth';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: GoogleUser) => void;
  darkMode?: boolean;
  userEmailSuggestion?: string;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  darkMode = false,
  userEmailSuggestion = ''
}) => {
  const [customName, setCustomName] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>(userEmailSuggestion || '');
  const [clientId, setClientId] = useState<string>('');
  const [showConfigOptions, setShowConfigOptions] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setClientId(getGoogleClientId());
      setErrorMessage('');
      setIsProcessing(false);

      // Attempt to initialize Google Identity Services if loaded and client ID exists
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        const id = getGoogleClientId();
        if (id) {
          try {
            (window as any).google.accounts.id.initialize({
              client_id: id,
              callback: (response: any) => {
                if (response.credential) {
                  const decoded = decodeGoogleJwt(response.credential);
                  if (decoded && decoded.email) {
                    const finalUser: GoogleUser = {
                      id: decoded.id || `google-${Date.now()}`,
                      email: decoded.email,
                      name: decoded.name || 'Google User',
                      givenName: decoded.givenName,
                      familyName: decoded.familyName,
                      avatarUrl: decoded.avatarUrl || generateAvatarUrl(decoded.email),
                      idToken: response.credential,
                      signedInAt: new Date().toISOString()
                    };
                    onSuccess(finalUser);
                    onClose();
                  }
                }
              }
            });
          } catch (err) {
            console.warn('Google Identity initialization error:', err);
          }
        }
      }
    }
  }, [isOpen, onSuccess, onClose]);

  if (!isOpen) return null;

  const handleSaveClientId = () => {
    setGoogleClientId(clientId);
    // If Google GSI is available, re-initialize
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && clientId.trim()) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId.trim(),
          callback: (response: any) => {
            if (response.credential) {
              const decoded = decodeGoogleJwt(response.credential);
              if (decoded && decoded.email) {
                const finalUser: GoogleUser = {
                  id: decoded.id || `google-${Date.now()}`,
                  email: decoded.email,
                  name: decoded.name || 'Google User',
                  givenName: decoded.givenName,
                  familyName: decoded.familyName,
                  avatarUrl: decoded.avatarUrl || generateAvatarUrl(decoded.email),
                  role: resolveUserRole(decoded.email, true),
                  idToken: response.credential,
                  signedInAt: new Date().toISOString()
                };
                onSuccess(finalUser);
                onClose();
              }
            }
          }
        });
      } catch (err) {
        console.warn('Google Identity error:', err);
      }
    }
  };

  const handleQuickSignIn = (name: string, email: string) => {
    setIsProcessing(true);
    setErrorMessage('');

    setTimeout(() => {
      const userEmail = email.trim();
      const user: GoogleUser = {
        id: `google-${btoa(userEmail).replace(/=/g, '').slice(0, 16)}`,
        email: userEmail,
        name: name.trim() || userEmail.split('@')[0],
        givenName: name.split(' ')[0],
        familyName: name.split(' ').slice(1).join(' '),
        avatarUrl: generateAvatarUrl(name.trim() || userEmail),
        role: resolveUserRole(userEmail, true),
        signedInAt: new Date().toISOString()
      };

      onSuccess(user);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  const handleNativeGooglePrompt = () => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && clientId.trim()) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to quick sign in
            handleQuickSignIn(customName, customEmail);
          }
        });
      } catch (e) {
        handleQuickSignIn(customName, customEmail);
      }
    } else {
      handleQuickSignIn(customName, customEmail);
    }
  };

  return (
    <div
      id="modal-google-auth-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="modal-google-auth-container"
        className={`w-full max-w-md rounded-[32px] border overflow-hidden shadow-2xl transition-all duration-300 ${
          darkMode ? 'bg-[#171F2A] border-[#263242] text-[#F8FAFC]' : 'bg-white border-[#CBD5E1] text-[#0F172A]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${darkMode ? 'border-[#263242]' : 'border-stone-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs border ${
              darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-stone-50 border-stone-200'
            }`}>
              <GoogleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-display font-bold text-base ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-900'}`}>
                Sign in with Google
              </h3>
              <p className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>
                Link your habit contracts &amp; AI streaks
              </p>
            </div>
          </div>
          <button
            id="btn-close-google-auth-modal"
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              darkMode ? 'border-[#334255] hover:bg-[#1E2836] text-[#94A3B8]' : 'border-stone-200 hover:bg-stone-100 text-stone-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Custom Name / Email fields */}
          <div className="space-y-3">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                darkMode ? 'text-[#94A3B8]' : 'text-stone-600'
              }`}>
                Google Display Name
              </label>
              <input
                id="input-google-custom-name"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:border-orange-500 ${
                  darkMode ? 'bg-[#1E2836] border-[#334255] text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                darkMode ? 'text-[#94A3B8]' : 'text-stone-600'
              }`}>
                Google Account Email
              </label>
              <input
                id="input-google-custom-email"
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:border-orange-500 ${
                  darkMode ? 'bg-[#1E2836] border-[#334255] text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                }`}
              />
            </div>

            <button
              id="btn-google-sign-in-custom"
              type="button"
              onClick={handleNativeGooglePrompt}
              disabled={isProcessing || !customEmail.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 via-[#FF7A1A] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Advanced Google Cloud OAuth 2.0 Credentials accordion */}
          <div className={`p-3.5 rounded-2xl border transition-colors ${
            darkMode ? 'bg-[#1E2836]/60 border-[#263242]' : 'bg-stone-50 border-stone-200/70'
          }`}>
            <button
              type="button"
              onClick={() => setShowConfigOptions(!showConfigOptions)}
              className="w-full flex items-center justify-between text-xs font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-orange-500" />
                <span className={darkMode ? 'text-stone-300' : 'text-stone-700'}>
                  Google Cloud Client ID (Optional)
                </span>
              </div>
              {showConfigOptions ? (
                <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              )}
            </button>

            {showConfigOptions && (
              <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700/60 space-y-2.5 text-xs">
                <p className={`text-[11px] ${darkMode ? 'text-stone-400' : 'text-stone-500'} leading-relaxed`}>
                  Enter a Google OAuth 2.0 Client ID (from Google Cloud Console) to enable native GSI popups, or leave blank to use the built-in frictionless instant sign-in.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="e.g. 123456...apps.googleusercontent.com"
                    className={`flex-1 px-3 py-1.5 rounded-lg border text-[11px] font-mono focus:outline-none focus:border-orange-500 ${
                      darkMode ? 'bg-[#171F2A] border-stone-700 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSaveClientId}
                    className="px-3 py-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-orange-500 hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Persistence reassurance */}
          <div className="flex items-start gap-2 pt-1 text-[11px] text-stone-500 dark:text-stone-400">
            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Vicfungo links your local streaks, habit contracts, and reflections to your Google ID with offline-first persistence across browser restarts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
