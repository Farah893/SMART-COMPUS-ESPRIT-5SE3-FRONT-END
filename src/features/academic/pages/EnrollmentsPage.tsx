import { useMemo, useState } from "react";
import { Check, ClipboardList, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { StatCard } from "@/components/shared/StatCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { isApiError } from "@/api/errors";
import { useAuth } from "@/auth/AuthContext";
import { useT } from "@/i18n";
import { formatDateTime } from "@/lib/format";
import { decideEnrollment } from "../api";
import { useEnrollments, useViewer } from "../hooks";
import type { Enrollment, EnrollmentStatus } from "../types";

type Decision = { enrollment: Enrollment; status: "validated" | "refused" };

/** Étudiant : suivi de ses demandes. Administrateur : file de validation (En attente → Validé / Refusé). */
export default function EnrollmentsPage() {
  const t = useT();
  const { role } = useAuth();
  const viewer = useViewer();
  const query = useEnrollments();
  const [status, setStatus] = useState<EnrollmentStatus | "">("");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [busy, setBusy] = useState(false);
  const isAdmin = role === "admin";

  async function confirm() {
    if (!decision) return;
    setBusy(true);
    try {
      await decideEnrollment(decision.enrollment.id, decision.status, viewer);
      toast.success(t(`academic.enrollments.done.${decision.status}`, { name: decision.enrollment.studentName, code: decision.enrollment.courseCode }));
      setDecision(null);
      query.refetch();
    } catch (e) {
      toast.error(isApiError(e) ? (e.isConflict ? `${e.message} — ${t("academic.enrollments.conflictHint")}` : e.message) : t("error.generic"));
      setDecision(null);
      query.refetch();
    } finally {
      setBusy(false);
    }
  }

  const columns = useMemo<Column<Enrollment>[]>(
    () => [
      ...(isAdmin ? [{ key: "student", header: t("academic.col.student"), cell: (e: Enrollment) => <span className="font-medium">{e.studentName}</span>, sortValue: (e: Enrollment) => e.studentName }] : []),
      {
        key: "course",
        header: t("academic.col.course"),
        sortValue: (e) => e.courseCode,
        cell: (e) => (
          <div>
            <p className="font-medium">{e.courseCode}</p>
            <p className="text-xs text-muted-foreground">{e.courseTitle}</p>
          </div>
        ),
      },
      { key: "date", header: t("academic.col.requested"), sortValue: (e) => e.requestedAt, cell: (e) => formatDateTime(e.requestedAt) },
      { key: "status", header: t("academic.col.status"), sortValue: (e) => e.status, cell: (e) => <StatusPill status={e.status} /> },
      ...(isAdmin
        ? [
            {
              key: "actions",
              header: t("users.col.actions"),
              cell: (e: Enrollment) =>
                e.status === "pending" ? (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" aria-label={`${t("academic.enrollments.validate")} — ${e.studentName}, ${e.courseCode}`} title={t("academic.enrollments.validate")} className="text-green-800 hover:bg-green-50" onClick={() => setDecision({ enrollment: e, status: "validated" })}>
                      <Check aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`${t("academic.enrollments.refuse")} — ${e.studentName}, ${e.courseCode}`} title={t("academic.enrollments.refuse")} className="text-red-700 hover:bg-red-50" onClick={() => setDecision({ enrollment: e, status: "refused" })}>
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">{e.decidedAt ? formatDateTime(e.decidedAt) : "—"}</span>
                ),
            },
          ]
        : []),
    ],
    [t, isAdmin],
  );

  return (
    <div className="space-y-6">
      <QueryBoundary query={query} moduleName={t("module.academic")}>
        {(all) => {
          const count = (s: EnrollmentStatus) => all.filter((e) => e.status === s).length;
          const rows = status ? all.filter((e) => e.status === status) : all;
          return (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label={t("status.pending")} value={count("pending")} icon={ClipboardList} tone="amber" />
                <StatCard label={t("status.validated")} value={count("validated")} icon={Check} tone="navy" />
                <StatCard label={t("status.refused")} value={count("refused")} icon={X} tone="red" />
              </div>
              <div className="w-full sm:w-56">
                <label htmlFor="enroll-status" className="sr-only">
                  {t("users.filter.status")}
                </label>
                <Select id="enroll-status" value={status} onChange={(e) => setStatus(e.target.value as EnrollmentStatus | "")}>
                  <option value="">{t("users.filter.allStatuses")}</option>
                  {(["pending", "validated", "refused"] as const).map((s) => (
                    <option key={s} value={s}>
                      {t(`status.${s}`)}
                    </option>
                  ))}
                </Select>
              </div>
              {all.length === 0 ? (
                <Card>
                  <EmptyState icon={ClipboardList} title={t("academic.empty.enrollments")} />
                </Card>
              ) : (
                <DataTable caption={t("academic.enrollments.caption")} columns={columns} data={rows} rowKey={(e) => e.id} emptyTitle={t("academic.empty.noMatch")} />
              )}
            </>
          );
        }}
      </QueryBoundary>

      <ConfirmDialog
        open={decision !== null}
        onOpenChange={(o) => !o && !busy && setDecision(null)}
        loading={busy}
        destructive={decision?.status === "refused"}
        title={decision ? t(`academic.enrollments.confirm.${decision.status}`, { name: decision.enrollment.studentName, code: decision.enrollment.courseCode }) : ""}
        description={decision ? t(`academic.enrollments.confirmBody.${decision.status}`) : undefined}
        confirmLabel={decision ? t(decision.status === "validated" ? "academic.enrollments.validate" : "academic.enrollments.refuse") : undefined}
        onConfirm={confirm}
      />
    </div>
  );
}
