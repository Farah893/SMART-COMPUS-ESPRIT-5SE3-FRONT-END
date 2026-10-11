import type { Role } from "@/auth/roles";
import { usersModule } from "./users";
import { academicModule } from "./academic";
import { resourcesModule } from "./resources";
import { housingModule } from "./housing";
import { studentLifeModule } from "./student-life";
import { libraryModule } from "./library";
import type { ModuleDef, ModuleId } from "./types";

/** Ordre = ordre d'affichage dans la barre latérale. */
export const MODULES: readonly ModuleDef[] = [
  usersModule,
  academicModule,
  resourcesModule,
  housingModule,
  studentLifeModule,
  libraryModule,
];

export const getModule = (id: ModuleId) => MODULES.find((m) => m.id === id)!;
export const canAccess = (module: ModuleDef, role: Role) => module.roles.includes(role);
export const modulesForRole = (role: Role) => MODULES.filter((m) => canAccess(m, role));
