import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, onSessionExpired, refreshStore, tokenStore, USE_MOCKS } from "@/shared/api/client";
import { fakeJwt } from "@/shared/auth/jwt";
import { DEMO_USERS, ROLES, type Role, type User } from "@/shared/auth/roles";
import { AuthContext, type AuthValue } from "@/shared/auth/AuthContext";
import { storedAvatar } from "../mocks";

const SESSION_KEY = "smartcampus.session";

function readSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as User;
    return u && typeof u.id === "string" && ROLES.includes(u.role) ? u : null;
  } catch {
    return null;
  }
}

function writeSession(user: User | null) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* stockage indisponible */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<User | null>(readSession);
  const user = session ?? DEMO_USERS.student;

  // Garde le JWT envoyé par l'intercepteur synchronisé avec la session.
  // Avec le vrai back-end, le jeton signé reçu à la connexion ne doit jamais être remplacé par un faux.
  useEffect(() => {
    if (!session) {
      tokenStore.clear();
      refreshStore.clear();
    }
    else if (USE_MOCKS) tokenStore.set(fakeJwt(session));
  }, [session]);

  const open = useCallback((u: User) => {
    setSession(u);
    writeSession(u);
  }, []);

  const login = useCallback((u: User, token?: string, refreshToken?: string) => {
    if (token) tokenStore.set(token);
    if (refreshToken) refreshStore.set(refreshToken);
    open(u);
  }, [open]);

  const setRole = useCallback((r: Role) => open({ ...DEMO_USERS[r], avatarUrl: storedAvatar(DEMO_USERS[r].id) }), [open]);

  const updateUser = useCallback<AuthValue["updateUser"]>((patch) => {
    setSession((s) => {
      if (!s) return s;
      const next = { ...s, ...patch };
      writeSession(next);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    // Révoque la famille de jetons côté serveur (best effort : la déconnexion locale ne dépend pas de la réponse).
    const refreshToken = refreshStore.get();
    if (refreshToken && !USE_MOCKS) void api.post("/auth/logout", { body: { refreshToken }, mock: () => undefined }).catch(() => undefined);
    refreshStore.clear();
    setSession(null);
    writeSession(null);
  }, []);

  // Session non renouvelable (401 après tentative de refresh) : on déconnecte vraiment l'interface.
  useEffect(
    () =>
      onSessionExpired(() => {
        refreshStore.clear();
        setSession(null);
        writeSession(null);
      }),
    [],
  );

  const value = useMemo(
    () => ({ user, role: user.role, isAuthenticated: session !== null, login, setRole, updateUser, logout }),
    [user, session, login, setRole, updateUser, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
