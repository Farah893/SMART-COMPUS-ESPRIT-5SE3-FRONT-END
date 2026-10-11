import { TrendingUp } from "lucide-react";
import type { DashboardData } from "../types";
import { useT } from "@/i18n";

export function WelcomeBanner({ name, data }: { name: string; data: DashboardData }) {
  const t = useT();
  const { progress, kpi } = data;
  return (
    <section
      aria-labelledby="welcome-title"
      className="grid gap-6 rounded-xl bg-gradient-to-r from-navy via-blue-800 to-sky-accent p-6 text-white shadow-card md:grid-cols-[1fr_auto] md:items-center lg:p-8"
    >
      <div>
        <h1 id="welcome-title" className="text-2xl font-bold tracking-tight lg:text-3xl">
          {t("dashboard.welcome", { name: name.split(" ")[0]! })}
        </h1>
        <p className="mt-2 max-w-md text-blue-50">{data.subtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:w-[26rem]">
        <div className="rounded-xl bg-white p-4 text-slate-900 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">{progress.title}</p>
          <p className="mt-1 text-2xl font-bold text-navy">{progress.value} %</p>
          <div
            role="progressbar"
            aria-valuenow={progress.value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={progress.title}
            className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
          >
            <div className="h-full rounded-full bg-navy" style={{ width: `${progress.value}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{progress.caption}</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-slate-900 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
          <p className="mt-1 text-2xl font-bold text-navy">{kpi.value}</p>
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-700">
            <TrendingUp className="size-3.5" aria-hidden="true" />
            {kpi.hint}
          </p>
        </div>
      </div>
    </section>
  );
}
