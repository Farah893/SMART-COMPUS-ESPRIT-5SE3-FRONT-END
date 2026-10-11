import { Suspense } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import type { Role } from "@/auth/roles";
import { useAuth } from "@/auth/AuthContext";
import { ForbiddenView, NotFoundView } from "@/components/shared/ErrorViews";
import { PageHeader } from "@/components/shared/PageHeader";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import CoursesPage from "./CoursesPage";
import CourseDetailPage from "./CourseDetailPage";
import EnrollmentsPage from "./EnrollmentsPage";
import GradesPage from "./GradesPage";
import TimetablePage from "./TimetablePage";

const TABS: { to: string; key: string; end?: boolean; roles: readonly Role[] }[] = [
  { to: "/academique", key: "academic.tab.courses", end: true, roles: ["student", "teacher", "admin"] },
  { to: "/academique/emploi-du-temps", key: "academic.tab.timetable", roles: ["student", "teacher", "admin"] },
  { to: "/academique/notes", key: "academic.tab.grades", roles: ["student", "teacher", "admin"] },
  { to: "/academique/inscriptions", key: "academic.tab.enrollments", roles: ["student", "admin"] },
];

const tab = ({ isActive }: { isActive: boolean }) =>
  cn("whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium", isActive ? "border-navy text-navy" : "border-transparent text-slate-600 hover:text-foreground");

/** Module Académique : catalogue, emploi du temps, notes, inscriptions (onglets selon le rôle). */
export default function AcademicModule() {
  const t = useT();
  const { role } = useAuth();
  const allowed = (roles: readonly Role[]) => roles.includes(role);
  return (
    <>
      <PageHeader title={t("module.academic")} description={t("academic.module.description")} />
      <nav aria-label={t("academic.module.nav")} className="mb-6 flex overflow-x-auto border-b">
        {TABS.filter((x) => allowed(x.roles)).map((x) => (
          <NavLink key={x.to} to={x.to} end={x.end} className={tab}>
            {t(x.key)}
          </NavLink>
        ))}
      </nav>
      <Suspense fallback={null}>
        <Routes>
          <Route index element={<CoursesPage />} />
          <Route path="cours/:id" element={<CourseDetailPage />} />
          <Route path="emploi-du-temps" element={<TimetablePage />} />
          <Route path="notes" element={<GradesPage />} />
          <Route path="inscriptions" element={allowed(["student", "admin"]) ? <EnrollmentsPage /> : <ForbiddenView />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </Suspense>
    </>
  );
}
