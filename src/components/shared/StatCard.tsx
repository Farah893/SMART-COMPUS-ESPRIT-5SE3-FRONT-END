import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TONES, type Tone } from "@/lib/tones";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: Tone;
  className?: string;
}

export function StatCard({ label, value, hint, icon: Icon, tone = "blue", className }: StatCardProps) {
  return (
    <Card className={cn("flex items-center gap-4 p-5", className)}>
      {Icon && (
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", TONES[tone].icon)}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
}
