import { Building } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { useAuth } from "@/auth/AuthContext";
import { useT } from "@/i18n";
import { OccupancyChart } from "../components/OccupancyChart";
import { ResidenceCard } from "../components/ResidenceCard";
import { useResidences } from "../hooks";

export default function ResidencesPage() {
  const t = useT();
  const { role } = useAuth();
  const query = useResidences();
  return (
    <QueryBoundary
      query={query}
      moduleName={t("module.housing")}
      skeleton={
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      }
    >
      {(residences) =>
        residences.length === 0 ? (
          <Card>
            <EmptyState icon={Building} title={t("housing.residences.empty")} />
          </Card>
        ) : (
          <div className="space-y-6">
            {role === "admin" && <OccupancyChart residences={residences} />}
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {t("housing.residences.count", { count: residences.length })}
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {residences.map((r) => (
                <ResidenceCard key={r.id} residence={r} canRequest={role === "student"} />
              ))}
            </div>
          </div>
        )
      }
    </QueryBoundary>
  );
}
