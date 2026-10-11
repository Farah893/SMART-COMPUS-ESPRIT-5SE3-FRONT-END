import { lazy } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const LandingPage = lazy(() => import("@/features/home/LandingPage"));

/**
 * Sans session : « / » affiche la page d'accueil publique, toute autre page redirige vers /connexion.
 * Avec session : « / » reste le tableau de bord.
 */
export function RequireSession() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    if (location.pathname === "/") return <LandingPage />;
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }
  // Mot de passe temporaire : rien d'autre n'est accessible tant que l'utilisateur n'a pas choisi le sien.
  if (user.mustChangePassword && location.pathname !== "/changer-mot-de-passe") return <Navigate to="/changer-mot-de-passe" replace />;
  return <Outlet />;
}
