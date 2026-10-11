import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, Building2, GraduationCap, KeyRound } from "lucide-react";
import { Logo } from "@/layout/Logo";
import { useT } from "@/i18n";

const HIGHLIGHTS = [
  { icon: BookOpenCheck, title: "users.shell.card1.title", text: "users.shell.card1.text" },
  { icon: Building2, title: "users.shell.card2.title", text: "users.shell.card2.text" },
  { icon: KeyRound, title: "users.shell.card3.title", text: "users.shell.card3.text" },
] as const;

interface AuthShellProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Contenu sous le formulaire (ex. encart de démonstration). */
  footer?: ReactNode;
}

/** Mise en page des pages d'authentification : panneau d'accueil à gauche (≥ lg), formulaire à droite. */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  const t = useT();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-gradient-to-br from-navy via-blue-800 to-blue-700 p-10 text-white lg:flex xl:p-14">
        <Link to="/" className="flex w-fit items-center gap-2.5 rounded-lg" aria-label={`${t("app.name")} — ${t("nav.home")}`}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-white text-navy">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">{t("app.name")}</span>
        </Link>
        <div>
          <p className="max-w-sm text-3xl font-bold leading-tight tracking-tight">{t("users.shell.headline")}</p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }, i) => (
              <li
                key={title}
                style={{ animationDelay: `${i * 90}ms` }}
                className="animate-enter-card flex items-start gap-4 rounded-xl border border-white/20 bg-white/10 p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-navy">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold">{t(title)}</span>
                  <span className="block text-sm text-blue-100">{t(text)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-blue-100">{t("users.auth.copyright")}</p>
      </aside>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="mb-6 lg:hidden">
          <Logo />
        </div>
        <main id="contenu" className="w-full max-w-md">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6">{footer}</div>}
        </main>
      </div>
    </div>
  );
}
