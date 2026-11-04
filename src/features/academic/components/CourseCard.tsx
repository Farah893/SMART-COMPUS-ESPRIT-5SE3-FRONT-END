import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { CapacityGauge } from "@/shared/components/common/CapacityGauge";
import { CatalogRow } from "@/shared/components/common/CatalogRow";
import { StatusPill } from "@/shared/components/common/StatusPill";
import { useT } from "@/shared/i18n";
import type { CourseView } from "../types";

interface CourseCardProps {
  course: CourseView;
  /** Affiche le bouton d'inscription (étudiant). */
  canEnroll?: boolean;
  enrolling?: boolean;
  onEnroll?: (course: CourseView) => void;
  mine?: boolean;
}

/** Ligne du catalogue des cours : intitulé, enseignant, crédits, remplissage et état d'inscription. */
export function CourseCard({ course, canEnroll, enrolling, onEnroll, mine }: CourseCardProps) {
  const t = useT();
  const full = course.enrolled >= course.capacity;
  const state = course.myEnrollment;

  return (
    <CatalogRow
      title={
        <Link to={`/academique/cours/${course.id}`} className="rounded hover:underline">
          {course.title}
        </Link>
      }
      badge={
        <>
          {mine && <span className="text-sm font-semibold text-primary">{t("academic.course.mine")}</span>}
          {state && <StatusPill status={state} />}
        </>
      }
      meta={[
        course.code,
        course.department,
        course.teacherName,
        t("academic.course.credits", { credits: course.credits }),
        course.semester,
        t("academic.course.sessions", { count: course.sessions.length }),
      ]}
      gauge={<CapacityGauge used={course.enrolled} capacity={course.capacity} label={t("academic.course.seats")} />}
      actions={
        <>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/academique/cours/${course.id}`}>{t("academic.course.details")}</Link>
          </Button>
          {canEnroll && (!state || state === "refused") && (
            <Button
              size="sm"
              disabled={enrolling}
              onClick={() => onEnroll?.(course)}
              aria-label={`${t("academic.enroll")} — ${course.code}`}
            >
              {full ? t("academic.enroll.full") : state === "refused" ? t("academic.enroll.retry") : t("academic.enroll")}
            </Button>
          )}
        </>
      }
    />
  );
}
