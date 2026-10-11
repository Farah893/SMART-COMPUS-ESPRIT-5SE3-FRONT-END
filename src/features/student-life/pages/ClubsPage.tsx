import { useEffect, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { useT } from "@/i18n";
import { ClubCard } from "../components/ClubCard";
import { useMembership } from "../components/useMembership";
import { useClubs } from "../hooks";
import { CATEGORIES } from "../types";

/** Annuaire des clubs : recherche, filtre par catégorie et adhésion. */
export default function ClubsPage() {
  const t = useT();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setQ(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const query = useClubs({ q, category });
  const { join, cancel, askLeave, pendingId, alert, dialog } = useMembership(query.refetch);
  const filtered = Boolean(q || category);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="club-search" className="sr-only">
            {t("life.search.label")}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="club-search" type="search" className="pl-9" placeholder={t("life.search.placeholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="w-full sm:w-56">
          <label htmlFor="club-category" className="sr-only">
            {t("life.filter.category")}
          </label>
          <Select id="club-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t("life.filter.allCategories")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {alert}

      <QueryBoundary
        query={query}
        moduleName={t("module.student-life")}
        skeleton={
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-60 rounded-xl" />
            ))}
          </div>
        }
      >
        {(clubs) =>
          clubs.length === 0 ? (
            <Card>
              <EmptyState icon={Sparkles} title={filtered ? t("life.empty.noMatch") : t("life.empty.clubs")} />
            </Card>
          ) : (
            <>
              <p aria-live="polite" className="text-sm text-muted-foreground">
                {t("life.clubs.count", { count: clubs.length })}
              </p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {clubs.map((c) => (
                  <ClubCard key={c.id} club={c} busy={pendingId === c.id} onJoin={(x) => void join(x)} onCancel={(x) => void cancel(x)} onLeave={askLeave} />
                ))}
              </div>
            </>
          )
        }
      </QueryBoundary>
      {dialog}
    </div>
  );
}
