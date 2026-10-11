import { Link } from "react-router-dom";
import { Footprints, MapPin, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CapacityGauge } from "@/components/shared/CapacityGauge";
import { useT } from "@/i18n";
import type { Residence } from "../types";

interface ResidenceCardProps {
  residence: Residence;
  /** Affiche le bouton « Faire une demande » (étudiant). */
  canRequest?: boolean;
}

/** Fiche de résidence : adresse, loyer, services et jauge d'occupation des lits. */
export function ResidenceCard({ residence, canRequest }: ResidenceCardProps) {
  const t = useT();
  const free = residence.capacity - residence.occupied;
  const full = free <= 0;
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug">{residence.name}</h3>
        {full && <span className="shrink-0 rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">{t("housing.residence.full")}</span>}
      </div>

      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {residence.address}
        </li>
        <li className="flex items-center gap-2">
          <Footprints className="size-4 shrink-0" aria-hidden="true" />
          {t("housing.residence.walk", { count: residence.walkMinutes })}
        </li>
        <li className="flex items-center gap-2">
          <Wallet className="size-4 shrink-0" aria-hidden="true" />
          {t("housing.residence.rent", { amount: residence.monthlyRent })}
        </li>
      </ul>

      <ul aria-label={t("housing.residence.amenities")} className="flex flex-wrap gap-1.5">
        {residence.amenities.map((a) => (
          <li key={a} className="rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {a}
          </li>
        ))}
      </ul>

      <div>
        <CapacityGauge used={residence.occupied} capacity={residence.capacity} label={t("housing.residence.beds")} />
        {!full && <p className="mt-1 text-xs text-muted-foreground">{t("housing.residence.free", { count: free })}</p>}
      </div>

      {canRequest && (
        <div className="mt-auto">
          <Button size="sm" asChild={!full} disabled={full} aria-label={`${t("housing.residence.request")} — ${residence.name}`}>
            {full ? (
              <span>{t("housing.residence.request")}</span>
            ) : (
              <Link to={`/residences/ma-demande?residence=${residence.id}`}>{t("housing.residence.request")}</Link>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
