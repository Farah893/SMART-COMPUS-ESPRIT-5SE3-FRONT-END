import { lazy } from "react";
import { Users } from "lucide-react";
import type { ModuleDef } from "../types";
import "./i18n";

export const usersModule: ModuleDef = {
  id: "users",
  path: "/utilisateurs",
  icon: Users,
  labelKey: "module.users",
  shortLabelKey: "module.users.short",
  roles: ["admin"],
  tone: "navy",
  Page: lazy(() => import("./pages/UsersModule")),
};
