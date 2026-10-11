import { api } from "@/api/client";
import { useQuery } from "@/api/useQuery";
import { useAuth } from "@/auth/AuthContext";
import { buildDashboard } from "./mock";
import type { DashboardData } from "./types";

export function useDashboard() {
  const { role } = useAuth();
  return useQuery(
    (signal) => api.get<DashboardData>("/dashboard", { signal, mock: () => buildDashboard(role) }),
    [role],
  );
}
