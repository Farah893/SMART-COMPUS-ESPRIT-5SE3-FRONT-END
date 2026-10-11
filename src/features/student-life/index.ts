import { lazy } from "react";
import { Sparkles } from "lucide-react";
import type { ModuleDef } from "../types";
import "./i18n";

export const studentLifeModule: ModuleDef = {
  id: "student-life",
  path: "/vie-etudiante",
  icon: Sparkles,
  labelKey: "module.student-life",
  shortLabelKey: "module.student-life.short",
  roles: ["student", "teacher", "admin"],
  tone: "red",
  Page: lazy(() => import("./pages/StudentLifeModule")),
};
