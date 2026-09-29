export type NoteStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type NoteKind = 'FILE' | 'LINK';
export type NoteCategory =
  | 'pdf'
  | 'doc'
  | 'slides'
  | 'sheet'
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'link'
  | 'other';
export type PreviewStatus = 'NONE' | 'PENDING' | 'READY' | 'FAILED';

export interface ClassRef {
  id: string;
  name: string;
  students: number;
}

export interface TeacherNote {
  id: string;
  title: string;
  description?: string;
  topic?: string;
  courseId: string;
  courseName: string;
  teacherName: string;
  classes: ClassRef[];
  termId?: string;
  termName?: string;
  kind: NoteKind;
  category: NoteCategory;
  fileName?: string;
  contentType?: string;
  sizeBytes?: number;
  version?: number;
  fileUpdatedAt?: string;
  previewStatus?: PreviewStatus;
  linkUrl?: string;
  status: NoteStatus;
  publishAt?: string;
  publishedAt?: string;
  archivedAt?: string;
  allowDownload: boolean;
  pinned: boolean;
  readBy?: string;
  lastNudgedAt?: string;
  nudgeCount: number;
  audience: number;
  opened: number;
  completed: number;
  saved: number;
  views: number;
  downloads: number;
  reach: number;
  lastActivityAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeachingCourse {
  id: string;
  name: string;
  classes: ClassRef[];
}

export interface TeachingTerm {
  id: string;
  name: string;
  academicYear?: string;
  current: boolean;
}

export interface TeachingContext {
  teacherName: string;
  courses: TeachingCourse[];
  terms: TeachingTerm[];
  currentTermId?: string;
  maxFileMb: number;
  allowedTypes: string;
}

export interface Reader {
  studentId: string;
  fullName: string;
  email?: string;
  className?: string;
  inAudience: boolean;
  opened: boolean;
  firstViewedAt?: string;
  lastViewedAt?: string;
  views: number;
  downloads: number;
  lastDownloadedAt?: string;
  completed: boolean;
  completedAt?: string;
  saved: boolean;
}

export interface Activity {
  noteId: string;
  noteTitle: string;
  courseName: string;
  studentId: string;
  studentName: string;
  className?: string;
  type: 'VIEW' | 'DOWNLOAD' | 'COMPLETE';
  at: string;
}

export interface DailyPoint {
  date: string;
  views: number;
  downloads: number;
  completions: number;
}

export interface NoteDetail {
  note: TeacherNote;
  readers: Reader[];
  daily: DailyPoint[];
  recent: Activity[];
}

export interface TeachingStats {
  kpis: {
    total: number;
    published: number;
    scheduled: number;
    drafts: number;
    archived: number;
    reach: number;
    completion: number;
    views: number;
    downloads: number;
    viewsThisWeek: number;
    storageBytes: number;
    unopenedStudents: number;
  };
  daily: DailyPoint[];
  byCourse: { course: string; notes: number; reach: number; completion: number; views: number }[];
  byType: Record<string, number>;
  attention: TeacherNote[];
  top: TeacherNote[];
  recent: Activity[];
}

export interface StudentNote {
  id: string;
  title: string;
  description?: string;
  topic?: string;
  courseId: string;
  courseName: string;
  teacherName: string;
  kind: NoteKind;
  category: NoteCategory;
  fileName?: string;
  contentType?: string;
  sizeBytes?: number;
  version?: number;
  previewStatus?: PreviewStatus;
  linkUrl?: string;
  publishedAt?: string;
  fileUpdatedAt?: string;
  allowDownload: boolean;
  pinned: boolean;
  readBy?: string;
  readByPassed: boolean;
  viewed: boolean;
  firstViewedAt?: string;
  lastViewedAt?: string;
  views: number;
  downloads: number;
  completed: boolean;
  completedAt?: string;
  saved: boolean;
  isNew: boolean;
  updatedSinceView: boolean;
  nudged: boolean;
  lastNudgedAt?: string;
}

export interface StudentCourse {
  courseId: string;
  courseName: string;
  teacherName?: string;
  total: number;
  unread: number;
  completed: number;
}

export interface MyNotes {
  className?: string;
  courses: StudentCourse[];
  notes: StudentNote[];
  stats: {
    total: number;
    unread: number;
    completed: number;
    saved: number;
    toStudy: number;
    dueSoon: number;
  };
}

/** The fields the previewer needs — shared by teacher and student note shapes. */
export type PreviewableNote = Pick<
  TeacherNote,
  | 'id'
  | 'title'
  | 'category'
  | 'kind'
  | 'fileName'
  | 'previewStatus'
  | 'linkUrl'
  | 'allowDownload'
  | 'sizeBytes'
>;
