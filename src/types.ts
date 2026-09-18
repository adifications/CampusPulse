export type CollegeDeptCode = 'CS' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'MCA' | 'MTECH';

export interface DepartmentInfo {
  code: CollegeDeptCode;
  shortName: string;
  fullName: string;
  tagline: string;
}

export const COLLEGE_DEPARTMENTS: DepartmentInfo[] = [
  { code: 'CS', shortName: 'CS', fullName: 'Computer Science & Engineering', tagline: 'AI, Systems & Software' },
  { code: 'ECE', shortName: 'ECE', fullName: 'Electronics & Communication Engg', tagline: 'VLSI, IoT & Embedded' },
  { code: 'EEE', shortName: 'EEE', fullName: 'Electrical & Electronics Engg', tagline: 'Power, Machines & Renewable' },
  { code: 'MECH', shortName: 'MECH', fullName: 'Mechanical Engineering', tagline: 'Thermal, Design & Robotics' },
  { code: 'CIVIL', shortName: 'CIVIL', fullName: 'Civil Engineering', tagline: 'Structures, Geotech & Urban' },
  { code: 'MCA', shortName: 'MCA', fullName: 'Master of Computer Applications', tagline: 'Full-Stack & Cloud Systems' },
  { code: 'MTECH', shortName: 'MTECH', fullName: 'Master of Technology (M.Tech)', tagline: 'Advanced Research & Specializations' },
];

export type NoticeCategory =
  | 'Exams & Fees'
  | 'Academics & Classes'
  | 'Placements & Internships'
  | 'Hostel & Mess'
  | 'Scholarships & Aid'
  | 'Events & Clubs'
  | 'General Administration';

export type ImportanceLevel = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface ActionItem {
  text: string;
  deadline?: string;
  isUrgent?: boolean;
  feeAmount?: string;
  linkOrVenue?: string;
}

export interface DeadlineItem {
  date: string;
  time?: string;
  description: string;
  isStrictCutoff?: boolean;
  penaltyIfMissed?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  officialTitle: string;
  department: string;
  referenceNumber?: string;
  issueDate?: string;
  category: NoticeCategory;
  importance: ImportanceLevel;
  whyItMatters: string;
  oneLineTLDR: string;
  bulletPoints: string[];
  actionItems: ActionItem[];
  deadlines: DeadlineItem[];
  targetAudience: string[];
  relevantDepartments?: string[]; // e.g. ['ALL'], ['CSE', 'IT'], ['ECE'], ['MECH']
  feesAndFines?: {
    hasFee: boolean;
    amount?: string;
    lateFine?: string;
    paymentMode?: string;
  };
  contactPerson?: {
    name?: string;
    designation?: string;
    office?: string;
    emailOrPhone?: string;
  };
  noticePositionOnBoard?: {
    locationDescription: string;
    estimatedBoundingBox?: {
      ymin: number;
      xmin: number;
      ymax: number;
      xmax: number;
    };
  };
  originalSnippet?: string;
  addedAt?: number;
  expiresAt?: number;
  expiryNote?: string;
}

export interface NoticeBoardSummary {
  boardTitle: string;
  scanTimestamp: string;
  totalNoticesFound: number;
  criticalCount: number;
  highCount: number;
  notices: NoticeItem[];
  urgentBroadcastMessage: string;
  executiveSummary: string;
}

export interface UserProfile {
  name: string;
  department: string;
  year?: string;
  isHosteller?: boolean;
}

export interface DemoSample {
  id: string;
  name: string;
  description: string;
  badge: string;
  imageUrl?: string;
  simulatedData: NoticeBoardSummary;
}
