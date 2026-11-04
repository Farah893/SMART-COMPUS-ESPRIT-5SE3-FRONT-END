import { CalendarX } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { QueryBoundary } from "@/shared/components/common/QueryBoundary";
import { useAuth } from "@/shared/auth/AuthContext";
import { useT } from "@/shared/i18n";
import { TimetableGrid } from "../components/TimetableGrid";
import { useTimetable } from "../hooks";

const LEGEND = [
  { kind: "CM", cls: "bg-blue-50 border-navy/30" },
  { kind: "TD", cls: "bg-amber-50 border-amber-400/60" },
  { kind: "TP", cls: "bg-green-50 border-green-600/30" },
] as const;

export default function TimetablePage() {
  const t = useT();
  const { role } = useAuth();
  const query = useTimetable();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t(`academic.timetable.scope.${role}`)}</p>
        <ul className="flex gap-3 text-xs" aria-label={t("academic.timetable.legend")}>
          {LEGEND.map((l) => (
            <li key={l.kind} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`size-3 rounded-sm border ${l.cls}`} />
              {t(`academic.kind.${l.kind}`)}
            </li>
          ))}
        </ul>
      </div>
      <QueryBoundary query={query} moduleName={t("module.academic")} skeleton={<Skeleton className="h-96 w-full rounded-xl" />}>
        {(entries) =>
          entries.length === 0 ? (
            <Card>
              <EmptyState icon={CalendarX} title={t("academic.empty.timetable")} description={t("academic.empty.timetableHint")} />
            </Card>
          ) : (
            <Card className="p-5">
              <TimetableGrid entries={entries} />
            </Card>
          )
        }
      </QueryBoundary>
    </div>
  );
}
