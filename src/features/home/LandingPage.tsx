import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CalendarCheck, GraduationCap, Layers, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL, ROLES } from "@/auth/roles";
import { MODULES } from "@/features/registry";
import type { ModuleDef } from "@/features/types";
import { Logo } from "@/layout/Logo";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { Typewriter } from "./Typewriter";
import { useReveal } from "./useReveal";
import "./i18n";

const ROLE_ICON = { student: GraduationCap, teacher: Users, admin: ShieldCheck } as const;
const ROLE_GRADIENT = {
  student: "from-sky-500 to-blue-600",
  teacher: "from-violet-500 to-indigo-600",
  admin: "from-amber-400 to-orange-500",
} as const;
const TONE_GRADIENT: Record<ModuleDef["tone"], string> = {
  navy: "from-blue-700 to-indigo-600",
  blue: "from-sky-500 to-blue-600",
  amber: "from-amber-400 to-orange-500",
  green: "from-emerald-400 to-teal-600",
  red: "from-rose-500 to-pink-600",
};
const WHY = [
  { icon: Users, n: 1, gradient: "from-sky-500 to-blue-600" },
  { icon: Layers, n: 2, gradient: "from-violet-500 to-fuchsia-600" },
  { icon: ShieldCheck, n: 3, gradient: "from-emerald-400 to-teal-600" },
] as const;
const SPARKLES: { cls: string; delay: number }[] = [
  { cls: "left-[8%] top-[18%] size-4 text-cyan-200", delay: 0 },
  { cls: "left-[46%] top-[10%] size-3 text-amber-200", delay: 600 },
  { cls: "right-[12%] top-[26%] size-5 text-fuchsia-200", delay: 1200 },
  { cls: "left-[30%] bottom-[16%] size-3 text-white", delay: 1800 },
  { cls: "right-[34%] bottom-[10%] size-4 text-cyan-200", delay: 2400 },
];

/** Met à jour le titre et la description de la page (utile au référencement et à l'onglet du navigateur). */
function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    const previousContent = meta.content;
    meta.content = description;
    return () => {
      document.title = previous;
      if (created) meta.remove();
      else meta.content = previousContent;
    };
  }, [title, description]);
}

