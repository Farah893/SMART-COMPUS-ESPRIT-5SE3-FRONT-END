import { Link } from "react-router-dom";
import { MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CapacityGauge } from "@/components/shared/CapacityGauge";
import { useT } from "@/i18n";
import type { RoomView } from "../types";
import { EquipmentList } from "./EquipmentList";

interface RoomCardProps {
  room: RoomView;
  onShowAvailability: (room: RoomView) => void;
}

/** Fiche de salle : lieu, capacité, équipements, occupation du jour et actions. */
export function RoomCard({ room, onShowAvailability }: RoomCardProps) {
  const t = useT();
  const floor = room.floor === 0 ? t("resources.room.ground") : t("resources.room.floor", { n: room.floor });
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">{t(`resources.kind.${room.kind}`)}</p>
        <h3 className="mt-0.5 text-base font-semibold leading-snug">{room.name}</h3>
      </div>

      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {room.building} · {floor}
        </li>
        <li className="flex items-center gap-2">
          <Users className="size-4 shrink-0" aria-hidden="true" />
          {t("resources.room.capacity", { count: room.capacity })}
        </li>
      </ul>

      <EquipmentList equipment={room.equipment} />

      <CapacityGauge used={room.bookedHoursToday} capacity={room.openHours} label={t("resources.room.occupancy")} />

      <div className="mt-auto flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onShowAvailability(room)} aria-label={`${t("resources.room.availability")} — ${room.name}`}>
          {t("resources.room.availability")}
        </Button>
        <Button size="sm" asChild>
          <Link to={`/ressources/reserver?salle=${room.id}`} aria-label={`${t("resources.room.reserve")} — ${room.name}`}>
            {t("resources.room.reserve")}
          </Link>
        </Button>
      </div>
    </Card>
  );
}
