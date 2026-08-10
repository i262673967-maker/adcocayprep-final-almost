import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  ShieldCheck,
  Eye,
  FileText,
  Sparkles,
  ArrowRight,
  BarChart3
} from 'lucide-react';

import { UserProfile, Student, MeetingPacket, PlanTier, MeetingLog } from './types';
import {
  getStoredUser,
  saveStoredUser,
  getStoredStudents,
  saveStoredStudent,
  deleteStoredStudent,
  getStoredPackets,
  saveStoredPacket,
  deleteStoredPacket,
  getStoredMeetingLogs,
  saveStoredMeetingLog,
  getDraftIntake
} from './lib/storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './lib/firebase';
import { STATE_PTI_CENTERS } from './data/stateData';

import { Navbar } from './components/Navbar';
import { FooterDisclaimer } from './components/FooterDisclaimer';
import { LandingPage } from './components/LandingPage';
import { StudentManagement } from './components/StudentManagement';
import { NewMeetingWizard } from './components/NewMeetingWizard';
import { PacketViewer } from './components/PacketViewer';
import { PacketHistory } from './components/PacketHistory';
import { StateRightsDatabase } from './components/StateRightsDatabase';
import { PricingModal } from './components/PricingModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { TermsModal } from './components/TermsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { LiveMeetingMode } from './components/LiveMeetingMode';

