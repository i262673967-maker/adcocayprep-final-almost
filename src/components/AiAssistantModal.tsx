import React, { useState } from 'react';
import { Bot, Send, Loader2, Sparkles, AlertCircle, BookOpen } from 'lucide-react';
import { Student } from '../types';
import { getAuthToken } from '../lib/firebase';

interface AiAssistantModalProps {
  student?: Student;
  isOpen: boolean;
  onClose: () => void;
  onOpenStateRights: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  student,
  isOpen,
  onClose,
  onOpenStateRights
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickQuestions = [
    'Can I audio record our IEP meeting in California / my state?',
    'What should I say if the school proposes cutting speech therapy minutes?',
    'What is a Prior Written Notice (PWN) and when should I request it?',
    'How do I request an Independent Educational Evaluation (IEE)?'
  ];

  const handleAsk = async (qText?: string) => {
    const query = qText || question;
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const token = await getAuthToken();

      const res = await fetch('/api/ai/ask-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userQuestion: query,
          studentState: student?.state || 'CA',
          studentGrade: student?.grade || '4th Grade',
          meetingType: 'IEP/504 Review'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get AI guidance');
      }

      setAnswer(data.answer);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tactical Special Education Q&A Assistant
              </h2>
              <p className="text-[11px] text-slate-500">
                {student ? `Context: ${student.name} (${student.state} • ${student.grade})` : 'General IDEA / Section 504 Guidance'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1 text-xs">
          <span className="text-slate-500 font-semibold text-[11px]">Suggested Parent Questions:</span>
          <div className="flex flex-col gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(q);
                  handleAsk(q);
                }}
                className="text-left bg-slate-50 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-slate-700 p-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                &bull; {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Type your question about IEP meeting tactics, rights, or acronyms..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Ask</span>
          </button>
        </form>

        {/* AI Answer Box */}
        {error && (
          <div className="bg-rose-50 text-rose-900 p-3 rounded-xl border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {answer && (
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 text-xs space-y-3 max-h-60 overflow-y-auto">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Tactical Guidance
            </div>
            <div className="text-slate-800 whitespace-pre-wrap leading-relaxed text-[11.5px]">
              {answer}
            </div>
          </div>
        )}

        {/* Framing Banner */}
        <div className="bg-slate-100 p-2.5 rounded-lg border text-[10px] text-slate-600 flex justify-between items-center gap-2">
          <span><strong>Notice:</strong> Informational guidance only, not legal advice.</span>
          <button
            onClick={() => {
              onClose();
              onOpenStateRights();
            }}
            className="text-indigo-700 font-semibold underline cursor-pointer shrink-0"
          >
            Find State PTI Center
          </button>
        </div>
      </div>
    </div>
  );
};
