import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useT } from "@/i18n";
import { formatDay } from "../utils/time";
import type { CampusEvent } from "../types";

/** Événement de l'agenda : date, horaire, lieu et club organisateur. */
export function EventCard({ event }: { event: CampusEvent }) {
  const t = useT();
  return (
    <Card className="flex flex-col gap-2 p-5">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground">
        {event.clubId ? (
          <Link to={`/vie-etudiante/clubs/${event.clubId}`} className="rounded hover:underline">
            {event.clubName}
          </Link>
        ) : (
          t("life.events.campus")
        )}
      </p>
      <h3 className="text-base font-semibold leading-snug">{event.title}</h3>
      {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
      <ul className="mt-1 space-y-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Clock className="size-4 shrink-0" aria-hidden="true" />
          <span className="capitalize">{formatDay(event.date)}</span> · {event.start}–{event.end}
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {event.location}
        </li>
      </ul>
    </Card>
  );
}
