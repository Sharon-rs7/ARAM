import React, { useState } from "react";
import { MapPin, Phone, Clock, Globe, Navigation, Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

const AuthorityLocationCard = ({ office, distance }) => {
  const [copied, setCopied] = useState(false);

  if (!office) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(office.address);
    setCopied(true);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getDirectionsUrl = () => {
    if (office.latitude && office.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${office.latitude},${office.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address)}`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700">
            {office.authorityType}
          </span>
          <h4 className="text-sm font-bold text-slate-800 mt-2">{office.name}</h4>
          <p className="text-[11px] text-slate-400 font-semibold">{office.area}, {office.district}</p>
        </div>
        {distance !== undefined && distance !== null ? (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
            {typeof distance === 'number' ? `${distance.toFixed(1)} km` : distance}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg shrink-0">
            Distance unavailable
          </span>
        )}
      </div>

      <div className="space-y-2 text-xs text-slate-650">
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <span className="leading-relaxed">{office.address}</span>
        </div>

        {office.workingHours && (
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-400 shrink-0" />
            <span>{office.workingHours}</span>
          </div>
        )}

        {office.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-slate-400 shrink-0" />
            <a href={`tel:${office.phone}`} className="hover:underline font-medium text-slate-600">
              {office.phone}
            </a>
          </div>
        )}

        {office.website && (
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-slate-400 shrink-0" />
            <a href={office.website} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium text-indigo-650 flex items-center gap-1">
              Website <ExternalLink size={10} />
            </a>
          </div>
        )}
      </div>

      {office.latitude && office.longitude && (
        <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
          <iframe
            title={`Map for ${office.name}`}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${office.longitude - 0.005}%2C${office.latitude - 0.005}%2C${office.longitude + 0.005}%2C${office.latitude + 0.005}&layer=mapnik&marker=${office.latitude}%2C${office.longitude}`}
            className="filter contrast-[1.05]"
          ></iframe>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
        >
          <Navigation size={13} />
          Directions
        </a>

        <button
          onClick={handleCopyAddress}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          Copy Address
        </button>

        {office.onlinePortalUrl && (
          <a
            href={office.onlinePortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition"
          >
            <ExternalLink size={13} />
            Open Online Portal
          </a>
        )}
      </div>
    </div>
  );
};

export default AuthorityLocationCard;
