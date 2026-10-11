import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { Role } from "@/auth/roles";
import { normalize } from "@/lib/format";
import { assertAvailable } from "../../_shared/serviceHealth";
import { publishDomainEvent } from "../../_shared/domainEvents";
import { db } from "../mocks";
import type {
  Course, CourseFilters, CourseGrades, CourseView, Enrollment, EnrollmentStatus, GradeSummary, Session, TimetableEntry,
} from "../types";

/**
 * Stubs de l'academic-service (via l'API Gateway). En production l'identité vient du JWT ;
 * en mock elle est passée explicitement (`Viewer`).
 * Erreurs : 404 introuvable · 403 interdit · 409 conflit (horaire, cours complet, doublon).
 */
export interface Viewer {
  id: string;
  name: string;
  role: Role;
}

const SERVICE = "academic-service";
const svc = () => assertAvailable("academic");
const clone = <T>(x: T): T => structuredClone(x);

function courseById(id: string) {
  const c = db.courses.find((x) => x.id === id);
  if (!c) throw new ApiError(404, "Cours introuvable");
  return c;
}

const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const overlaps = (a: Session, b: Session) => a.day === b.day && toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);

const enrollmentFor = (courseId: string, studentId: string) => db.enrollments.find((e) => e.courseId === courseId && e.studentId === studentId);

const withState = (c: Course, viewerId: string): CourseView => ({ ...c, myEnrollment: enrollmentFor(c.id, viewerId)?.status });

// ---------- Cours ----------

/** GET /courses?q=&department=&teacherId= */
export const listCourses = (filters: CourseFilters, viewer: Viewer, signal?: AbortSignal) =>
  api.get<CourseView[]>("/courses", {
    signal,
    mock: () => {
      svc();
      const q = normalize(filters.q?.trim() ?? "");
      return clone(
        db.courses
          .filter(
            (c) =>
              (!filters.department || c.department === filters.department) &&
              (!filters.teacherId || c.teacherId === filters.teacherId) &&
              (!q || normalize(`${c.code} ${c.title} ${c.teacherName}`).includes(q)),
          )
          .map((c) => withState(c, viewer.id)),
      );
    },
  });

/** GET /courses/{id} */
export const getCourse = (id: string, viewer: Viewer, signal?: AbortSignal) =>
  api.get<CourseView>(`/courses/${id}`, {
    signal,
    mock: () => {
      svc();
      return clone(withState(courseById(id), viewer.id));
    },
  });

// ---------- Inscriptions ----------

/** POST /enrollments — 409 si doublon, cours complet ou chevauchement d'horaire avec un autre cours suivi. */
export const enroll = (courseId: string, viewer: Viewer) =>
  api.post<Enrollment>("/enrollments", {
    body: { courseId },
    mock: () => {
      svc();
      const course = courseById(courseId);
      const existing = enrollmentFor(courseId, viewer.id);
      if (existing && existing.status !== "refused") {
        throw new ApiError(409, "Vous avez déjà une demande pour ce cours", { code: "ALREADY_ENROLLED", conflicts: [] });
      }
      if (course.enrolled >= course.capacity) {
        throw new ApiError(409, "Ce cours est complet", { code: "COURSE_FULL", conflicts: [`${course.code} — ${course.enrolled}/${course.capacity} places occupées`] });
      }
      const mine = db.enrollments.filter((e) => e.studentId === viewer.id && e.status !== "refused");
      const conflicts: string[] = [];
      for (const e of mine) {
        for (const other of courseById(e.courseId).sessions) {
          for (const mineSession of course.sessions) {
            if (overlaps(mineSession, other)) {
              conflicts.push(`${e.courseCode} — ${other.kind} ${other.start}–${other.end} (${other.room}) chevauche ${course.code} ${mineSession.kind} ${mineSession.start}–${mineSession.end}`);
            }
          }
        }
      }
      if (conflicts.length) throw new ApiError(409, "Conflit d'horaire avec vos cours", { code: "SCHEDULE_CONFLICT", conflicts });

      if (existing) db.enrollments.splice(db.enrollments.indexOf(existing), 1); // nouvelle demande après un refus
      const created: Enrollment = {
        id: `e-${++db.seq}`, courseId, courseCode: course.code, courseTitle: course.title,
        studentId: viewer.id, studentName: viewer.name, status: "pending", requestedAt: db.now(),
      };
      db.enrollments.unshift(created);
      return clone(created);
    },
  });

/** GET /enrollments — l'étudiant voit les siennes, l'administrateur toutes. */
export const listEnrollments = (viewer: Viewer, signal?: AbortSignal) =>
  api.get<Enrollment[]>("/enrollments", {
    signal,
    mock: () => {
      svc();
      if (viewer.role === "teacher") throw new ApiError(403, "Accès interdit");
      return clone(db.enrollments.filter((e) => viewer.role === "admin" || e.studentId === viewer.id).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)));
    },
  });

