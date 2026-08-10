import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Phone,
  Globe,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  STATE_PTI_CENTERS,
  FEDERAL_RIGHTS_SUMMARY,
  MANDATORY_LEGAL_DISCLAIMER,
  PTI_UNVERIFIED_DISCLAIMER
} from '../data/stateData';

interface StateRightsDatabaseProps {
  initialStateCode?: string;
}

export const StateRightsDatabase: React.FC<StateRightsDatabaseProps> = ({
  initialStateCode = 'CA'
}) => {
  const [selectedState, setSelectedState] = useState<string>(initialStateCode);
  const [searchTerm, setSearchTerm] = useState('');

  const ptiData = STATE_PTI_CENTERS[selectedState] || STATE_PTI_CENTERS['CA'];

  const filteredStates = Object.keys(STATE_PTI_CENTERS).filter((code) => {
    const st = STATE_PTI_CENTERS[code];
    const searchStr = `${st.stateCode} ${st.stateName} ${st.ptiName}`.toLowerCase();
    return !searchTerm || searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-950 text-indigo-300 font-mono text-[11px] uppercase font-bold px-2.5 py-0.5 rounded border border-indigo-800">
            50-State PTI Directory
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-indigo-600" />
          Parent Training & Information (PTI) Center Directory
        </h1>
        <p className="text-sm text-slate-700 max-w-3xl leading-relaxed font-normal">
          Under federal IDEA law, every US state operates at least one federally funded Parent Training and Information (PTI) Center. These non-profit centers provide free, confidential assistance, legal workshops, and advocacy guidance to parents navigating special education.
        </p>
      </div>

      {/* State Selector & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Select Your State or Territory
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              {Object.keys(STATE_PTI_CENTERS).map((stCode) => (
                <option key={stCode} value={stCode}>
                  {stCode} — {STATE_PTI_CENTERS[stCode].stateName}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Search States or PTI Names
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. California, Matrix, Florida..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Selected State PTI Detail Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  PTI Center for {ptiData.stateName} ({ptiData.stateCode})
                </span>
                {ptiData.lastVerified === null ? (
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/80 flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Unverified Record — Check Details
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Verified: {ptiData.lastVerified}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {ptiData.ptiName}
              </h2>
            </div>

            <a
              href={ptiData.website}
              target="_blank"
              rel="noreferrer"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  <strong>Website:</strong>{' '}
                  <a
                    href={ptiData.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-300 underline font-medium"
                  >
                    {ptiData.website}
                  </a>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  <strong>Phone Hotline:</strong> {ptiData.phone}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700/80 text-slate-200 text-xs leading-relaxed">
              <strong className="text-white block mb-1">State Information & Notes:</strong>
              {ptiData.notes}
            </div>
          </div>

          {/* Prominent Unverified Contact Info Warning */}
          <div className="p-3 bg-amber-950/70 border border-amber-600/60 rounded-xl text-amber-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>DIRECTORY NOTICE:</strong> {PTI_UNVERIFIED_DISCLAIMER}
            </span>
          </div>
        </div>
      </div>

      {/* Federal IDEA / Section 504 Core Rights Summary */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          Federal IDEA & Section 504 Core Parent Rights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEDERAL_RIGHTS_SUMMARY.map((right, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 text-xs"
            >
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2 text-indigo-900">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{right.title}</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-normal">{right.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Legal Framing Notice */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 text-sm text-slate-900 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-base text-amber-950">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>MANDATORY LEGAL DISCLAIMER & STATUTORY NOTICE</span>
        </div>
        <p className="leading-relaxed font-medium text-slate-800 text-sm">
          {MANDATORY_LEGAL_DISCLAIMER}
        </p>
      </div>
    </div>
  );
};
