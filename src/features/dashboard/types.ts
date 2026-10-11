import type { Status } from "@/components/shared/StatusPill";
import type { Tone } from "@/lib/tones";
import type { ModuleId } from "../types";

export interface DashboardItem {
  id: string;
  title: string;
  subtitle: string;
  status: Status;
  tone: Tone;
  module: ModuleId;
}

export interface DashboardEvent {
  id: string;
  title: string;
  when: string;
  tone: Tone;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  tone: Tone;
}

export interface DashboardData {
  subtitle: string;
  progress: { title: string; value: number; caption: string };
  kpi: { label: string; value: string; hint: string };
  /** Modules proposés en accès rapide (filtrés selon les droits du rôle). */
  quickAccess: ModuleId[];
  quickActions: { label: string; module: ModuleId }[];
  listTitle: string;
  items: DashboardItem[];
  events: DashboardEvent[];
  announcements: Announcement[];
  activity: { day: string; value: number }[];
}