/** Fait apparaître son contenu en fondu quand il entre à l'écran (désactivé si le mouvement est réduit). */
function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, className: state } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(state, className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function FloatingCard({ icon: Icon, title, text, gradient, className, style }: { icon: typeof BookOpen; title: string; text: string; gradient: string; className?: string; style?: CSSProperties }) {
  return (
    <div style={style} className={cn("flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl shadow-indigo-950/40 backdrop-blur-md", className)}>
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white", gradient)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-white">{title}</span>
        <span className="block truncate text-xs text-blue-100">{text}</span>
      </span>
    </div>
  );
}

/** Page d'accueil publique : affichée sur « / » tant qu'aucune session n'est ouverte. */
export default function LandingPage() {
  const t = useT();
  usePageMeta(t("home.meta.title"), t("home.meta.description"));
  const words = useMemo(() => [t("home.hero.word1"), t("home.hero.word2"), t("home.hero.word3"), t("home.hero.word4")], [t]);
  const serviceNames = MODULES.map((m) => t(m.labelKey));

  return (
    <div className="min-h-screen bg-background">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow-lg">
        {t("app.skipToContent")}
      </a>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 text-white backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <span className="[&_a]:text-white [&_span:last-child]:text-white">
            <Logo />
          </span>
          <nav aria-label={t("home.nav.label")} className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#services" className="rounded text-blue-100 transition-colors hover:text-white">
              {t("home.nav.modules")}
            </a>
            <a href="#profils" className="rounded text-blue-100 transition-colors hover:text-white">
              {t("home.nav.roles")}
            </a>
            <a href="#pourquoi" className="rounded text-blue-100 transition-colors hover:text-white">
              {t("home.nav.why")}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex">
              <Link to="/inscription">{t("home.register")}</Link>
            </Button>
            <Button size="sm" asChild className="bg-gradient-to-r from-amber-300 to-orange-400 font-semibold text-slate-950 hover:from-amber-200 hover:to-orange-300">
              <Link to="/connexion">{t("home.login")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="contenu">
        {/* ---------- Héro ---------- */}
        <section className="lp-gradient-move relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-800 text-white">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="lp-blob absolute -left-24 -top-24 size-96 rounded-full bg-cyan-400/25 blur-3xl" />
            <div className="lp-blob absolute -right-20 top-1/4 size-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl [animation-delay:-6s]" />
            <div className="lp-blob absolute bottom-0 left-1/3 size-80 rounded-full bg-amber-300/15 blur-3xl [animation-delay:-12s]" />
            {SPARKLES.map((s, i) => (
              <Sparkles key={i} style={{ animationDelay: `${s.delay}ms` }} className={cn("lp-twinkle absolute", s.cls)} />
            ))}
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <p className="animate-enter-card inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                <Sparkles className="size-4 text-amber-200" aria-hidden="true" />
                {t("home.hero.badge")}
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block">{t("home.hero.lead")}</span>
                <span className="block min-h-[1.15em]">
                  <Typewriter words={words} className="lp-shimmer bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent" />
                </span>
              </h1>
              <p className="animate-enter-card mt-6 max-w-xl text-lg text-blue-100 [animation-delay:150ms]">{t("home.hero.text")}</p>
              <div className="animate-enter-card mt-8 flex flex-wrap gap-3 [animation-delay:250ms]">
                <Button size="lg" asChild className="group bg-gradient-to-r from-amber-300 to-orange-400 font-semibold text-slate-950 shadow-lg shadow-orange-500/30 hover:from-amber-200 hover:to-orange-300">
                  <Link to="/connexion">
                    {t("home.hero.cta")}
                    <ArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/40 bg-white/5 text-white backdrop-blur hover:bg-white/15 hover:text-white">
                  <a href="#services">{t("home.hero.secondary")}</a>
                </Button>
              </div>
              <ul className="animate-enter-card mt-10 flex gap-8 [animation-delay:350ms]">
                {[
                  [String(MODULES.length), t("home.hero.stat1")],
                  [String(ROLES.length), t("home.hero.stat2")],
                  ["1", t("home.hero.stat3")],
                ].map(([value, label]) => (
                  <li key={label}>
                    <span className="block text-3xl font-extrabold text-white">{value}</span>
                    <span className="block text-sm text-blue-200">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div role="img" aria-label={t("home.preview.label")} className="relative hidden h-[26rem] lg:block">
              <FloatingCard
                icon={BookOpen}
                gradient="from-sky-500 to-blue-600"
                title={t("home.preview.course")}
                text={t("home.preview.courseWhen")}
                className="lp-float absolute left-0 top-4 w-72 [--lp-tilt:-3deg]"
              />
              <FloatingCard
                icon={CalendarCheck}
                gradient="from-emerald-400 to-teal-600"
                title={t("home.preview.room")}
                text={t("home.preview.roomWhen")}
                className="lp-float-slow absolute right-0 top-40 w-72 [--lp-tilt:2deg]"
                style={{ animationDelay: "-2s" }}
              />
              <FloatingCard
                icon={Sparkles}
                gradient="from-fuchsia-500 to-pink-600"
                title={t("home.preview.book")}
                text={t("home.preview.bookWhen")}
                className="lp-float absolute bottom-2 left-10 w-72 [--lp-tilt:-1.5deg]"
                style={{ animationDelay: "-4s" }}
              />
            </div>
          </div>
        </section>

        {/* ---------- Bandeau défilant ---------- */}
        <section aria-label={t("home.marquee.label")} className="overflow-hidden border-y bg-gradient-to-r from-indigo-950 via-blue-900 to-indigo-950 py-4 text-blue-100">
          <ul className="lp-marquee-track px-4 text-sm font-semibold uppercase tracking-widest">
            {serviceNames.map((n) => (
              <li key={n} className="flex items-center gap-8 pr-8">
                {n}
                <Sparkles className="size-3.5 text-amber-200" aria-hidden="true" />
              </li>
            ))}
            {serviceNames.map((n) => (
              <li key={`dup-${n}`} aria-hidden="true" className="lp-marquee-dup items-center gap-8 pr-8">
                {n}
                <Sparkles className="size-3.5 text-amber-200" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Services ---------- */}
        <section id="services" aria-labelledby="services-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <Reveal>
            <h2 id="services-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("home.modules.title")}
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t("home.modules.subtitle")}</p>
          </Reveal>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m, i) => (
              <li key={m.id}>
                <Reveal delay={i * 80} className="h-full">
                  <div className="group relative h-full overflow-hidden rounded-2xl border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10">
                    <div aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", TONE_GRADIENT[m.tone])} />
                    <span className={cn("flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110", TONE_GRADIENT[m.tone])}>
                      <m.icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-lg font-bold">{t(m.labelKey)}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{t(`home.module.${m.id}`)}</p>
                    <p className="mt-4 text-xs font-semibold text-slate-700">{t("home.module.for", { roles: m.roles.map((r) => t(ROLE_LABEL[r])).join(", ") })}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Profils ---------- */}
        <section id="profils" aria-labelledby="profils-title" className="scroll-mt-20 border-y bg-gradient-to-br from-indigo-50 via-white to-sky-50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <Reveal>
              <h2 id="profils-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {t("home.roles.title")}
              </h2>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t("home.roles.subtitle")}</p>
            </Reveal>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {ROLES.map((r, i) => {
                const Icon = ROLE_ICON[r];
                return (
                  <li key={r}>
                    <Reveal delay={i * 110} className="h-full">
                      <div className="h-full rounded-2xl border bg-card/80 p-6 shadow-card backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                        <span className={cn("flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md", ROLE_GRADIENT[r])}>
                          <Icon className="size-6" aria-hidden="true" />
                        </span>
                        <h3 className="mt-5 text-lg font-bold">{t(ROLE_LABEL[r])}</h3>
                        <p className="mt-1.5 text-sm text-muted-foreground">{t(`home.roles.${r}`)}</p>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ---------- Pourquoi ---------- */}
        <section id="pourquoi" aria-labelledby="pourquoi-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <Reveal>
            <h2 id="pourquoi-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("home.why.title")}
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {WHY.map(({ icon: Icon, n, gradient }, i) => (
              <li key={n}>
                <Reveal delay={i * 110} className="flex gap-4">
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md", gradient)}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{t(`home.why.${n}.title`)}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t(`home.why.${n}.text`)}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Appel à l'action ---------- */}
        <section aria-labelledby="cta-title" className="px-4 pb-20 sm:px-6">
          <Reveal>
            <div className="lp-gradient-move relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-900 to-blue-700 px-6 py-14 text-center text-white sm:px-10">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div className="lp-blob absolute -left-10 top-0 size-64 rounded-full bg-cyan-400/25 blur-3xl" />
                <div className="lp-blob absolute -right-10 bottom-0 size-64 rounded-full bg-fuchsia-500/25 blur-3xl [animation-delay:-8s]" />
                <Sparkles className="lp-twinkle absolute left-[12%] top-[22%] size-5 text-amber-200" />
                <Sparkles style={{ animationDelay: "900ms" }} className="lp-twinkle absolute right-[14%] top-[30%] size-4 text-cyan-200" />
              </div>
              <h2 id="cta-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {t("home.cta.title")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-lg text-blue-100">{t("home.cta.text")}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button size="lg" asChild className="bg-gradient-to-r from-amber-300 to-orange-400 font-semibold text-slate-950 shadow-lg shadow-orange-500/30 hover:from-amber-200 hover:to-orange-300">
                  <Link to="/connexion">{t("home.login")}</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white">
                  <Link to="/inscription">{t("home.register")}</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t bg-card">
        <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground sm:px-6">{t("home.footer")}</p>
      </footer>
    </div>
  );
}
