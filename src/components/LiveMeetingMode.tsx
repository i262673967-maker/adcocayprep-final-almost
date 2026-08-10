import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  FileText,
  Save,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Student, MeetingPacket, MeetingLog, MeetingDecision, ActionItem } from '../types';

interface LiveMeetingModeProps {
  student: Student;
  packet?: MeetingPacket | null;
  onClose: () => void;
  onFinishMeeting: (log: MeetingLog) => void;
}

export const LiveMeetingMode: React.FC<LiveMeetingModeProps> = ({
  student,
  packet,
  onClose,
  onFinishMeeting
}) => {
  const [liveNotes, setLiveNotes] = useState('');
  const [decisions, setDecisions] = useState<MeetingDecision[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  // New Decision Inputs
  const [newTopic, setNewTopic] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [newAgreed, setNewAgreed] = useState(true);

  // New Action Item Inputs
  const [newTask, setNewTask] = useState('');
  const [newOwner, setNewOwner] = useState('School Team');
  const [newDueDate, setNewDueDate] = useState('');

  const [isFinished, setIsFinished] = useState(false);

  const handleAddDecision = () => {
    if (!newDecision.trim()) return;
    const item: MeetingDecision = {
      id: 'dec_' + Date.now(),
      topic: newTopic.trim() || 'General Discussion',
      decision: newDecision.trim(),
      agreed: newAgreed
    };
    setDecisions([...decisions, item]);
    setNewTopic('');
    setNewDecision('');
    setNewAgreed(true);
  };

  const handleRemoveDecision = (id: string) => {
    setDecisions(decisions.filter((d) => d.id !== id));
  };

  const handleAddActionItem = () => {
    if (!newTask.trim()) return;
    const item: ActionItem = {
      id: 'act_' + Date.now(),
      task: newTask.trim(),
      owner: newOwner.trim() || 'School Team',
      dueDate: newDueDate || undefined,
      completed: false
    };
    setActionItems([...actionItems, item]);
    setNewTask('');
    setNewDueDate('');
  };

  const handleRemoveActionItem = (id: string) => {
    setActionItems(actionItems.filter((a) => a.id !== id));
  };

  const toggleActionItem = (id: string) => {
    setActionItems(
      actionItems.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const handleSaveAndFinish = () => {
    const log: MeetingLog = {
      id: 'log_' + Date.now(),
      studentId: student.id,
      packetId: packet?.id,
      meetingDate: packet?.meetingDate || new Date().toISOString().split('T')[0],
      meetingType: packet?.meetingType || 'IEP_annual',
      liveNotes,
      decisions,
      actionItems,
      finishedAt: new Date().toISOString(),
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    setIsFinished(true);
    onFinishMeeting(log);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 overflow-y-auto flex flex-col">
      {/* Top Header Controls */}
      <div className="bg-slate-900 text-white border-b border-slate-800 p-4 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Exit Meeting Mode"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded animate-pulse">
                Live Meeting Mode
              </span>
              <span className="text-xs font-bold text-slate-300">
                {student.name} ({student.grade})
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {packet ? `${packet.meetingType.replace('_', ' ')} — ${packet.meetingDate}` : 'In-Progress IEP/504 Meeting'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAndFinish}
            disabled={isFinished}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finish Meeting & Save Log</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Reference Priorities & Key Questions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {packet ? (
            <>
              {/* Priorities Quick Sheet */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-white space-y-3">
                <div className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-slate-700 pb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Top Priorities Quick Reference</span>
                </div>
                <div className="space-y-3">
                  {packet.content.topPriorities.map((p, idx) => (
                    <div key={idx} className="bg-slate-900/80 border border-slate-700 p-3 rounded-xl space-y-1 text-xs">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {p.rank || idx + 1}
                        </span>
                        <span>{p.title}</span>
                      </div>
                      <p className="text-slate-300 text-[11.5px] pl-7">{p.rationale}</p>
                      <div className="text-amber-300 text-[11px] font-medium pl-7 italic">
                        Tip: {p.tacticalTip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions Quick Sheet */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-white space-y-3">
                <div className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-slate-700 pb-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Key Questions to Ask Team</span>
                </div>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {packet.content.keyQuestions.map((q, idx) => (
                    <div key={idx} className="bg-slate-900/80 border border-slate-700 p-3 rounded-xl space-y-1 text-xs">
                      <div className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
                        Ask: {q.whoToAsk}
                      </div>
                      <div className="font-semibold text-white">"{q.question}"</div>
                      <div className="text-slate-400 text-[11px]">Goal: {q.goal}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-slate-300 text-xs space-y-3">
              <div className="font-bold text-white text-sm">Meeting Reference</div>
              <p>No meeting packet linked for this session, but you can record live notes, key decisions, and team action items below.</p>
            </div>
          )}
        </div>

        {/* Right Column: Live Notes, Decisions, and Action Items (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Meeting Notes Notepad */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Live Meeting Notes</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Auto-saved to session</span>
            </div>

            <textarea
              rows={8}
              value={liveNotes}
              onChange={(e) => setLiveNotes(e.target.value)}
              placeholder="Type live notes here... e.g. District proposed reducing Speech therapy from 60 to 30 mins. Ms. Davis noted student was making progress in small groups..."
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y leading-relaxed font-sans"
            />
          </div>

          {/* Decisions Tracker */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Decisions Made</span>
              </span>
              <span className="text-xs text-slate-500">{decisions.length} recorded</span>
            </div>

            {/* List of decisions */}
            {decisions.length > 0 && (
              <div className="space-y-2">
                {decisions.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-start justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{d.topic}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            d.agreed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {d.agreed ? 'Agreed' : 'Disagreed / Table'}
                        </span>
                      </div>
                      <p className="text-slate-700">{d.decision}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveDecision(d.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Decision Form */}
            <div className="bg-indigo-50/60 border border-indigo-200 p-3.5 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-indigo-950 text-xs">Record a Decision</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Topic (e.g. Speech Minutes, Accommodations)"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAgreed}
                    onChange={(e) => setNewAgreed(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Parent Agreed</span>
                </label>
              </div>
              <input
                type="text"
                placeholder="What was decided? (e.g. Speech kept at 45 mins/week)"
                value={newDecision}
                onChange={(e) => setNewDecision(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddDecision}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Decision</span>
              </button>
            </div>
          </div>

          {/* Action Items & Follow-ups */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Action Items & Responsibilities</span>
              </span>
              <span className="text-xs text-slate-500">{actionItems.length} tasks</span>
            </div>

            {/* List of Action Items */}
            {actionItems.length > 0 && (
              <div className="space-y-2">
                {actionItems.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={!!a.completed}
                        onChange={() => toggleActionItem(a.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div>
                        <div className={`font-semibold ${a.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {a.task}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Owner: <strong>{a.owner}</strong> {a.dueDate && ` • Due: ${a.dueDate}`}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveActionItem(a.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Action Item Form */}
            <div className="bg-indigo-50/60 border border-indigo-200 p-3.5 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-indigo-950 text-xs">Add Action Item / Task</div>
              <input
                type="text"
                placeholder="Task description (e.g. Send updated OT evaluation report)"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Assigned Owner (e.g. District Psych, Parent, Teacher)"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddActionItem}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
