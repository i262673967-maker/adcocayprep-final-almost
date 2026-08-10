import React, { useState } from 'react';
import {
  History,
  FileText,
  Calendar,
  Users,
  Eye,
  PlusCircle,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { MeetingPacket, Student, MeetingLog } from '../types';

interface PacketHistoryProps {
  packets: MeetingPacket[];
  meetingLogs?: MeetingLog[];
  students: Student[];
  selectedStudentId: string;
  onSelectPacket: (packet: MeetingPacket) => void;
  onStartNewMeeting: () => void;
  onDeletePacket: (packetId: string) => void;
}

export const PacketHistory: React.FC<PacketHistoryProps> = ({
  packets,
  meetingLogs = [],
  students,
  selectedStudentId,
  onSelectPacket,
  onStartNewMeeting,
  onDeletePacket
}) => {
  const [activeHistoryTab, setActiveHistoryTab] = useState<'packets' | 'logs'>('packets');
  const [filterStudentId, setFilterStudentId] = useState<string>(selectedStudentId || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPackets = packets.filter((p) => {
    const matchesStudent = filterStudentId === 'all' || p.studentId === filterStudentId;
    const student = students.find((s) => s.id === p.studentId);
    const searchString = `${p.meetingType} ${p.meetingDate} ${student?.name || ''}`.toLowerCase();
    const matchesSearch = !searchTerm || searchString.includes(searchTerm.toLowerCase());
    return matchesStudent && matchesSearch;
  });

  const filteredLogs = meetingLogs.filter((m) => {
    const matchesStudent = filterStudentId === 'all' || m.studentId === filterStudentId;
    const student = students.find((s) => s.id === m.studentId);
    const searchString = `${m.meetingType} ${m.meetingDate} ${m.liveNotes || ''} ${student?.name || ''}`.toLowerCase();
    const matchesSearch = !searchTerm || searchString.includes(searchTerm.toLowerCase());
    return matchesStudent && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Meeting Packet History
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Access past 1-page preparation packets across all annual reviews and IEP meetings.
          </p>
        </div>

        <button
          onClick={onStartNewMeeting}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Meeting Packet</span>
        </button>
      </div>

      {/* Sub-tabs and Filter Bar */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveHistoryTab('packets')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeHistoryTab === 'packets'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Meeting Prep Packets ({packets.length})</span>
          </button>
          <button
            onClick={() => setActiveHistoryTab('logs')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeHistoryTab === 'logs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Live Meeting Records ({meetingLogs.length})</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Users className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-700">Filter by Student:</span>
            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Students ({students.length})</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grade})
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search date or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* RENDER PACKETS TAB */}
      {activeHistoryTab === 'packets' && (
        filteredPackets.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center space-y-4">
            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">No Meeting Packets Found</h3>
              <p className="text-xs text-slate-600">
                Create your first 1-page prep packet to save history for upcoming IEP or 504 meetings.
              </p>
            </div>
            <button
              onClick={onStartNewMeeting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
            >
              + Prepare New Packet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackets.map((pkt) => {
              const student = students.find((s) => s.id === pkt.studentId);
              const formattedDate = new Date(pkt.meetingDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={pkt.id}
                  className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="bg-indigo-50 text-indigo-900 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded font-mono">
                        {pkt.meetingType.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => onDeletePacket(pkt.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {student ? student.name : 'Student Profile'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          {formattedDate}
                        </span>
                        <span>&bull;</span>
                        <span>v{pkt.version}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                      <div className="font-semibold text-slate-900 line-clamp-1">
                        Top Priority: {pkt.content.topPriorities[0]?.title || 'Meeting Preparation'}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {pkt.content.topPriorities[0]?.rationale || 'Tailored tactical preparation packet.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(pkt.generatedAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => onSelectPacket(pkt)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Packet</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* RENDER LIVE MEETING LOGS TAB */}
      {activeHistoryTab === 'logs' && (
        filteredLogs.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center space-y-4">
            <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">No Live Meeting Records Recorded</h3>
              <p className="text-xs text-slate-600">
                During an IEP/504 meeting, enter Live Meeting Mode to capture notes, decisions, and action items in real-time.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const student = students.find((s) => s.id === log.studentId);
              return (
                <div key={log.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
                        Completed Meeting Log
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{student?.name || 'Student'}</span>
                      <span className="text-xs text-slate-500">({log.meetingDate})</span>
                    </div>
                  </div>

                  {log.liveNotes && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <strong className="text-slate-900 block">Live Meeting Notes:</strong>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{log.liveNotes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Decisions */}
                    {log.decisions.length > 0 && (
                      <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 space-y-1.5">
                        <strong className="text-indigo-950 block">Decisions Recorded ({log.decisions.length}):</strong>
                        <div className="space-y-1 text-[11px]">
                          {log.decisions.map((d, i) => (
                            <div key={i} className="text-slate-800">
                              • <strong>{d.topic}:</strong> {d.decision} ({d.agreed ? 'Agreed' : 'Disagreed'})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action items */}
                    {log.actionItems.length > 0 && (
                      <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 space-y-1.5">
                        <strong className="text-emerald-950 block">Action Items & Follow-ups ({log.actionItems.length}):</strong>
                        <div className="space-y-1 text-[11px]">
                          {log.actionItems.map((a, i) => (
                            <div key={i} className="text-slate-800">
                              • <strong>{a.task}</strong> (Owner: {a.owner}{a.dueDate ? `, Due: ${a.dueDate}` : ''})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};
