export type MeetingType =
  | 'IEP_initial'
  | 'IEP_annual'
  | 'IEP_reeval'
  | '504_initial'
  | '504_review'
  | 'manifestation_determination'
  | 'triennial_review'
  | 'other';

export type PlanTier = 'free_user' | 'subscriber' | 'advocate';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  planTier: PlanTier;
  lemonsqueezyCustomerId?: string;
  customerPortalUrl?: string;
  subscriptionStatus?: string;
  subscriptionRenewsAt?: string;
  role?: 'user' | 'admin';
  generationsCount: number;
  maxFreeGenerations: number;
  lastGenerationDate?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  name: string; // e.g. "Maya S." or full name
  grade: string; // e.g. "4th Grade"
  state: string; // e.g. "CA"
  schoolDistrict: string; // e.g. "Oakland Unified School District"
  disabilityCategory?: string; // e.g. "Autism", "ADHD / OHI", "Specific Learning Disability (Dyslexia)", "Speech/Language", "Other"
  notes?: string;
  createdAt: string;
}

export interface MeetingNoticeData {
  meetingDate: string;
  meetingTime?: string;
  location?: string;
  proposedAttendees: string[];
  purposeText?: string;
  detectedAcronyms: Array<{ term: string; definition: string }>;
  rawNoticeText: string;
  noticeFileName?: string;
}

export interface IntakeResponses {
  topWorries: string;
  currentServices: string;
  recentChanges: string;
  desiredOutcomes: string;
  attendingWith: string; // e.g. "Spouse", "Advocate", "Private Therapist", "Alone"
  childStrengths: string;
  requestedEvaluations?: string;
}

export interface TopPriority {
  rank: number;
  title: string;
  rationale: string;
  tacticalTip: string;
}

export interface KeyQuestion {
  id: string;
  question: string;
  goal: string;
  whoToAsk: string; // e.g. "Speech Pathologist", "Special Ed Teacher", "General Ed Teacher"
}

export interface JargonItem {
  term: string;
  plainEnglish: string;
  parentTip: string;
}

export interface RightRemindItem {
  title: string;
  detail: string;
}

export interface WhatToBringItem {
  id: string;
  item: string;
  category: 'Documents' | 'Notes' | 'Personal' | 'Support';
  essential: boolean;
  checked?: boolean;
}

export interface DisagreementStep {
  stepNumber: number;
  actionTitle: string;
  description: string;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate?: string;
  completed?: boolean;
}

export interface MeetingDecision {
  id: string;
  topic: string;
  decision: string;
  agreed: boolean;
}

export interface MeetingLog {
  id: string;
  studentId: string;
  packetId?: string;
  meetingDate: string;
  meetingType: MeetingType;
  liveNotes: string;
  decisions: MeetingDecision[];
  actionItems: ActionItem[];
  finishedAt?: string;
  status: 'in_progress' | 'completed';
  createdAt: string;
}

export interface PacketContent {
  studentHeader: {
    studentName: string;
    grade: string;
    state: string;
    schoolDistrict: string;
    meetingType: MeetingType;
    meetingDate: string;
    disabilityCategory?: string;
  };
  childOverview?: {
    strengths: string;
    concerns: string;
    currentSupport: string;
    goalsToDiscuss: string;
  };
  topPriorities: TopPriority[];
  keyQuestions: KeyQuestion[];
  jargonDecoder: JargonItem[];
  rightsAtAGlance: RightRemindItem[];
  whatToBringChecklist: WhatToBringItem[];
  disagreementStrategy: DisagreementStep[];
  actionItems?: ActionItem[];
  customParentNotes?: string;
  legalDisclaimer: string;
}

export interface MeetingPacket {
  id: string;
  studentId: string;
  meetingType: MeetingType;
  meetingDate: string;
  version: number;
  status: 'draft' | 'final';
  content: PacketContent;
  noticeData?: MeetingNoticeData;
  intakeResponses?: IntakeResponses;
  generatedAt: string;
  isWatermarked: boolean;
}

export interface StatePTICenter {
  stateCode: string;
  stateName: string;
  ptiName: string;
  website: string;
  phone: string;
  email?: string;
  notes: string;
  lastVerified: string | null;
}
