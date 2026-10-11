import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { tokenStore } from "@/api/client";
import { fakeJwt } from "@/auth/jwt";
import { DEMO_USERS, ROLES, type Role, type User } from "@/auth/roles";
import { storedAvatar } from "../mocks";

interface AuthValue {
  /** Utilisateur courant (profil étudiant de démonstration tant qu'aucune session n'existe). */
  user: User;
  role: Role;
  isAuthenticated: boolean;
  /** Ouvre une session (après POST /auth/login). */
  login: (user: User, token?: string) => void;
  /** Sélecteur de rôle de démo : ouvre une session avec l'utilisateur fictif du rôle. */
  setRole: (role: Role) => void;
  updateUser: (patch: Partial<Pick<User, "name" | "email" | "avatarUrl" | "mustChangePassword">>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);
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
  useEffect(() => {
    if (session) tokenStore.set(fakeJwt(session));
    else tokenStore.clear();
  }, [session]);

  const open = useCallback((u: User) => {
    setSession(u);
    writeSession(u);
  }, []);

  const login = useCallback((u: User, token?: string) => {
    if (token) tokenStore.set(token);
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
    setSession(null);
    writeSession(null);
  }, []);

  const value = useMemo(
    () => ({ user, role: user.role, isAuthenticated: session !== null, login, setRole, updateUser, logout }),
    [user, session, login, setRole, updateUser, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