/** PUT /enrollments/{id}/status (administrateur) — valider publie InscriptionValidée. */
export const decideEnrollment = (id: string, status: Exclude<EnrollmentStatus, "pending">, viewer: Viewer) =>
  api.put<Enrollment>(`/enrollments/${id}/status`, {
    body: { status },
    mock: () => {
      svc();
      if (viewer.role !== "admin") throw new ApiError(403, "Réservé à l'administrateur");
      const e = db.enrollments.find((x) => x.id === id);
      if (!e) throw new ApiError(404, "Inscription introuvable");
      if (e.status !== "pending") throw new ApiError(409, "Cette demande a déjà été traitée", { code: "ALREADY_DECIDED", conflicts: [] });
      if (status === "validated") {
        const c = courseById(e.courseId);
        if (c.enrolled >= c.capacity) throw new ApiError(409, "Ce cours est complet", { code: "COURSE_FULL", conflicts: [`${c.code} — ${c.enrolled}/${c.capacity} places occupées`] });
        c.enrolled += 1;
      }
      e.status = status;
      e.decidedAt = db.now();
      if (status === "validated") publishDomainEvent(SERVICE, "InscriptionValidée", `${e.studentName} · ${e.courseCode}`);
      return clone(e);
    },
  });

// ---------- Emploi du temps ----------

/** GET /timetable — étudiant : cours validés · enseignant : ses cours · administrateur : tous. */
export const getTimetable = (viewer: Viewer, signal?: AbortSignal) =>
  api.get<TimetableEntry[]>("/timetable", {
    signal,
    mock: () => {
      svc();
      const visible = db.courses.filter((c) => {
        if (viewer.role === "admin") return true;
        if (viewer.role === "teacher") return c.teacherId === viewer.id;
        return enrollmentFor(c.id, viewer.id)?.status === "validated";
      });
      return clone(
        visible
          .flatMap((c) => c.sessions.map((s) => ({ ...s, courseCode: c.code, courseTitle: c.title, teacherName: c.teacherName })))
          .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start)),
      );
    },
  });

// ---------- Notes ----------

const gradeKey = (courseId: string, studentId: string) => `${courseId}:${studentId}`;

/** GET /grades/me — notes publiées de l'étudiant, moyenne pondérée par les crédits. */
export const getMyGrades = (viewer: Viewer, signal?: AbortSignal) =>
  api.get<GradeSummary>("/grades/me", {
    signal,
    mock: () => {
      svc();
      const items = db.enrollments
        .filter((e) => e.studentId === viewer.id && e.status === "validated")
        .map((e) => {
          const c = courseById(e.courseId);
          const g = db.grades.get(gradeKey(c.id, viewer.id));
          return { courseId: c.id, code: c.code, title: c.title, credits: c.credits, teacherName: c.teacherName, value: g?.published ? g.value : null };
        });
      const graded = items.filter((i) => i.value !== null);
      const weight = graded.reduce((n, i) => n + i.credits, 0);
      const average = weight ? graded.reduce((n, i) => n + i.value! * i.credits, 0) / weight : null;
      return {
        items,
        average,
        creditsEarned: graded.filter((i) => i.value! >= 10).reduce((n, i) => n + i.credits, 0),
        creditsTotal: items.reduce((n, i) => n + i.credits, 0),
      };
    },
  });

/** GET /courses/{id}/grades (enseignant du cours ou administrateur) */
export const getCourseGrades = (courseId: string, viewer: Viewer, signal?: AbortSignal) =>
  api.get<CourseGrades>(`/courses/${courseId}/grades`, {
    signal,
    mock: () => {
      svc();
      const c = courseById(courseId);
      if (viewer.role === "student" || (viewer.role === "teacher" && c.teacherId !== viewer.id)) throw new ApiError(403, "Accès interdit à ce cours");
      const entries = db.enrollments
        .filter((e) => e.courseId === courseId && e.status === "validated")
        .map((e) => {
          const g = db.grades.get(gradeKey(courseId, e.studentId));
          return { studentId: e.studentId, studentName: e.studentName, value: g?.value ?? null, published: g?.published ?? false };
        })
        .sort((a, b) => a.studentName.localeCompare(b.studentName, "fr"));
      return clone({ course: { id: c.id, code: c.code, title: c.title, credits: c.credits }, entries });
    },
  });

/** PUT /courses/{id}/grades — enregistre les notes ; `publish` les rend visibles aux étudiants (NotePubliée). */
export const saveGrades = (courseId: string, values: Record<string, number | null>, publish: boolean, viewer: Viewer) =>
  api.put<void>(`/courses/${courseId}/grades`, {
    body: { values, publish },
    mock: () => {
      svc();
      const c = courseById(courseId);
      if (viewer.role !== "admin" && c.teacherId !== viewer.id) throw new ApiError(403, "Accès interdit à ce cours");
      let count = 0;
      for (const [studentId, value] of Object.entries(values)) {
        if (value !== null && (value < 0 || value > 20)) throw new ApiError(422, "La note doit être comprise entre 0 et 20");
        const prev = db.grades.get(gradeKey(courseId, studentId));
        db.grades.set(gradeKey(courseId, studentId), { value, published: publish ? value !== null : (prev?.published ?? false) && value === prev?.value });
        if (publish && value !== null) count++;
      }
      if (publish) publishDomainEvent(SERVICE, "NotePubliée", `${c.code} · ${count} note(s) publiée(s)`);
    },
  });
