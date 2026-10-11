/** Jour de cours : 1 = lundi … 6 = samedi. */
export type Day = 1 | 2 | 3 | 4 | 5 | 6;
export type SessionKind = "CM" | "TD" | "TP";
export type Semester = "S1" | "S2";

export interface Session {
  id: string;
  courseId: string;
  day: Day;
  /** "HH:MM" */
  start: string;
  end: string;
  room: string;
  kind: SessionKind;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  department: string;
  semester: Semester;
  credits: number;
  teacherId: string;
  teacherName: string;
  capacity: number;
  enrolled: number;
  sessions: Session[];
}

/** Statuts alignés sur StatusPill : En attente / Validé / Refusé. */
export type EnrollmentStatus = "pending" | "validated" | "refused";

export interface Enrollment {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  status: EnrollmentStatus;
  requestedAt: string;
  decidedAt?: string;
}

/** Cours enrichi de l'état d'inscription de l'utilisateur courant (étudiant). */
export interface CourseView extends Course {
  myEnrollment?: EnrollmentStatus;
}

export interface CourseFilters {
  q?: string;
  department?: string;
  /** Restreint aux cours d'un enseignant. */
  teacherId?: string;
}

export interface TimetableEntry extends Session {
  courseCode: string;
  courseTitle: string;
  teacherName: string;
}

export interface GradeEntry {
  studentId: string;
  studentName: string;
  value: number | null;
  published: boolean;
}

export interface CourseGrades {
  course: Pick<Course, "id" | "code" | "title" | "credits">;
  entries: GradeEntry[];
}

export interface MyGrade {
  courseId: string;
  code: string;
  title: string;
  credits: number;
  teacherName: string;
  /** null = pas encore publiée. */
  value: number | null;
}

export interface GradeSummary {
  items: MyGrade[];
  /** Moyenne pondérée par les crédits, sur les notes publiées. */
  average: number | null;
  creditsEarned: number;
  creditsTotal: number;
}

export const DAY_LABELS: Record<Day, string> = { 1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi", 6: "Samedi" };
export const PASS_MARK = 10;
