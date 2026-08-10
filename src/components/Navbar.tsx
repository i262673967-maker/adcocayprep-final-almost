import React from 'react';
import {
  ShieldCheck,
  PlusCircle,
  Users,
  FileText,
  BookOpen,
  Sparkles,
  Settings,
  Crown,
  History,
  Bot,
  UserCheck
} from 'lucide-react';
import { UserProfile, Student } from '../types';

interface NavbarProps {
  user: UserProfile;
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPricing: () => void;
  onOpenSettings: () => void;
  onOpenAiAssistant: () => void;
  onOpenAuth: () => void;
  onStartNewMeeting: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  students,
  selectedStudentId,
  onSelectStudent,
  activeTab,
  setActiveTab,
  onOpenPricing,
  onOpenSettings,
  onOpenAiAssistant,
  onOpenAuth,
  onStartNewMeeting
}) => {
  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const getTierBadge = () => {
    if (user.planTier === 'subscriber') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-950/60 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-700/50">
          <Crown className="w-3 h-3 text-emerald-400" />
          Family Plan
        </span>
      );
    }
    if (user.planTier === 'advocate') {
      return (
        <span className="inline-flex items-center gap-1 bg-purple-950/60 text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-700/50">
          <Crown className="w-3 h-3 text-purple-400" />
          Advocate Pro
        </span>
      );
    }
    const remaining = Math.max(0, user.maxFreeGenerations - user.generationsCount);
    return (
      <button
        onClick={onOpenPricing}
        className="inline-flex items-center gap-1 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-700/50 transition-colors cursor-pointer"
      >
        <Sparkles className="w-3 h-3 text-amber-400" />
        Free Tier ({remaining} left) &bull; Upgrade
      </button>
    );
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:bg-indigo-500 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                  AdvocacyPrep
                  <span className="text-[10px] uppercase font-mono tracking-wider bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/60">
                    Tactical IEP/504
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">1-Page Meeting Prep Generator</div>
              </div>
            </button>

            {/* Active Student Selector */}
            {students.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-400 font-medium">Student:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => onSelectStudent(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                      {st.name} ({st.grade} &bull; {st.state})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Dashboard
            </button>

            <button
              onClick={onStartNewMeeting}
              className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Meeting Packet
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              My Students ({students.length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Past Packets
            </button>

            <button
              onClick={() => setActiveTab('state-rights')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'state-rights'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              State PTI Directory
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="px-2.5 py-2 rounded-md text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Tactical AI Assistant"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Ask AI</span>
            </button>
          </nav>

          {/* User Controls & Plan Badge */}
          <div className="flex items-center gap-3">
            {getTierBadge()}

            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Account Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`shrink-0 px-2.5 py-1 rounded ${activeTab === 'dashboard' ? 'bg-indigo-900 text-white font-semibold' : 'text-slate-300'}`}
        >
          Dashboard
        </button>
        <button
          onClick={onStartNewMeeting}
          className="shrink-0 px-2.5 py-1 bg-indigo-600 text-white font-semibold rounded"
        >
          + New Packet
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`shrink-0 px-2.5 py-1 rounded ${activeTab === 'students' ? 'bg-indigo-900 text-white font-semibold' : 'text-slate-300'}`}
        >
          Students
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`shrink-0 px-2.5 py-1 rounded ${activeTab === 'history' ? 'bg-indigo-900 text-white font-semibold' : 'text-slate-300'}`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('state-rights')}
          className={`shrink-0 px-2.5 py-1 rounded ${activeTab === 'state-rights' ? 'bg-indigo-900 text-white font-semibold' : 'text-slate-300'}`}
        >
          PTI Directory
        </button>
      </div>
    </header>
  );
};
