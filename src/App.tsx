import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "@/layout/AppShell";
import { ForbiddenView, NotFoundView } from "@/components/shared/ErrorViews";
import { ModuleBoundary } from "@/components/shared/ModuleBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/auth/AuthContext";
import { RequireSession } from "@/auth/RequireSession";
import { ChangePasswordPage, ForgotPasswordPage, LoginPage, ProfilePage, RegisterPage, ResetPasswordPage, VerifyEmailPage } from "@/features/users/routes";
import { canAccess, MODULES } from "@/features/registry";
import type { ModuleDef } from "@/features/types";

const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const Showcase = lazy(() => import("@/pages/Showcase"));
const ConflictDemo = lazy(() => import("@/pages/ConflictDemo"));

/** Garde de rôle : 403 « Accès refusé » si le rôle courant n'a pas accès au module. */
function ModuleRoute({ module }: { module: ModuleDef }) {
  const { role } = useAuth();
  if (!canAccess(module, role)) return <ForbiddenView />;
  return <ModuleBoundary module={module} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Skeleton className="m-6 h-40" />}>
        <Routes>
          {/* Pages publiques du module Utilisateurs */}
          <Route path="connexion" element={<LoginPage />} />
          <Route path="inscription" element={<RegisterPage />} />
          <Route path="verification-email" element={<VerifyEmailPage />} />
          <Route path="mot-de-passe-oublie" element={<ForgotPasswordPage />} />
          <Route path="reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />

          <Route element={<RequireSession />}>
          <Route path="changer-mot-de-passe" element={<ChangePasswordPage />} />
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="profil" element={<ProfilePage />} />
            {MODULES.map((m) => (
              <Route key={m.id} path={`${m.path}/*`} element={<ModuleRoute module={m} />} />
            ))}
            <Route path="demo/403" element={<ForbiddenView />} />
            <Route path="demo/409" element={<ConflictDemo />} />
            <Route path="demo/composants" element={<Showcase />} />
            <Route path="*" element={<NotFoundView />} />
          </Route>
          </Route>
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" richColors closeButton />
    </BrowserRouter>
  );
}
