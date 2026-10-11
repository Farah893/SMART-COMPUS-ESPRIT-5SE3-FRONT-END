import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CapacityGauge } from "@/components/shared/CapacityGauge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { StatusPill } from "@/components/shared/StatusPill";
import { useAuth } from "@/auth/AuthContext";
import { useT } from "@/i18n";
import { useEnroll } from "../components/useEnroll";
import { useCourse } from "../hooks";
import { DAY_LABELS, type Session } from "../types";

export default function CourseDetailPage() {
  const t = useT();
  const { id = "" } = useParams();
  const { role } = useAuth();
  const query = useCourse(id);
  const { enroll, pendingId, alert } = useEnroll(query.refetch);

  const columns: Column<Session>[] = [
    { key: "day", header: t("academic.col.day"), cell: (s) => DAY_LABELS[s.day], sortValue: (s) => s.day },
    { key: "time", header: t("academic.col.time"), cell: (s) => `${s.start}–${s.end}` },
    { key: "kind", header: t("academic.col.type"), cell: (s) => t(`academic.kind.${s.kind}`) },
    { key: "room", header: t("academic.col.room"), cell: (s) => s.room },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3">
        <Link to="/academique">
          <ArrowLeft aria-hidden="true" />
          {t("academic.back")}
        </Link>
      </Button>
      {alert}
      <QueryBoundary query={query} moduleName={t("module.academic")} skeleton={<Skeleton className="h-72 w-full rounded-xl" />}>
        {(c) => (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0 space-y-6">
              <Card>
                <CardHeader className="items-start">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                      {c.code} · {c.department} · {c.semester}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight">{c.title}</h2>
                  </div>
                  {c.myEnrollment && <StatusPill status={c.myEnrollment} />}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{c.description}</p>
                </CardContent>
              </Card>
              <section aria-labelledby="sessions-title">
                <h2 id="sessions-title" className="mb-3 text-lg font-semibold">
                  {t("academic.detail.sessions")}
                </h2>
                <DataTable caption={t("academic.detail.sessions")} columns={columns} data={c.sessions} rowKey={(s) => s.id} pageSize={10} emptyTitle={t("academic.empty.sessions")} />
              </section>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("academic.detail.info")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">{t("academic.detail.teacher")}</dt>
                    <dd className="font-medium">{c.teacherName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("academic.detail.credits")}</dt>
                    <dd className="font-medium">{c.credits}</dd>
                  </div>
                </dl>
                <CapacityGauge used={c.enrolled} capacity={c.capacity} label={t("academic.course.seats")} />
                {role === "student" && (!c.myEnrollment || c.myEnrollment === "refused") && (
                  <Button className="w-full" disabled={pendingId === c.id} onClick={() => void enroll(c)}>
                    {c.enrolled >= c.capacity ? t("academic.enroll.full") : c.myEnrollment === "refused" ? t("academic.enroll.retry") : t("academic.enroll")}
                  </Button>
                )}
                {role === "student" && c.myEnrollment === "pending" && <EmptyState className="py-2" title={t("academic.enroll.pendingInfo")} />}
              </CardContent>
            </Card>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
