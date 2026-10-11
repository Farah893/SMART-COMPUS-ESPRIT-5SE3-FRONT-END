import { useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { useAuth } from "@/auth/AuthContext";
import { useT } from "@/i18n";
import { CourseCard } from "../components/CourseCard";
import { useEnroll } from "../components/useEnroll";
import { useCourses } from "../hooks";
import { DEPARTMENTS } from "../mocks";

export default function CoursesPage() {
  const t = useT();
  const { user, role } = useAuth();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setQ(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const query = useCourses({ q, department });
  const { enroll, pendingId, alert } = useEnroll(query.refetch);
  const filtered = Boolean(q || department);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="course-search" className="sr-only">
            {t("academic.search.label")}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="course-search" type="search" className="pl-9" placeholder={t("academic.search.placeholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="w-full sm:w-56">
          <label htmlFor="course-dept" className="sr-only">
            {t("academic.filter.department")}
          </label>
          <Select id="course-dept" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">{t("academic.filter.allDepartments")}</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {alert}

      <QueryBoundary
        query={query}
        moduleName={t("module.academic")}
        skeleton={
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        }
      >
        {(courses) =>
          courses.length === 0 ? (
            <Card>
              <EmptyState icon={BookOpen} title={filtered ? t("academic.empty.noMatch") : t("academic.empty.courses")} />
            </Card>
          ) : (
            <>
              <p aria-live="polite" className="text-sm text-muted-foreground">
                {t("academic.courses.count", { count: courses.length })}
              </p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((c) => (
                  <CourseCard key={c.id} course={c} canEnroll={role === "student"} enrolling={pendingId === c.id} onEnroll={(x) => void enroll(x)} mine={c.teacherId === user.id} />
                ))}
              </div>
            </>
          )
        }
      </QueryBoundary>
    </div>
  );
}
