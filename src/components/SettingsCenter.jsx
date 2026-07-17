import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { User, Paintbrush, Shield, FileText, Bell, Lock, Languages, Info, Save, Upload, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { getCurrentUser, userApi } from '../services/api.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function SettingsCenter({ role = 'citizen' }) {
  const location = useLocation();
  const { mode, setMode } = useTheme();
  
  // Track active section
  const [activeTab, setActiveTab] = useState('profile');

  // Load active tab from URL hash if present
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['profile', 'appearance', 'privacy', 'documents', 'notifications', 'security', 'language', 'appinfo'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Profile fields state
  const currentUser = getCurrentUser() || {};
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    mobile: currentUser.mobile || '',
    district: currentUser.district || '',
    preferredLanguage: currentUser.preferredLanguage || 'English',
    address: currentUser.address || '',
    bio: currentUser.bio || '',
    gender: currentUser.gender || 'ANY',
    specialization: currentUser.specialization || '',
    experienceYears: currentUser.experienceYears || '0',
    languagesKnown: currentUser.languagesKnown || '',
    availability: currentUser.availability !== false,
  });

  // Local settings state
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('accessibilityFontSize') || 'default');
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('compactMode') === 'true');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('reducedMotion') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true');

  // Privacy toggles
  const [privacySettings, setPrivacySettings] = useState({
    identityVisibility: localStorage.getItem('priv_identityVisibility') || 'VISIBLE',
    sensitiveDefault: localStorage.getItem('priv_sensitiveDefault') !== 'false',
    preferWomanHelper: localStorage.getItem('priv_preferWomanHelper') === 'true',
    hideContact: localStorage.getItem('priv_hideContact') === 'true',
    publicProfile: localStorage.getItem('priv_publicProfile') !== 'false',
  });

  // Notification toggles
  const [notifSettings, setNotifSettings] = useState({
    inApp: localStorage.getItem('notif_inApp') !== 'false',
    email: localStorage.getItem('notif_email') === 'true',
    sms: localStorage.getItem('notif_sms') === 'true',
    statusAlerts: localStorage.getItem('notif_statusAlerts') !== 'false',
    assignmentAlerts: localStorage.getItem('notif_assignmentAlerts') !== 'false',
    aiAlerts: localStorage.getItem('notif_aiAlerts') !== 'false',
  });

  // Security password fields state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Avatar uploading
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    setError('');
    setSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid JPEG, PNG or WEBP image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validations
    if (profileForm.name.trim().length < 2 || profileForm.name.trim().length > 60) {
      setError('Full Name must be between 2 and 60 characters.');
      setLoading(false);
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (profileForm.mobile && !mobileRegex.test(profileForm.mobile)) {
      setError('Mobile number must be a valid 10-digit number.');
      setLoading(false);
      return;
    }

    if (role === 'citizen' && !profileForm.district) {
      setError('District is required.');
      setLoading(false);
      return;
    }

    if (profileForm.address && (profileForm.address.length < 5 || profileForm.address.length > 250)) {
      setError('Address must be between 5 and 250 characters.');
      setLoading(false);
      return;
    }

    if (profileForm.bio && profileForm.bio.length > 300) {
      setError('Bio cannot exceed 300 characters.');
      setLoading(false);
      return;
    }

    try {
      if (avatarFile) {
        await userApi.updateAvatar(avatarFile);
      }

      // Save profile updates
      const updated = await userApi.updateMe(profileForm);
      
      // Update local storage user details
      const existing = getCurrentUser();
      localStorage.setItem('user', JSON.stringify({ ...existing, ...updated }));
      
      setSuccess('Profile updated successfully!');
      setAvatarFile(null);
    } catch (err) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { currentPassword, newPassword, confirmPassword } = securityForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    // Password strength check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setSuccess('Password updated successfully! (Simulated)');
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
    }, 1000);
  };

  // Font size trigger
  const updateFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('accessibilityFontSize', size);
    document.documentElement.className = document.documentElement.className
      .replace(/\bfont-\w+\b/g, '')
      .trim();
    document.documentElement.classList.add(`font-${size}`);
  };

  // Reduced motion trigger
  const updateReducedMotion = (active) => {
    setReducedMotion(active);
    localStorage.setItem('reducedMotion', String(active));
    if (active) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  };

  const saveLocalSetting = (key, value, prefix = '') => {
    localStorage.setItem(`${prefix}${key}`, String(value));
    setSuccess('Settings updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="settings-grid">
      {/* Left Tabs */}
      <aside className="settings-tabs">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'appearance', label: 'Appearance', icon: Paintbrush },
          { id: 'privacy', label: 'Privacy', icon: Shield },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security', icon: Lock },
          { id: 'language', label: 'Language & Accessibility', icon: Languages },
          { id: 'appinfo', label: 'App Info', icon: Info }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setError('');
                setSuccess('');
              }}
            >
              <TabIcon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Right Content */}
      <main className="settings-content">
        {error && <p style={{ color: '#ef4444', marginBottom: 12, fontWeight: 650, display: 'flex', gap: '6px', alignItems: 'center' }}><AlertCircle size={16} />{error}</p>}
        {success && <p style={{ color: '#10b981', marginBottom: 12, fontWeight: 650, display: 'flex', gap: '6px', alignItems: 'center' }}><ShieldCheck size={16} />{success}</p>}

        {/* PROFILE SECTION */}
        {activeTab === 'profile' && (
          <section className="panel-card settings-section-card">
            <h2>Profile Settings</h2>
            <p className="section-desc">Manage your public information, avatar, and credentials.</p>
            
            <form onSubmit={saveProfile}>
              {/* Avatar Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div 
                  style={{ 
                    width: '72px', 
                    height: '72px', 
                    borderRadius: '50%', 
                    background: 'var(--role-soft)', 
                    color: 'var(--role-primary)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: '24px',
                    border: '2px solid var(--border)',
                    overflow: 'hidden'
                  }}
                >
                  {avatarPreview || profileForm.avatarUrl ? (
                    <img src={avatarPreview || profileForm.avatarUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    profileForm.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <label className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '12px', minHeight: 'auto', display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}>
                    <Upload size={14} /> Upload New Avatar
                    <input type="file" hidden accept=".jpg,.jpeg,.png,.webp" onChange={handleAvatarChange} />
                  </label>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>JPG, PNG or WEBP. Max 2MB.</p>
                </div>
              </div>

              {/* Citizen specific fields */}
              {role === 'citizen' && (
                <>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Full Name</label>
                      <input name="name" value={profileForm.name} onChange={handleProfileChange} required />
                    </div>
                    <div className="settings-form-group">
                      <label>Email Address</label>
                      <input name="email" type="email" value={profileForm.email} disabled style={{ background: 'var(--bg-main)' }} />
                    </div>
                  </div>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Mobile Number</label>
                      <input name="mobile" value={profileForm.mobile} onChange={handleProfileChange} placeholder="10-digit mobile" />
                    </div>
                    <div className="settings-form-group">
                      <label>District</label>
                      <input name="district" value={profileForm.district} onChange={handleProfileChange} required />
                    </div>
                  </div>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Preferred Language</label>
                      <select name="preferredLanguage" value={profileForm.preferredLanguage} onChange={handleProfileChange}>
                        <option value="English">English</option>
                        <option value="Tamil">Tamil (தமிழ்)</option>
                        <option value="Hindi">Hindi (हिन्दी)</option>
                        <option value="Tanglish">Tanglish</option>
                        <option value="Hinglish">Hinglish</option>
                      </select>
                    </div>
                    <div className="settings-form-group">
                      <label>Identity Disclosure</label>
                      <select name="identityVisibility" value={privacySettings.identityVisibility} onChange={(e) => {
                        setPrivacySettings({ ...privacySettings, identityVisibility: e.target.value });
                        saveLocalSetting('identityVisibility', e.target.value, 'priv_');
                      }}>
                        <option value="VISIBLE">Visible (Show Name & Mobile)</option>
                        <option value="PARTIAL">Partial (District Only)</option>
                        <option value="HIDDEN">Hidden (Mask details)</option>
                      </select>
                    </div>
                  </div>
                  <div className="settings-form-group" style={{ marginBottom: '16px' }}>
                    <label>Bio / Description</label>
                    <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} rows="3" placeholder="Tell us a little about yourself..." />
                  </div>
                  <div className="settings-form-group" style={{ marginBottom: '24px' }}>
                    <label>Home Address</label>
                    <textarea name="address" value={profileForm.address} onChange={handleProfileChange} rows="2" placeholder="Full residential address..." />
                  </div>
                </>
              )}

              {/* Helper specific fields */}
              {role === 'helper' && (
                <>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Full Name</label>
                      <input name="name" value={profileForm.name} onChange={handleProfileChange} required />
                    </div>
                    <div className="settings-form-group">
                      <label>Email Address</label>
                      <input name="email" type="email" value={profileForm.email} disabled style={{ background: 'var(--bg-main)' }} />
                    </div>
                  </div>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Mobile Number</label>
                      <input name="mobile" value={profileForm.mobile} onChange={handleProfileChange} />
                    </div>
                    <div className="settings-form-group">
                      <label>Specialization</label>
                      <input name="specialization" value={profileForm.specialization} onChange={handleProfileChange} placeholder="e.g. Labor Law, Civil Disputes" />
                    </div>
                  </div>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Experience (Years)</label>
                      <input name="experienceYears" type="number" value={profileForm.experienceYears} onChange={handleProfileChange} />
                    </div>
                    <div className="settings-form-group">
                      <label>Languages Known</label>
                      <input name="languagesKnown" value={profileForm.languagesKnown} onChange={handleProfileChange} placeholder="e.g. English, Tamil" />
                    </div>
                  </div>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Preferred Language</label>
                      <select name="preferredLanguage" value={profileForm.preferredLanguage} onChange={handleProfileChange}>
                        <option value="English">English</option>
                        <option value="Tamil">Tamil (தமிழ்)</option>
                        <option value="Hindi">Hindi (हिन्दी)</option>
                        <option value="Tanglish">Tanglish</option>
                        <option value="Hinglish">Hinglish</option>
                      </select>
                    </div>
                    <div className="settings-form-group">
                      <label>District / Location</label>
                      <input name="district" value={profileForm.district} onChange={handleProfileChange} required />
                    </div>
                  </div>
                  <div className="settings-form-group" style={{ marginBottom: '16px' }}>
                    <label>Bio / Description</label>
                    <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} rows="3" />
                  </div>
                  <div className="settings-toggle-row" style={{ marginBottom: '24px' }}>
                    <div>
                      <label>Active Availability</label>
                      <span>Show yourself as available to accept citizen complaint assignments.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      name="availability" 
                      checked={profileForm.availability} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                </>
              )}

              {/* Admin specific fields */}
              {role === 'admin' && (
                <>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Full Name</label>
                      <input name="name" value={profileForm.name} onChange={handleProfileChange} required />
                    </div>
                    <div className="settings-form-group">
                      <label>Email Address</label>
                      <input name="email" type="email" value={profileForm.email} disabled style={{ background: 'var(--bg-main)' }} />
                    </div>
                  </div>
                  <div className="settings-form-row">
                    <div className="settings-form-group">
                      <label>Mobile Number</label>
                      <input name="mobile" value={profileForm.mobile} onChange={handleProfileChange} />
                    </div>
                    <div className="settings-form-group">
                      <label>District / Location</label>
                      <input name="district" value={profileForm.district} onChange={handleProfileChange} required />
                    </div>
                  </div>
                  <div className="settings-form-group" style={{ marginBottom: '24px' }}>
                    <label>Role Privilege</label>
                    <input value="ADMINISTRATOR" disabled style={{ background: 'var(--bg-main)' }} />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Save size={16} /> {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* APPEARANCE SECTION */}
        {activeTab === 'appearance' && (
          <section className="panel-card settings-section-card">
            <h2>Appearance Settings</h2>
            <p className="section-desc">Change the display color mode and layouts for the application.</p>
            
            <div className="settings-form-group" style={{ marginBottom: '20px' }}>
              <label>Color Theme Mode</label>
              <div className="theme-segment large" style={{ display: 'flex', width: '100%', gap: '4px' }}>
                {['LIGHT', 'DARK', 'SYSTEM'].map(item => (
                  <button 
                    key={item} 
                    type="button" 
                    className={mode === item ? 'active' : ''} 
                    onClick={() => setMode(item)}
                    style={{ flex: 1 }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-toggle-row">
              <div>
                <label>Compact Display Mode</label>
                <span>Hides excess whitespace and makes grids tighter.</span>
              </div>
              <input 
                type="checkbox" 
                checked={compactMode} 
                onChange={(e) => {
                  setCompactMode(e.target.checked);
                  saveLocalSetting('compactMode', e.target.checked);
                }} 
              />
            </div>

            <div className="settings-toggle-row">
              <div>
                <label>Reduced Motion</label>
                <span>Disables transitions and layouts sliding animations.</span>
              </div>
              <input 
                type="checkbox" 
                checked={reducedMotion} 
                onChange={(e) => updateReducedMotion(e.target.checked)} 
              />
            </div>
          </section>
        )}

        {/* PRIVACY SECTION */}
        {activeTab === 'privacy' && (
          <section className="panel-card settings-section-card">
            <h2>Privacy Settings</h2>
            <p className="section-desc">Configure who sees your case details and contact information.</p>
            
            {role === 'citizen' && (
              <>
                <div className="settings-form-group" style={{ marginBottom: '16px' }}>
                  <label>Default Identity Visibility</label>
                  <select 
                    value={privacySettings.identityVisibility}
                    onChange={(e) => {
                      setPrivacySettings({ ...privacySettings, identityVisibility: e.target.value });
                      saveLocalSetting('identityVisibility', e.target.value, 'priv_');
                    }}
                  >
                    <option value="VISIBLE">Visible to Helpers & Officers</option>
                    <option value="PARTIAL">Partial (District only, Hide details)</option>
                    <option value="HIDDEN">Fully Anonymous (Mask credentials)</option>
                  </select>
                </div>
                <div className="settings-toggle-row">
                  <div>
                    <label>Default Sensitive Complaint Mode</label>
                    <span>Automatically classify new complaints as sensitive.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={privacySettings.sensitiveDefault} 
                    onChange={(e) => {
                      setPrivacySettings({ ...privacySettings, sensitiveDefault: e.target.checked });
                      saveLocalSetting('sensitiveDefault', e.target.checked, 'priv_');
                    }} 
                  />
                </div>
                <div className="settings-toggle-row">
                  <div>
                    <label>Prefer Woman Legal Helper</label>
                    <span>Pre-select women volunteers for case assignments.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={privacySettings.preferWomanHelper} 
                    onChange={(e) => {
                      setPrivacySettings({ ...privacySettings, preferWomanHelper: e.target.checked });
                      saveLocalSetting('preferWomanHelper', e.target.checked, 'priv_');
                    }} 
                  />
                </div>
                <div className="settings-toggle-row">
                  <div>
                    <label>Hide Contact from Volunteers</label>
                    <span>Do not show phone number/email on helper panel.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={privacySettings.hideContact} 
                    onChange={(e) => {
                      setPrivacySettings({ ...privacySettings, hideContact: e.target.checked });
                      saveLocalSetting('hideContact', e.target.checked, 'priv_');
                    }} 
                  />
                </div>
                <div style={{ background: 'var(--role-soft)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12.5px', marginTop: '16px' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--role-primary)' }}>Sensitive Complaint Warning:</p>
                  <p style={{ margin: '4px 0 0', lineHeight: 1.4 }}>
                    Complaints flagged as sensitive are stored in encrypted cells and are only routing-assessed by volunteer coordinators.
                  </p>
                </div>
              </>
            )}

            {role === 'helper' && (
              <>
                <div className="settings-toggle-row">
                  <div>
                    <label>Public Helper Profile</label>
                    <span>Allow citizens to find and message you from the public directory.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={privacySettings.publicProfile} 
                    onChange={(e) => {
                      setPrivacySettings({ ...privacySettings, publicProfile: e.target.checked });
                      saveLocalSetting('publicProfile', e.target.checked, 'priv_');
                    }} 
                  />
                </div>
              </>
            )}

            {role === 'admin' && (
              <div style={{ background: 'var(--danger-soft)', padding: '16px', borderRadius: '8px', color: 'var(--danger)' }}>
                <h4 style={{ margin: '0 0 8px' }}>Security & Audit Log Notice</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>All administrator actions, including viewing sensitive cases, modifying user status, and exporting data reports, are logged and audited automatically.</p>
              </div>
            )}
            
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '20px' }}>* Privacy settings are cached locally. Full backend synchronization TODO.</p>
          </section>
        )}

        {/* DOCUMENTS SECTION */}
        {activeTab === 'documents' && (
          <section className="panel-card settings-section-card">
            <h2>Document Settings</h2>
            <p className="section-desc">Manage document defaults and allowed attachment constraints.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Max Upload Size</span>
                <h3 style={{ margin: '4px 0' }}>10 MB</h3>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Allowed Types</span>
                <h3 style={{ margin: '4px 0' }}>PDF, JPG, PNG</h3>
              </div>
            </div>

            <h3>Verification Status Legend</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                <span>Verified</span>
                <StatusBadge type="success">VERIFIED</StatusBadge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                <span>Pending Review</span>
                <StatusBadge type="info">PENDING</StatusBadge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                <span>Rejected</span>
                <StatusBadge type="danger">REJECTED</StatusBadge>
              </div>
            </div>
          </section>
        )}

        {/* NOTIFICATIONS SECTION */}
        {activeTab === 'notifications' && (
          <section className="panel-card settings-section-card">
            <h2>Notification Preferences</h2>
            <p className="section-desc">Control how and when you receive legal aid alerts.</p>
            
            <div className="settings-toggle-row">
              <div>
                <label>Complaint Status Updates</label>
                <span>Receive live alerts when your case is assigned or reviewed.</span>
              </div>
              <input 
                type="checkbox" 
                checked={notifSettings.statusAlerts} 
                onChange={(e) => {
                  setNotifSettings({ ...notifSettings, statusAlerts: e.target.checked });
                  saveLocalSetting('statusAlerts', e.target.checked, 'notif_');
                }} 
              />
            </div>

            <div className="settings-toggle-row">
              <div>
                <label>Assignment Triage Updates</label>
                <span>Alerts when a certified helper is connected to your grievance.</span>
              </div>
              <input 
                type="checkbox" 
                checked={notifSettings.assignmentAlerts} 
                onChange={(e) => {
                  setNotifSettings({ ...notifSettings, assignmentAlerts: e.target.checked });
                  saveLocalSetting('assignmentAlerts', e.target.checked, 'notif_');
                }} 
              />
            </div>

            <div className="settings-toggle-row">
              <div>
                <label>AI Analysis Alerts</label>
                <span>Notification when NLP classification processes are complete.</span>
              </div>
              <input 
                type="checkbox" 
                checked={notifSettings.aiAlerts} 
                onChange={(e) => {
                  setNotifSettings({ ...notifSettings, aiAlerts: e.target.checked });
                  saveLocalSetting('aiAlerts', e.target.checked, 'notif_');
                }} 
              />
            </div>

            <div className="settings-toggle-row">
              <div>
                <label>In-App Alerts</label>
                <span>Show live badge indicators in layout header.</span>
              </div>
              <input 
                type="checkbox" 
                checked={notifSettings.inApp} 
                onChange={(e) => {
                  setNotifSettings({ ...notifSettings, inApp: e.target.checked });
                  saveLocalSetting('inApp', e.target.checked, 'notif_');
                }} 
              />
            </div>

            <div className="settings-toggle-row">
              <div>
                <label>Email Alerts (Placeholder)</label>
                <span>Send copy of updates to your registered email inbox.</span>
              </div>
              <input 
                type="checkbox" 
                checked={notifSettings.email} 
                onChange={(e) => {
                  setNotifSettings({ ...notifSettings, email: e.target.checked });
                  saveLocalSetting('email', e.target.checked, 'notif_');
                }} 
              />
            </div>

            <div className="settings-toggle-row">
              <div>
                <label>SMS Updates (Placeholder)</label>
                <span>Receive text alerts on your mobile number.</span>
              </div>
              <input 
                type="checkbox" 
                checked={notifSettings.sms} 
                onChange={(e) => {
                  setNotifSettings({ ...notifSettings, sms: e.target.checked });
                  saveLocalSetting('sms', e.target.checked, 'notif_');
                }} 
              />
            </div>
          </section>
        )}

        {/* SECURITY SECTION */}
        {activeTab === 'security' && (
          <section className="panel-card settings-section-card">
            <h2>Security Settings</h2>
            <p className="section-desc">Manage passwords and active session authentications.</p>
            
            <form onSubmit={changePassword}>
              <h3>Change Password</h3>
              <div className="settings-form-row" style={{ marginTop: '12px' }}>
                <div className="settings-form-group" style={{ position: 'relative' }}>
                  <label>Current Password</label>
                  <input 
                    type={showPasswords ? 'text' : 'password'} 
                    name="currentPassword"
                    value={securityForm.currentPassword}
                    onChange={handleSecurityChange}
                    required 
                  />
                </div>
                <div className="settings-form-group">
                  <label>New Password</label>
                  <input 
                    type={showPasswords ? 'text' : 'password'} 
                    name="newPassword"
                    value={securityForm.newPassword}
                    onChange={handleSecurityChange}
                    required 
                  />
                </div>
                <div className="settings-form-group">
                  <label>Confirm Password</label>
                  <input 
                    type={showPasswords ? 'text' : 'password'} 
                    name="confirmPassword"
                    value={securityForm.confirmPassword}
                    onChange={handleSecurityChange}
                    required 
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowPasswords(!showPasswords)}
                  style={{ background: 'none', border: 'none', color: 'var(--role-primary)', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', fontWeight: 700 }}
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPasswords ? 'Hide Passwords' : 'Show Passwords'}
                </button>
                <button type="submit" className="btn btn-ghost" disabled={loading} style={{ padding: '8px 14px', fontSize: '13px', minHeight: 'auto' }}>
                  Update Password
                </button>
              </div>
            </form>

            <hr style={{ margin: '24px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b style={{ fontSize: '14px', display: 'block', color: 'var(--text-main)' }}>Multi-Factor Authentication (MFA)</b>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>MFA adds an extra layer of login safety.</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>MOCK/COMING SOON</span>
            </div>
          </section>
        )}

        {/* LANGUAGE & ACCESSIBILITY SECTION */}
        {activeTab === 'language' && (
          <section className="panel-card settings-section-card">
            <h2>Language & Accessibility</h2>
            <p className="section-desc">Configure multilingual display interfaces and font sizes.</p>
            
            <div className="settings-form-group" style={{ marginBottom: '20px' }}>
              <label>System Language</label>
              <select value={profileForm.preferredLanguage} name="preferredLanguage" onChange={handleProfileChange}>
                <option value="English">English</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Tanglish">Tanglish</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>

            <div className="settings-form-group" style={{ marginBottom: '20px' }}>
              <label>Font Scaling Size</label>
              <select value={fontSize} onChange={(e) => updateFontSize(e.target.value)}>
                <option value="small">Small</option>
                <option value="default">Default / Normal</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="settings-toggle-row">
              <div>
                <label>High Contrast Mode</label>
                <span>Increases text outline visibility.</span>
              </div>
              <input 
                type="checkbox" 
                checked={highContrast} 
                onChange={(e) => {
                  setHighContrast(e.target.checked);
                  saveLocalSetting('highContrast', e.target.checked);
                }} 
              />
            </div>
          </section>
        )}

        {/* APP INFO SECTION */}
        {activeTab === 'appinfo' && (
          <section className="panel-card settings-section-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2>App Info & Legal Documents</h2>
            <p className="section-desc">Build version details, legal safety guidelines, and policies.</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--role-soft)', color: 'var(--role-primary)', borderRadius: '8px' }}>
              <ShieldCheck size={20} />
              <b style={{ fontSize: '13px' }}>ARAM Legal Aid AI Platform — v1.0.4-RELEASE</b>
            </div>

            <div>
              <h4 style={{ margin: '0 0 6px', color: 'var(--text-main)' }}>Official Disclaimer</h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                “This platform provides preliminary legal aid guidance only. It does not replace a lawyer, court, police, or legal authority. For emergencies, contact official emergency services immediately.”
              </p>
            </div>

            <hr />

            <div>
              <h4 style={{ margin: '0 0 8px', color: 'var(--text-main)' }}>Legal Policies & Documentation</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/terms" style={{ color: 'var(--role-primary)', fontSize: '13px', fontWeight: 700, textDecoration: 'underline' }}>Terms & Conditions</Link>
                <Link to="/privacy" style={{ color: 'var(--role-primary)', fontSize: '13px', fontWeight: 700, textDecoration: 'underline' }}>Privacy Policy</Link>
                <Link to="/disclaimer" style={{ color: 'var(--role-primary)', fontSize: '13px', fontWeight: 700, textDecoration: 'underline' }}>Official Legal Disclaimer</Link>
                <Link to="/cookies" style={{ color: 'var(--role-primary)', fontSize: '13px', fontWeight: 700, textDecoration: 'underline' }}>Cookie Policy</Link>
              </div>
            </div>

            <hr />

            <div>
              <h4 style={{ margin: '0 0 6px', color: 'var(--text-main)' }}>AI Limitation Notice</h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                AI assessments are built on top of automated classification parameters and keywords. Legal officers and verified volunteers audit these decisions before dispatching formal support.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
