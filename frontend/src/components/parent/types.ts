// Mirrors rw.rca.mis.service.ParentViews on the backend. Null fields are omitted by the API.

export type Released = 'NONE' | 'CAT' | 'EXAM';

export interface TermInfo {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  released: Released;
  current: boolean;
}

export interface Score {
  marks: number;
  weight: number;
  percentage: number;
  status: 'PASS' | 'FAIL';
  comment?: string;
}

export interface CourseLine {
  courseId: string;
  courseName: string;
  credits?: string;
  cat?: Score;
  exam?: Score;
  secondSitting?: Score;
  obtained?: number;
  max?: number;
  percentage?: number;
  grade?: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  teacherName?: string;
}

export interface DisciplineTerm {
  term: TermInfo;
  max: number;
  deducted: number;
  score: number;
  percentage: number;
  pass: boolean;
  cases: number;
}

export interface TermResult {
  term: TermInfo;
  className?: string;
  courses: CourseLine[];
  obtained?: number;
  max?: number;
  percentage?: number;
  grade?: string;
  position?: number;
  classSize?: number;
  coursesPassed: number;
  coursesFailed: number;
  discipline?: DisciplineTerm;
}

export interface DeductionView {
  id: string;
  date?: string;
  termName?: string;
  category?: string;
  reason?: string;
  marks?: number;
  status?: string;
  recordedBy?: string;
}

export interface DisciplineView {
  passMark: number;
  terms: DisciplineTerm[];
  deductions: DeductionView[];
}

export interface ChildSummary {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  gender?: string;
  studentStatus?: string;
  classId?: string;
  className?: string;
  relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN';
  primaryContact: boolean;
  currentTerm?: TermInfo;
  resultsTerm?: TermInfo;
  currentPercentage?: number;
  currentPosition?: number;
  classSize?: number;
  disciplineScore?: number;
  disciplineMax?: number;
  disciplinePass?: boolean;
  pendingAppeals: number;
  openConcerns: number;
  alerts: string[];
}

export interface NewsView {
  id: string;
  title?: string;
  body?: string;
  createdAt?: string;
}

export interface Overview {
  child: ChildSummary;
  academicYear?: string;
  terms: TermResult[];
  recentDeductions: DeductionView[];
  news: NewsView[];
}

export interface ReportCardView {
  child: ChildSummary;
  academicYearId: string;
  academicYear: string;
  terms: TermResult[];
  yearPercentage?: number;
  yearGrade?: string;
  decision: 'PROMOTED' | 'SITTING' | 'REPEATING' | 'IN_PROGRESS';
  complete: boolean;
  reportCardToken?: string;
}

export interface CommentView {
  author?: string;
  authorRole?: string;
  comment?: string;
  createdAt?: string;
}

export interface AppealView {
  id: string;
  kind?: string;
  category?: string;
  status?: string;
  message?: string;
  courseName?: string;
  teacherName?: string;
  termName?: string;
  createdAt?: string;
  comments: CommentView[];
}

export interface Contact {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  courses: string[];
}

export interface ClassContacts {
  className?: string;
  classTeacher?: Contact;
  courseTeachers: Contact[];
  schoolContacts: Contact[];
}

export interface AcademicYearOption {
  id: string;
  name: string;
  status?: string;
}

export interface PersonLite {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  roleName?: string;
}

export interface ParentConcern {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  parent: PersonLite & { phoneNumber?: string };
  student?: PersonLite & { currentClazz?: { className?: string } };
  category: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  response?: string;
  respondedBy?: PersonLite;
  respondedAt?: string;
}

export interface ParentChildLink {
  id: string;
  fullName: string;
  email?: string;
  className?: string;
  relationship: string;
  primaryContact: boolean;
}

export interface ParentAccount {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  nationalId?: string;
  status?: string;
  createdAt?: string;
  children: ParentChildLink[];
  reportCardToken?: string;
}
