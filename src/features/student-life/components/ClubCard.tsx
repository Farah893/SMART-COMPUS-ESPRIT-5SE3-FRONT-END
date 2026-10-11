import { Link } from "react-router-dom";
import { MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CapacityGauge } from "@/components/shared/CapacityGauge";
import { useT } from "@/i18n";
import type { ClubView } from "../types";
import { MembershipButton } from "./MembershipButton";

interface ClubCardProps {
  club: ClubView;
  busy?: boolean;
  onJoin: (club: ClubView) => void;
  onCancel: (club: ClubView) => void;
  onLeave: (club: ClubView) => void;
}

/** Fiche de club : catégorie, description, lieu, remplissage et bouton d'adhésion. */
export function ClubCard({ club, busy, onJoin, onCancel, onLeave }: ClubCardProps) {
  const t = useT();
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">{club.category}</p>
        <h3 className="mt-0.5 text-base font-semibold leading-snug">
          <Link to={`/vie-etudiante/clubs/${club.id}`} className="rounded hover:underline">
            {club.name}
          </Link>
        </h3>
      </div>

      <p className="line-clamp-3 text-sm text-muted-foreground">{club.description}</p>

      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Users className="size-4 shrink-0" aria-hidden="true" />
          {t("life.club.members", { count: club.members })}
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {club.meetingPlace}
        </li>
      </ul>

      <CapacityGauge used={club.members} capacity={club.maxMembers} label={t("life.club.capacity")} />

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/vie-etudiante/clubs/${club.id}`} aria-label={`${t("life.club.details")} — ${club.name}`}>
            {t("life.club.details")}
          </Link>
        </Button>
        <MembershipButton club={club} busy={busy} onJoin={onJoin} onCancel={onCancel} onLeave={onLeave} />
      </div>
    </Card>
  );
}
