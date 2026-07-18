import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/components/common/Logo';
import { authApi } from '../../services/api.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
  const isStrong = form.newPassword.length >= 8 && passwordRegex.test(form.newPassword);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isStrong) {
      setError('Password does not meet requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(form);
      setSuccess(res.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Verification or password reset failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Logo dark />
        <div className="auth-copy">
          <h1>Guide Your Legal Account</h1>
          <p>Access complaint tracking, AI analysis and authority recommendations securely.</p>
        </div>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Reset Password 🔑</h2>
        <p>Enter the 6-digit OTP code sent to your email along with your new password.</p>
        {error && <p style={{ color: '#ef4444', marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: '#10b981', marginBottom: 12 }}>{success}</p>}
        
        <label>Email Address</label>
        <input 
          name="email"
          type="email" 
          value={form.email} 
          onChange={update}
          placeholder="user@example.com" 
          required 
        />

        <label>6-Digit OTP</label>
        <input 
          name="otp"
          type="text" 
          maxLength={6}
          value={form.otp} 
          onChange={update}
          placeholder="e.g. 123456" 
          required 
        />

        <label>New Password</label>
        <input 
          name="newPassword"
          type="password" 
          value={form.newPassword} 
          onChange={update}
          placeholder="New password" 
          required 
        />
        <small style={{ color: isStrong ? '#10b981' : '#64748b', fontSize: 11, display: 'block', marginTop: 4 }}>
          Must be 8+ characters and contain uppercase, lowercase, digit, and special symbol.
        </small>

        <label>Confirm Password</label>
        <input 
          name="confirmPassword"
          type="password" 
          value={form.confirmPassword} 
          onChange={update}
          placeholder="Confirm password" 
          required 
        />

        <button 
          className="btn btn-primary full" 
          type="submit" 
          style={{ marginTop: 22 }}
          disabled={loading}
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
        <p className="auth-bottom" style={{ marginTop: 20 }}>
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