export default function App() {
  // Core Local State
  const [user, setUser] = useState<UserProfile>({
    id: 'user_demo_101',
    email: 'parent@example.com',
    name: 'Parent User',
    planTier: 'free_user',
    generationsCount: 0,
    maxFreeGenerations: 1,
    createdAt: new Date().toISOString()
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [packets, setPackets] = useState<MeetingPacket[]>([]);
  const [meetingLogs, setMeetingLogs] = useState<MeetingLog[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('student_1');

  // Active View Tab: 'dashboard' | 'landing' | 'students' | 'wizard' | 'packet-viewer' | 'history' | 'state-rights'
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPacket, setSelectedPacket] = useState<MeetingPacket | null>(null);
  const [isLiveMeetingOpen, setIsLiveMeetingOpen] = useState(false);

  // Modals
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Initial Data Load
  const loadUserData = async (userId?: string) => {
    const u = await getStoredUser(userId);
    setUser(u);
    const sts = await getStoredStudents(u.id);
    setStudents(sts);
    if (sts.length > 0 && (!selectedStudentId || selectedStudentId === 'student_1')) {
      setSelectedStudentId(sts[0].id);
    }
    const pkts = await getStoredPackets(u.id);
    setPackets(pkts);
    const logs = await getStoredMeetingLogs(u.id);
    setMeetingLogs(logs);
  };

  useEffect(() => {
    const initDiagnosticApp = async () => {
      const configured = isFirebaseConfigured();
      console.log('====================================================');
      if (configured) {
        console.log('🚀 [DIAGNOSTIC] FIREBASE MODE IS ACTIVE (isFirebaseConfigured() = true)');
      } else {
        console.log('ℹ️ [DIAGNOSTIC] LOCALSTORAGE FALLBACK MODE ACTIVE (isFirebaseConfigured() = false)');
      }
      console.log('====================================================');
    };

    initDiagnosticApp();

    if (isFirebaseConfigured()) {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          try {
            if (firebaseUser) {
              console.log('✅ [FIREBASE AUTH SESSION] Logged in user:', firebaseUser.uid, `(${firebaseUser.email})`);
              // Explicit check to verify if Firebase session token is available before loading data
              const token = await firebaseUser.getIdToken().catch((tokenErr) => {
                console.warn('⚠️ [AUTH TOKEN] Error fetching token in onAuthStateChanged:', tokenErr);
                return null;
              });
              if (token) {
                console.log('✅ [AUTH TOKEN VERIFIED] Session token verified for:', firebaseUser.uid);
              }
              await loadUserData(firebaseUser.uid);
            } else {
              console.log('ℹ️ [FIREBASE SESSION] No active user session logged in.');
              await loadUserData();
            }
          } catch (err) {
            console.error('❌ [FIREBASE AUTH OBSERVER CALLBACK EXCEPTION]:', err);
            await loadUserData();
          }
        },
        (error) => {
          console.error('❌ [FIREBASE AUTH OBSERVER ERROR]:', error);
          loadUserData();
        }
      );

      return () => unsubscribe();
    } else {
      loadUserData();
    }
  }, []);

  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Student Handlers
  const handleAddStudent = async (newStudentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: 'student_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    await saveStoredStudent(newStudent);
    const updated = [...students, newStudent];
    setStudents(updated);
    setSelectedStudentId(newStudent.id);
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    await saveStoredStudent(updatedStudent);
    setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (students.length <= 1) return;
    await deleteStoredStudent(studentId, user.id);
    const updated = students.filter((s) => s.id !== studentId);
    setStudents(updated);
    if (selectedStudentId === studentId) {
      setSelectedStudentId(updated[0].id);
    }
  };

  // Packet Handlers
  const handlePacketGenerated = async (newPacket: MeetingPacket) => {
    const isWatermarked = user.planTier === 'free_user';
    const finalPacket = { ...newPacket, isWatermarked };

    await saveStoredPacket(finalPacket, user.id);
    const updatedPackets = [finalPacket, ...packets];
    setPackets(updatedPackets);
    setSelectedPacket(finalPacket);

    const updatedUser: UserProfile = {
      ...user,
      generationsCount: user.generationsCount + 1,
      lastGenerationDate: new Date().toISOString()
    };
    setUser(updatedUser);
    await saveStoredUser(updatedUser);

    setActiveTab('packet-viewer');
  };

  const handleUpdatePacket = async (updatedPacket: MeetingPacket) => {
    await saveStoredPacket(updatedPacket, user.id);
    setPackets(packets.map((p) => (p.id === updatedPacket.id ? updatedPacket : p)));
    setSelectedPacket(updatedPacket);
  };

  const handleDeletePacket = async (packetId: string) => {
    await deleteStoredPacket(packetId, user.id);
    const updated = packets.filter((p) => p.id !== packetId);
    setPackets(updated);
    if (selectedPacket?.id === packetId) {
      setSelectedPacket(null);
      setActiveTab('history');
    }
  };

  const handleUpdateProfile = async (name: string, email: string) => {
    const updated: UserProfile = {
      ...user,
      name,
      email
    };
    setUser(updated);
    await saveStoredUser(updated);
  };

  const handleAccountDeletion = async () => {
    localStorage.clear();
    if (isFirebaseConfigured()) {
      await signOut(auth);
    }
    window.location.reload();
  };

  const currentStudentPackets = packets.filter((p) => p.studentId === selectedStudentId);
  const ptiData = activeStudent ? STATE_PTI_CENTERS[activeStudent.state] : STATE_PTI_CENTERS['CA'];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          user={user}
          students={students}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenPricing={() => setIsPricingOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onStartNewMeeting={() => setActiveTab('wizard')}
        />

        {/* MAIN VIEW SWITCHER */}

        {/* 1. LANDING PAGE VIEW */}
        {activeTab === 'landing' && (
          <LandingPage
            onStartFree={() => setActiveTab('wizard')}
            onViewSamplePacket={() => {
              const sample = packets.find((p) => p.id === 'packet_sample_maya') || packets[0];
              if (sample) {
                setSelectedPacket(sample);
                setActiveTab('packet-viewer');
              }
            }}
            onOpenPricing={() => setIsPricingOpen(true)}
            onOpenStateRights={() => setActiveTab('state-rights')}
            onOpenTerms={() => setIsTermsOpen(true)}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        )}

        {/* 2. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Subscription Status Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3 text-xs">
                <div className={`p-2 rounded-xl ${user.planTier === 'subscriber' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>Subscription Status: {user.planTier === 'subscriber' ? 'Family Plan (Active)' : 'Free Tier'}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      user.subscriptionStatus === 'active' || user.subscriptionStatus === 'on_trial' || user.planTier === 'subscriber'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {user.subscriptionStatus || 'Free'}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {user.planTier === 'subscriber'
                      ? `Unlimited AI Packet Generations ${user.subscriptionRenewsAt ? `• Renews: ${new Date(user.subscriptionRenewsAt).toLocaleDateString()}` : ''}`
                      : `${user.generationsCount || 0} of ${user.maxFreeGenerations || 1} free 1-page packets used`}
                  </div>
                </div>
              </div>

              <button
                onClick={() => user.planTier === 'subscriber' ? setIsSettingsOpen(true) : setIsPricingOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors shrink-0"
              >
                {user.planTier === 'subscriber' ? 'Manage Subscription' : 'Upgrade Plan'}
              </button>
            </div>

            {/* In-Progress Draft Resume Banner */}
            {activeStudent && getDraftIntake(activeStudent.id) && (
              <div className="bg-indigo-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-indigo-700">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>In-Progress Meeting Preparation Saved</span>
                  </div>
                  <p className="text-xs text-slate-200">
                    You have an unsubmitted intake draft for <strong>{activeStudent.name}</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('wizard')}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow cursor-pointer transition-colors shrink-0"
                >
                  Continue Preparation &rarr;
                </button>
              </div>
            )}

            {/* Welcome Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
              <div className="space-y-3 max-w-2xl z-10">
                <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 rounded-full px-3 py-0.5 text-xs text-indigo-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tactical IEP & 504 Meeting Preparation</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome back, {user.name.split(' ')[0]}
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Preparing for an upcoming meeting for <strong>{activeStudent?.name}</strong> ({activeStudent?.grade} &bull; {activeStudent?.schoolDistrict})? Turn meeting notices into 1-page tactical printouts or launch Live Meeting Mode.
                </p>

                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setActiveTab('wizard')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Prepare New 1-Page Packet</span>
                  </button>

                  {activeStudent && (
                    <button
                      onClick={() => setIsLiveMeetingOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Enter Live Meeting Mode</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Student Quick Card */}
              {activeStudent && (
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 w-full lg:w-72 text-xs space-y-2 shrink-0 z-10 text-slate-300">
                  <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] uppercase">
                    <span>Active Student Profile</span>
                    <button
                      onClick={() => setActiveTab('students')}
                      className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                    >
                      Manage ({students.length})
                    </button>
                  </div>
                  <div className="font-bold text-sm text-white">{activeStudent.name}</div>
                  <div><strong>Grade:</strong> {activeStudent.grade}</div>
                  <div><strong>District:</strong> {activeStudent.schoolDistrict}</div>
                  {activeStudent.disabilityCategory && (
                    <div className="bg-indigo-950 text-indigo-300 px-2 py-1 rounded border border-indigo-800 text-[11px]">
                      {activeStudent.disabilityCategory}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Main Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Recent Packets for Active Student */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span>Meeting Prep Packets for {activeStudent?.name}</span>
                  </h2>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer shrink-0"
                  >
                    View All ({packets.length}) &rarr;
                  </button>
                </div>

                {currentStudentPackets.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                    <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm">No Packets Generated Yet for {activeStudent?.name}</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Create a 1-page print ready prep sheet for your upcoming annual review or Section 504 meeting.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('wizard')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer"
                    >
                      + Prepare First Packet Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentStudentPackets.map((pkt) => (
                      <div
                        key={pkt.id}
                        className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-indigo-50 text-indigo-900 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded font-mono">
                              {pkt.meetingType.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              Date: {pkt.meetingDate}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 sm:pt-0">
                            <button
                              onClick={() => {
                                setSelectedPacket(pkt);
                                setActiveTab('packet-viewer');
                              }}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1 cursor-pointer w-full sm:w-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View / Print 1-Pager</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                            <strong className="text-slate-900 block text-[11px] uppercase tracking-wider">Top Priority:</strong>
                            <p className="text-slate-700 text-[11.5px] font-medium line-clamp-2">
                              {pkt.content.topPriorities[0]?.title || 'Meeting Preparation'}
                            </p>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                            <strong className="text-slate-900 block text-[11px] uppercase tracking-wider">Key Questions:</strong>
                            <p className="text-slate-600 text-[11px] line-clamp-2">
                              {pkt.content.keyQuestions[0]?.question || 'Specific questions formulated for team.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: State PTI Card & Tactical Advice */}
              <div className="lg:col-span-4 space-y-6">
                {/* State PTI Resource Card */}
                {ptiData && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-mono text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {ptiData.stateCode} State Resource
                      </span>
                      <button
                        onClick={() => setActiveTab('state-rights')}
                        className="text-indigo-600 hover:underline font-semibold cursor-pointer text-[11px]"
                      >
                        Full Directory
                      </button>
                    </div>

                    <div className="font-bold text-slate-900 text-sm">{ptiData.ptiName}</div>
                    <p className="text-slate-600 text-[11.5px] leading-relaxed">
                      {ptiData.notes}
                    </p>

                    <div className="pt-1">
                      <a
                        href={ptiData.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Contact {ptiData.stateCode} PTI Center Hotline</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Tactical Tip of the Day */}
                <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 shadow-md border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Tactical Meeting Tip
                  </div>
                  <p className="text-slate-200 leading-relaxed text-[11.5px]">
                    <strong>Never sign agreement on the spot if you feel pressured.</strong> Under federal IDEA guidelines, parents are equal team members and have the right to take proposed IEP documents home for 24-48 hours to review with family or an advocate.
                  </p>
                </div>
              </div>
            </div>

            <FooterDisclaimer
              stateCode={activeStudent?.state}
              onOpenStateRights={() => setActiveTab('state-rights')}
              onOpenTerms={() => setIsTermsOpen(true)}
              onOpenPrivacy={() => setIsPrivacyOpen(true)}
            />
          </main>
        )}

        {/* 3. STUDENTS MANAGEMENT VIEW */}
        {activeTab === 'students' && (
          <StudentManagement
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={(id) => {
              setSelectedStudentId(id);
              setActiveTab('dashboard');
            }}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onStartMeetingForStudent={(id) => {
              setSelectedStudentId(id);
              setActiveTab('wizard');
            }}
          />
        )}

        {/* 4. NEW MEETING WIZARD VIEW */}
        {activeTab === 'wizard' && activeStudent && (
          <NewMeetingWizard
            student={activeStudent}
            onCancel={() => setActiveTab('dashboard')}
            onPacketGenerated={handlePacketGenerated}
          />
        )}

        {/* 5. PACKET VIEWER / PRINT VIEW */}
        {activeTab === 'packet-viewer' && selectedPacket && (
          <PacketViewer
            packet={selectedPacket}
            onUpdatePacket={handleUpdatePacket}
            onOpenPricing={() => setIsPricingOpen(true)}
            onOpenStateRights={() => setActiveTab('state-rights')}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {/* 6. HISTORY VIEW */}
        {activeTab === 'history' && (
          <PacketHistory
            packets={packets}
            meetingLogs={meetingLogs}
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectPacket={(pkt) => {
              setSelectedPacket(pkt);
              setActiveTab('packet-viewer');
            }}
            onStartNewMeeting={() => setActiveTab('wizard')}
            onDeletePacket={handleDeletePacket}
          />
        )}

        {/* 7. STATE RIGHTS DATABASE VIEW */}
        {activeTab === 'state-rights' && (
          <StateRightsDatabase initialStateCode={activeStudent?.state || 'CA'} />
        )}
      </div>

      {/* ALL MODALS */}
      <PricingModal
        user={user}
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      <SettingsModal
        user={user}
        students={students}
        packets={packets}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateProfile={handleUpdateProfile}
        onOpenPricing={() => {
          setIsSettingsOpen(false);
          setIsPricingOpen(true);
        }}
        onRequestAccountDeletion={handleAccountDeletion}
      />

      <AuthModal
        user={user}
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={async (email, name, id) => {
          const updated: UserProfile = {
            ...user,
            id: id || user.id,
            email,
            name
          };
          // Immediately update user state in app component
          setUser(updated);
          await saveStoredUser(updated);

          // Explicit check to verify if the Firebase session token is available before calling loadUserData
          if (isFirebaseConfigured() && auth.currentUser) {
            try {
              const token = await auth.currentUser.getIdToken();
              if (token) {
                console.log('✅ [AUTH TOKEN VERIFIED] Session token active for user:', auth.currentUser.uid);
              }
              await loadUserData(auth.currentUser.uid);
            } catch (tokenErr) {
              console.warn('⚠️ [AUTH TOKEN CHECK] Could not retrieve session token:', tokenErr);
              await loadUserData(updated.id);
            }
          } else {
            await loadUserData(updated.id);
          }
        }}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      <AiAssistantModal
        student={activeStudent}
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onOpenStateRights={() => setActiveTab('state-rights')}
      />

      {user.role === 'admin' && (
        <button
          onClick={() => setIsAdminOpen(true)}
          className="fixed bottom-4 right-4 bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-full shadow-2xl border border-slate-700 z-30 cursor-pointer flex items-center justify-center transition-transform hover:scale-105"
          title="Admin Panel"
        >
          <BarChart3 className="w-5 h-5 text-amber-400" />
        </button>
      )}

      <AdminDashboardModal
        user={user}
        students={students}
        packets={packets}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Live Meeting Mode Overlay */}
      {isLiveMeetingOpen && activeStudent && (
        <LiveMeetingMode
          student={activeStudent}
          packet={packets.find((p) => p.studentId === activeStudent.id) || null}
          onClose={() => setIsLiveMeetingOpen(false)}
          onFinishMeeting={async (log) => {
            await saveStoredMeetingLog(log, user.id);
            const updatedLogs = await getStoredMeetingLogs(user.id);
            setMeetingLogs(updatedLogs);
            setIsLiveMeetingOpen(false);
            setActiveTab('history');
          }}
        />
      )}
    </div>
  );
}
