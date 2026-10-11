import { Check } from "lucide-react";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { Equipment } from "../types";

/** Équipements d'une salle (texte + icône : l'information ne repose pas sur la couleur). */
export function EquipmentList({ equipment, className }: { equipment: Equipment[]; className?: string }) {
  const t = useT();
  if (equipment.length === 0) return <p className={cn("text-sm text-muted-foreground", className)}>{t("resources.room.noEquipment")}</p>;
  return (
    <ul aria-label={t("resources.room.equipment")} className={cn("flex flex-wrap gap-1.5", className)}>
      {equipment.map((e) => (
        <li key={e.id} className="inline-flex items-center gap-1 rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          <Check className="size-3" aria-hidden="true" />
          {e.label}
        </li>
      ))}
    </ul>
  );
}
