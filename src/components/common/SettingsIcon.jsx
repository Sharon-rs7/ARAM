import { Settings } from 'lucide-react';

export default function SettingsIcon({ onClick, isOpen }) {
  return (
    <button 
      className="icon-btn" 
      type="button" 
      onClick={onClick} 
      aria-label="Open settings"
      aria-expanded={isOpen}
      style={{ 
        position: 'relative', 
        display: 'grid', 
        placeItems: 'center',
        padding: 0,
        width: '40px',
        height: '40px',
        border: '0',
        borderRadius: '12px',
        background: 'var(--bg-card, #ffffff)',
        boxShadow: '0 4px 16px rgba(15,23,42,.06)',
        color: 'var(--text-main, #0f172a)',
        cursor: 'pointer'
      }}
    >
      <Settings size={19} />
    </button>
  );
}
