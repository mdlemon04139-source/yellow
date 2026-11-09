export type AppTab = 'home' | 'calendar' | 'army' | 'radio' | 'admin' | 'profile';

export type UpazilaName =
  | 'Mymensingh Sadar'
  | 'Muktagachha'
  | 'Trishal'
  | 'Bhaluka'
  | 'Gafargaon'
  | 'Gauripur'
  | 'Ishwarganj'
  | 'Nandail'
  | 'Phulpur'
  | 'Haluaghat'
  | 'Dhobaura'
  | 'Tarakanda'
  | 'Fulbaria';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export type Gender = 'Male' | 'Female' | 'Other';

export type VBDRole =
  | 'General Member'
  | 'Committee Member'
  | 'Board Member'
  | 'Alumni';

export type BoardType = 'Upazila Board' | 'District Board';

export type AdminRole =
  | 'Super Admin'
  | 'District Coordinator'
  | 'Moderator'
  | 'General Member';

export const MYMENSINGH_UPAZILAS: UpazilaName[] = [
  'Mymensingh Sadar',
  'Muktagachha',
  'Fulbaria',
  'Trishal',
  'Bhaluka',
  'Gafargaon',
  'Gauripur',
  'Ishwarganj',
  'Nandail',
  'Phulpur',
  'Haluaghat',
  'Dhobaura',
  'Tarakanda',
];

export const UPAZILA_BENGALI_NAMES: Record<UpazilaName, string> = {
  'Mymensingh Sadar': 'ময়মনসিংহ সদর',
  'Muktagachha': 'মুক্তাগাছা',
  'Fulbaria': 'ফুলবাড়িয়া',
  'Trishal': 'ত্রিশাল',
  'Bhaluka': 'ভালুকা',
  'Gafargaon': 'গফরগাঁও',
  'Gauripur': 'গৌরীপুর',
  'Ishwarganj': 'ঈশ্বরগঞ্জ',
  'Nandail': 'নান্দাইল',
  'Phulpur': 'ফুলপুর',
  'Haluaghat': 'হালুয়াঘাট',
  'Dhobaura': 'ধোবাউড়া',
  'Tarakanda': 'তারাকান্দা',
};

export interface Volunteer {
  id: string;
  fullName: string;
  email: string;
  mobileNo: string;
  dateOfBirth: string;
  bloodGroup: BloodGroup;
  gender: Gender;
  roleInVBD: VBDRole;
  boardType?: BoardType;
  pendingRole?: VBDRole; // When Board Member is requested and awaiting admin approval
  pendingBoardType?: BoardType;
  adminRole?: AdminRole;
  upazila: UpazilaName;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  volunteerIdCode: string;
  joinDate: string;
  lastBloodDonationDate?: string; // Last donation date (YYYY-MM-DD)
  isBloodDonor?: boolean; // Whether volunteer is willing to donate blood and listed in Blood Bank
  totalVolunteerHours: number;
  projectsAttendedCount: number;
  volunteeringScore?: number;
  dhpPoints?: number;
  xp?: number; // Lifetime volunteer score (Sarajiban er score, never resets)
  dhp?: number; // 6-month seasonal score (resets twice a year)
  rankName?: string;
  level?: string;
  badges: { id: string; name: string; icon: string; color: string }[];
  status: 'active' | 'busy' | 'alumni';
  isOnline?: boolean;
  emergencyContact?: string;
  emergencyContactName?: string;
  profession?: string;
  isAdmin?: boolean;
  firebaseUid?: string;
}

export type EventType = 'Project' | 'Meeting';

export interface ProjectMeeting {
  id: string;
  title: string;
  bannerUrl: string;
  type: EventType;
  upazilaScope: 'District' | UpazilaName;
  description: string;
  startingTime: string;
  closingTime: string;
  venue?: string;
  location?: string;
  operationalYear?: number;
  leader: {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
    upazila?: string;
  };
  coLeader?: {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
    upazila?: string;
  };
  isTopProject: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'archived';
  attendeesCount: number;
  registeredVolunteerIds: string[];
  impactSummary?: {
    beneficiaries?: number;
    treesPlanted?: number;
    bloodBagsCollected?: number;
    familiesSupported?: number;
    keyHighlight?: string;
  };
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
}

export interface ActivityLog {
  id: string;
  volunteerId: string;
  volunteerName: string;
  volunteerAvatar: string;
  action: string;
  details: string;
  timestamp: string;
  upazila: UpazilaName | 'District';
  type: 'project' | 'meeting' | 'blood' | 'badge' | 'announcement';
  operationalYear?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'project_launch' | 'meeting' | 'emergency_blood' | 'blood_request' | 'announcement' | 'top_project' | 'role_approval_request' | 'xp_change';
  timestamp: string;
  createdAt?: string;
  read: boolean;
  upazila?: string;
  projectId?: string;
  volunteerId?: string;
  targetTab?: AppTab;
  operationalYear?: number;
}

export interface RadioPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface RadioBroadcast {
  id: string;
  title: string;
  speakerName: string;
  speakerRole: string;
  speakerAvatar: string;
  timestamp: string;
  category: 'District Alert' | 'Field Report' | 'Emergency SOS' | 'Meeting Briefing' | 'Official Announcement' | 'General';
  message: string;
  audioDurationSec?: number;
  isPlaying?: boolean;
  priority: 'normal' | 'urgent' | 'high';
  likesCount: number;
  likedByCurrentUser?: boolean;
  // Message vs Poll
  contentType?: 'message' | 'poll';
  pollOptions?: RadioPollOption[];
  pollVoters?: Record<string, string>; // volunteerId -> optionId
  reactions?: Record<string, number>; // emoji -> count, e.g. { '👍': 5, '❤️': 3, '⚡': 8, '🔥': 2 }
  userReactions?: Record<string, string>; // volunteerId -> emoji
}

export interface NeedAssessment {
  id: string;
  title: string;
  description: string;
  category: 'Community Need' | 'Equipment' | 'Medical' | 'Education' | 'Disaster Relief' | 'General';
  upazila: UpazilaName | 'District';
  createdBy: {
    id: string;
    name: string;
    avatarUrl?: string;
    role?: string;
    upazila?: string;
  };
  createdAt: string;
  voters: string[]; // volunteer IDs
  votesCount: number;
  status: 'open' | 'fulfilled';
  fulfilledAt?: string;
  fulfilledBy?: {
    id: string;
    name: string;
  };
  adminNote?: string;
}

export interface BoardPhoto {
  id: string; // e.g. 'District' or specific upazila name
  scope: UpazilaName | 'District';
  photoUrl: string;
  title: string;
  caption?: string;
  updatedAt: string;
  updatedBy?: string;
}

