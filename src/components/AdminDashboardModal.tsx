import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldAlert, Activity, Loader2, AlertCircle } from 'lucide-react';
import { UserProfile, Student, MeetingPacket } from '../types';
import { getAuthToken } from '../lib/firebase';

interface AdminDashboardModalProps {
  user: UserProfile;
  students: Student[];
  packets: MeetingPacket[];
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  user,
  students,
  packets,
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAdminStats();
    } else {
      setLoading(true);
      setErrorMsg(null);
      setAdminStats(null);
    }
  }, [isOpen]);

  const fetchAdminStats = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const token = await getAuthToken();

      const res = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAdminStats(data.stats);
      } else {
        setErrorMsg(data.error || 'Access Denied: Administrator role required.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate admin session.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Admin & System Health Portal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Verifying administrator permissions...</span>
          </div>
        ) : errorMsg ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Access Denied</span>
            </div>
            <p className="text-rose-700">{errorMsg}</p>
          </div>
        ) : adminStats ? (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 border p-4 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Total Users</span>
                <div className="text-2xl font-bold text-slate-900">{adminStats.totalUsers}</div>
              </div>
              <div className="bg-slate-50 border p-4 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Subscribers</span>
                <div className="text-2xl font-bold text-indigo-600">{adminStats.activeSubscribers}</div>
              </div>
              <div className="bg-slate-50 border p-4 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">MRR (Est)</span>
                <div className="text-2xl font-bold text-emerald-600">${adminStats.monthlyRecurringRevenue}</div>
              </div>
              <div className="bg-slate-50 border p-4 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Gemini AI</span>
                <div className="text-xs font-bold text-slate-800 truncate">{adminStats.geminiStatus}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Recent Generation Logs</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2.5">Packet ID</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminStats.recentPackets && adminStats.recentPackets.length > 0 ? (
                      adminStats.recentPackets.map((pkt: any) => (
                        <tr key={pkt.id} className="hover:bg-slate-50">
                          <td className="p-2.5">{pkt.id.substring(0, 12)}...</td>
                          <td className="p-2.5">{pkt.meetingType}</td>
                          <td className="p-2.5">{pkt.meetingDate}</td>
                          <td className="p-2.5 font-bold text-emerald-600">{(pkt.status || 'FINAL').toUpperCase()}</td>
                        </tr>
                      ))
                    ) : (
                      packets.map((pkt) => (
                        <tr key={pkt.id} className="hover:bg-slate-50">
                          <td className="p-2.5">{pkt.id.substring(0, 12)}...</td>
                          <td className="p-2.5">{pkt.meetingType}</td>
                          <td className="p-2.5">{pkt.meetingDate}</td>
                          <td className="p-2.5 font-bold text-emerald-600">{pkt.status.toUpperCase()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
