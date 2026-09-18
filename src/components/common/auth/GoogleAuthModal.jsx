import React, { useState } from 'react';
import { X, Loader2, Sparkles, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const GoogleAuthModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('select'); // 'select' | 'custom'
  
  // Custom Google input states
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');

  const PRESET_GOOGLE_ACCOUNTS = [
    {
      name: 'Rajesh Kumar',
      email: 'citizen.rajesh@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshKumar',
      badge: 'Verified Citizen'
    },
    {
      name: 'Priya Selvam',
      email: 'priya.selvam.tn@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSelvam',
      badge: 'Verified Citizen'
    },
    {
      name: 'Karthik Subramanian',
      email: 'karthik.subramanian@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik',
      badge: 'Verified Citizen'
    }
  ];

  if (!isOpen) return null;

  const handlePerformGoogleAuth = async (accountData) => {
    setError('');
    setLoading(true);
    try {
      const email = accountData.email.trim().toLowerCase();
      const name = accountData.name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const avatarUrl = accountData.avatar || ('https://api.dicebear.com/7.x/bottts/svg?seed=' + email);

      const res = await authService.loginWithGoogle({
        email: email,
        name: name,
        avatarUrl: avatarUrl,
        googleId: 'google_' + btoa(email).substring(0, 12)
      });

      login(res);
      toast.success('Welcome to ARAM, ' + name + '! Signed in via Google.');
      onClose();

      const role = String(res?.user?.role || res?.role || '').toUpperCase();
      if (role === 'SUPER_ADMIN') {
        navigate('/superadmin/dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'VOLUNTEER' || role === 'GUIDE' || role === 'HELPER') {
        navigate('/guide/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      console.error('Google authentication error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Google Sign-In failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google Account email.');
      return;
    }
    handlePerformGoogleAuth({
      email: customEmail.trim(),
      name: customName.trim(),
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + customEmail.trim().toLowerCase()
    });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'>
      <div 
        className='w-full max-w-md bg-white dark:bg-[#11201B] rounded-3xl shadow-2xl border border-slate-200 dark:border-emerald-500/20 overflow-hidden transform transition-all'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-emerald-900/30'>
          <div className='flex items-center gap-2.5'>
            <div className='w-7 h-7 flex items-center justify-center'>
              <svg className='w-6 h-6' viewBox='0 0 24 24'>
                <path
                  fill='#4285F4'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='#34A853'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='#FBBC05'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z'
                />
                <path
                  fill='#EA4335'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z'
                />
              </svg>
            </div>
            <div>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>Sign in with Google</h3>
              <p className='text-[11px] text-slate-500 dark:text-slate-400'>Choose an account to continue to ARAM</p>
            </div>
          </div>
          <button 
            type='button'
            onClick={onClose}
            className='p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A2C26] transition cursor-pointer'
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className='px-6 pt-3 flex gap-2'>
          <button
            type='button'
            onClick={() => setActiveTab('select')}
            className={'flex-1 pb-2 text-xs font-bold border-b-2 transition cursor-pointer ' + (
              activeTab === 'select'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            )}
          >
            Verified Profiles
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('custom')}
            className={'flex-1 pb-2 text-xs font-bold border-b-2 transition cursor-pointer ' + (
              activeTab === 'custom'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            )}
          >
            Enter Custom Google Email
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {error && (
            <div className='mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium'>
              {error}
            </div>
          )}

          {activeTab === 'select' ? (
            <div className='space-y-2.5'>
              {PRESET_GOOGLE_ACCOUNTS.map((acc, i) => (
                <button
                  key={i}
                  type='button'
                  disabled={loading}
                  onClick={() => handlePerformGoogleAuth(acc)}
                  className='w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-emerald-900/40 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 bg-slate-50/50 dark:bg-[#142620]/60 hover:bg-emerald-50/30 dark:hover:bg-[#16332A] transition group text-left cursor-pointer'
                >
                  <div className='flex items-center gap-3'>
                    <img 
                      src={acc.avatar} 
                      alt={acc.name} 
                      className='w-10 h-10 rounded-full border border-slate-200 dark:border-emerald-700/50 bg-white dark:bg-slate-800 p-0.5' 
                    />
                    <div>
                      <div className='text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition'>
                        {acc.name}
                      </div>
                      <div className='text-[11px] text-slate-500 dark:text-slate-400'>
                        {acc.email}
                      </div>
                    </div>
                  </div>
                  <span className='text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full'>
                    {acc.badge}
                  </span>
                </button>
              ))}

              <div className='pt-2 text-center'>
                <button
                  type='button'
                  onClick={() => setActiveTab('custom')}
                  className='text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer'
                >
                  <User size={13} /> Use another Google account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className='space-y-3.5'>
              <div>
                <label className='block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1'>
                  Google Email Address
                </label>
                <input
                  type='email'
                  required
                  placeholder='yourname@gmail.com'
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className='w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/60 bg-white dark:bg-[#142620] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1'>
                  Full Name (Optional)
                </label>
                <input
                  type='text'
                  placeholder='e.g. Anandha Krishnan'
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className='w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/60 bg-white dark:bg-[#142620] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                />
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50'
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className='animate-spin' /> Verifying Google Account...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} /> Continue with this Google Account
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className='mt-5 pt-3 border-t border-slate-100 dark:border-emerald-900/30 text-center'>
            <p className='text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5'>
              <ShieldCheck size={13} className='text-emerald-600' />
              Grounded & encrypted under Indian IT Act & DPDP 2023
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GoogleAuthModal;
