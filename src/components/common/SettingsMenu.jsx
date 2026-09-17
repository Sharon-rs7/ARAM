import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Paintbrush, Shield, FileText, Bell, Lock, Languages, Info, Settings as FullSettings } from 'lucide-react';
import { getCurrentUser } from '@/services/api.js';

export default function SettingsMenu({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const user = getCurrentUser();

  const getSettingsPath = () => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return '/admin/settings';
    if (path.startsWith('/helper')) return '/helper/settings';
    if (path.startsWith('/advocate')) return '/advocate/settings';
    if (path.startsWith('/authority')) return '/authority/settings';
    return '/dashboard/settings';
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelect = (hash) => {
    navigate(`${getSettingsPath()}${hash}`);
    onClose();
  };

  const menuItems = [
    { label: 'Profile', hash: '#profile', icon: User },
    { label: 'Appearance', hash: '#appearance', icon: Paintbrush },
    { label: 'Privacy', hash: '#privacy', icon: Shield },
    { label: 'Documents', hash: '#documents', icon: FileText },
    { label: 'Notifications', hash: '#notifications', icon: Bell },
    { label: 'Security', hash: '#security', icon: Lock },
    { label: 'Language & Accessibility', hash: '#language', icon: Languages },
    { label: 'App Info', hash: '#appinfo', icon: Info },
  ];

  return (
    <div 
      className="settings-menu-dropdown" 
      ref={menuRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '240px',
        background: 'var(--bg-elevated, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow)',
        zIndex: 50,
        padding: '8px 0',
      }}
    >
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{user?.name || 'User Settings'}</p>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email || ''}</p>
      </div>
      <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '4px 0' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.hash}
              type="button"
              onClick={() => handleSelect(item.hash)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                border: 0,
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text-main)',
                transition: 'background 0.2s',
              }}
              className="settings-dropdown-item"
            >
              <Icon size={16} style={{ color: 'var(--role-primary)' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div style={{ borderTop: '1px solid var(--border)', padding: '4px 0' }}>
        <button
          type="button"
          onClick={() => handleSelect('')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            border: 0,
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--role-primary)',
          }}
          className="settings-dropdown-item"
        >
          <FullSettings size={16} />
          <span>Full Settings</span>
        </button>
      </div>
    </div>
  );
}
