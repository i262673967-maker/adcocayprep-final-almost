import React, { useState } from 'react';
import {
  Settings,
  ShieldAlert,
  Download,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { UserProfile, Student, MeetingPacket } from '../types';
import { getAuthToken } from '../lib/firebase';

interface SettingsModalProps {
  user: UserProfile;
  students: Student[];
  packets: MeetingPacket[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (name: string, email: string) => void;
  onOpenPricing: () => void;
  onRequestAccountDeletion: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  students,
  packets,
  isOpen,
  onClose,
  onUpdateProfile,
  onOpenPricing,
  onRequestAccountDeletion
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(name, email);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleOpenBillingPortal = async () => {
    if (user.customerPortalUrl) {
      window.open(user.customerPortalUrl, '_blank');
      return;
    }

    setPortalLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/billing-portal', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        onOpenPricing();
      }
    } catch (err) {
      console.error('Error fetching billing portal URL:', err);
      onOpenPricing();
    } finally {
      setPortalLoading(false);
    }
  };

  const handleExportData = () => {
    const exportObject = {
      exportDate: new Date().toISOString(),
      user,
      students,
      packets
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `advocacyprep_data_export_${user.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getPlanDisplayName = () => {
    if (user.planTier === 'subscriber') return 'Family Plan';
    if (user.planTier === 'advocate') return 'Advocate Plan';
    return 'Free Tier';
  };

  const getStatusBadge = () => {
    const status = user.subscriptionStatus || (user.planTier === 'subscriber' ? 'active' : 'free');
    if (status === 'active' || status === 'on_trial') {
      return (
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Active
        </span>
      );
    }
    if (status === 'cancelled' || status === 'expired') {
      return (
        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {status}
        </span>
      );
    }
    return (
      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
        Free
      </span>
    );
  };

  const formattedRenewalDate = user.subscriptionRenewsAt
    ? new Date(user.subscriptionRenewsAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Account Settings & Data Privacy
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-1">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Parent Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {savedSuccess && (
              <span className="text-emerald-700 font-medium text-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Profile updated!
              </span>
            )}
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow ml-auto cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>

        {/* Subscription Plan Overview */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Subscription Plan</span>
                {getStatusBadge()}
              </div>
              <div className="text-slate-700 text-xs flex items-center gap-1.5">
                <span>Current Plan:</span>
                <strong className="text-indigo-900 font-bold">{getPlanDisplayName()}</strong>
              </div>
              {formattedRenewalDate && (
                <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Renews/Expires on: <strong>{formattedRenewalDate}</strong></span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={portalLoading}
                onClick={handleOpenBillingPortal}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span>Manage Billing</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={onOpenPricing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Upgrade Options</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Export */}
        <div className="border-t pt-4 space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Data Export</h3>
          <p className="text-slate-600">
            Download a full JSON archive of all student profiles, meeting notice logs, and generated preparation packets.
          </p>
          <button
            onClick={handleExportData}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export My Student Data (JSON)</span>
          </button>
        </div>

        {/* Account Deletion (Privacy Compliance) */}
        <div className="border-t border-rose-200 pt-4 space-y-3 text-xs">
          <h3 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Account Deletion & Data Privacy Compliance
          </h3>
          <p className="text-slate-600 leading-relaxed">
            In compliance with student data privacy standards, you can request full account erasure at any time. All associated student profiles, uploaded notice text, and generated packets will be permanently purged within 30 days.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 font-semibold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Request Account & Student Data Deletion
            </button>
          ) : (
            <div className="bg-rose-100 border border-rose-300 rounded-xl p-4 space-y-3 text-rose-950">
              <strong className="block text-sm">Are you sure you want to delete your account?</strong>
              <p>This action will queue all student profiles and saved prep packets for immediate hard deletion.</p>
              <div className="flex gap-3">
                <button
                  onClick={onRequestAccountDeletion}
                  className="bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-rose-800 cursor-pointer"
                >
                  Confirm Delete My Account
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="bg-white border text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
