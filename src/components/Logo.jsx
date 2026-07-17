import { Scale } from 'lucide-react';

export default function Logo({ dark = false }) {
  return (
    <div className="logo-wrap">
      <div className="logo-mark"><Scale size={20} /></div>
      <div>
        <h2 className={dark ? 'logo-title white' : 'logo-title'}>ARAM</h2>
        <p className={dark ? 'logo-sub white-soft' : 'logo-sub'}>Legal Aid AI</p>
      </div>
    </div>
  );
}
