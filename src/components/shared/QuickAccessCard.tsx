import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { TONES, type Tone } from "@/lib/tones";
import { cn } from "@/lib/utils";

interface QuickAccessCardProps {
  to: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  tone: Tone;
}

export function QuickAccessCard({ to, title, description, icon: Icon, tone }: QuickAccessCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md",
        TONES[tone].ring,
      )}
    >
      <span className={cn("flex size-12 items-center justify-center rounded-xl", TONES[tone].icon)}>
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        {description && <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>}
      </span>
    </Link>
  );
}
