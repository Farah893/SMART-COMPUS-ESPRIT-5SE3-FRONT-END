import { Link } from "react-router-dom";
import { Clock, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CapacityGauge } from "@/components/shared/CapacityGauge";
import { StatusPill } from "@/components/shared/StatusPill";
import { useT } from "@/i18n";
import type { CourseView } from "../types";

interface CourseCardProps {
  course: CourseView;
  /** Affiche le bouton d'inscription (étudiant). */
  canEnroll?: boolean;
  enrolling?: boolean;
  onEnroll?: (course: CourseView) => void;
  mine?: boolean;
}

/** Fiche de cours : code, intitulé, enseignant, crédits, remplissage et état d'inscription. */
export function CourseCard({ course, canEnroll, enrolling, onEnroll, mine }: CourseCardProps) {
  const t = useT();
  const full = course.enrolled >= course.capacity;
  const state = course.myEnrollment;
  const hours = course.sessions.length;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">
            {course.code} · {course.department}
          </p>
          <h3 className="mt-0.5 text-base font-semibold leading-snug">
            <Link to={`/academique/cours/${course.id}`} className="rounded hover:underline">
              {course.title}
            </Link>
          </h3>
        </div>
        {state && <StatusPill status={state} />}
      </div>

      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <User className="size-4 shrink-0" aria-hidden="true" />
          {course.teacherName}
          {mine && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">{t("academic.course.mine")}</span>}
        </li>
        <li className="flex items-center gap-2">
          <GraduationCap className="size-4 shrink-0" aria-hidden="true" />
          {t("academic.course.credits", { credits: course.credits })} · {course.semester}
        </li>
        <li className="flex items-center gap-2">
          <Clock className="size-4 shrink-0" aria-hidden="true" />
          {t("academic.course.sessions", { count: hours })}
        </li>
      </ul>

      <CapacityGauge used={course.enrolled} capacity={course.capacity} label={t("academic.course.seats")} />

      <div className="mt-auto flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/academique/cours/${course.id}`}>{t("academic.course.details")}</Link>
        </Button>
        {canEnroll && (!state || state === "refused") && (
          <Button size="sm" disabled={enrolling} onClick={() => onEnroll?.(course)} aria-label={`${t("academic.enroll")} — ${course.code}`}>
            {full ? t("academic.enroll.full") : state === "refused" ? t("academic.enroll.retry") : t("academic.enroll")}
          </Button>
        )}
      </div>
    </Card>
  );
}
