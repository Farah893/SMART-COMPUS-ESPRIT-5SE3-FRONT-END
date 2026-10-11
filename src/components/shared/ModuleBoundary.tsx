import { Component, Suspense, useState, type ErrorInfo, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceUnavailableView } from "./ErrorViews";
import { useServiceDown } from "@/features/_shared/serviceHealth";
import { useT } from "@/i18n";
import type { ModuleDef } from "@/features/types";

interface BoundaryProps {
  moduleName: string;
  resetKey: unknown;
  children: ReactNode;
}

/** Capture toute erreur de rendu d'un module : l'application (en-tête, menu) reste utilisable. */
class ErrorBoundary extends Component<BoundaryProps & { onRetry: () => void }, { failed: boolean; key: unknown }> {
  state = { failed: false, key: this.props.resetKey };

  static getDerivedStateFromError() {
    return { failed: true };
  }
  static getDerivedStateFromProps(props: BoundaryProps, state: { failed: boolean; key: unknown }) {
    return props.resetKey !== state.key ? { failed: false, key: props.resetKey } : null;
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SmartCampus] Erreur dans un module", error, info.componentStack);
  }
  render() {
    if (this.state.failed) {
      return <ServiceUnavailableView moduleName={this.props.moduleName} onRetry={this.props.onRetry} />;
    }
    return this.props.children;
  }
}

function PageSkeleton() {
  const t = useT();
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">{t("app.loading")}</span>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function ModuleBoundary({ module }: { module: ModuleDef }) {
  const t = useT();
  const down = useServiceDown(module.id);
  const [attempt, setAttempt] = useState(0);
  const name = t(module.labelKey);

  if (down) return <ServiceUnavailableView moduleName={name} onRetry={() => setAttempt((a) => a + 1)} />;

  return (
    <ErrorBoundary moduleName={name} resetKey={attempt} onRetry={() => setAttempt((a) => a + 1)}>
      <Suspense fallback={<PageSkeleton />}>
        <module.Page />
      </Suspense>
    </ErrorBoundary>
  );
}
