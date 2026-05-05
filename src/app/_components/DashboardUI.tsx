import { ArrowRight, Award, LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type StatusTone =
  | "draft"
  | "in-progress"
  | "submitted"
  | "completed"
  | "approved"
  | "rejected";

export type StatTone = "success" | "info" | "primary" | "warning" | "error";

const statToneMap: Record<StatTone, string> = {
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  primary: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  error: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const statusToneMap: Record<StatusTone, string> = {
  draft: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  "in-progress": "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  submitted: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 dark:text-indigo-400",
  completed: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 dark:text-emerald-400",
  approved: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  rejected: "bg-red-500/20 text-red-700 dark:text-red-400",
};

const statusLabelMap: Record<StatusTone, string> = {
  draft: "Draft",
  "in-progress": "In Progress",
  submitted: "Submitted",
  completed: "Completed",
  approved: "Approved",
  rejected: "Rejected",
};

export interface ProjectCatalogItem {
  id: string;
  title: string;
  category: string;
  status: StatusTone;
  year: string | number;
  supervisor: string;
  students: string[];
  technologies: string[];
}

export interface OriginalProjectItem {
  id: string;
  title: string;
  domain: string;
  description: string;
  originalityScore: number;
  meta: string;
  status: StatusTone;
}

export interface ProjectTableRow {
  id: string;
  title: string;
  subtitle: string;
  team: string;
  status: StatusTone;
  originalityScore: number;
}

export interface NotificationListItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread?: boolean;
  type?: string;
  icon: LucideIcon;
  tone: StatTone;
  href?: string;
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-normal text-foreground mb-2">
        {title}
      </h1>
      <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
        {description}
      </p>
    </div>
  );
}

export function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="dashboard-surface overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between gap-4 bg-card text-card-foreground">
        <h2 className="text-base md:text-lg font-semibold text-foreground">
          {title}
        </h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  tone: StatTone;
}) {
  return (
    <div className="dashboard-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${statToneMap[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: StatusTone }) {
  return (
    <Badge variant="secondary" className={statusToneMap[status]}>
      {statusLabelMap[status]}
    </Badge>
  );
}

export function TechChips({
  technologies,
  limit = 3,
}: {
  technologies: string[];
  limit?: number;
}) {
  const visibleTech = technologies.slice(0, limit);
  const remaining = technologies.length - visibleTech.length;

  return (
    <div className="flex flex-wrap gap-2">
      {visibleTech.map((technology) => (
        <span
          key={technology}
          className="px-2.5 py-1 bg-muted text-foreground text-xs rounded-md font-medium"
        >
          {technology}
        </span>
      ))}
      {remaining > 0 && (
        <span className="px-2.5 py-1 bg-muted text-foreground text-xs rounded-md font-medium">
          +{remaining}
        </span>
      )}
    </div>
  );
}

export function ProjectCatalogCard({
  project,
  actionLabel = "View Details",
  onAction,
  href,
  secondaryActionLabel,
  onSecondaryAction,
}: {
  project: ProjectCatalogItem;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}) {
  return (
    <div className="dashboard-card hover:border-indigo-500/30">
      <div className="flex items-start justify-between mb-3">
        <Badge
          variant="outline"
          className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
        >
          {project.category}
        </Badge>
        <StatusBadge status={project.status} />
      </div>

      <h4 className="text-base font-semibold text-foreground mb-2">
        {project.title}
      </h4>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Year:</span> {project.year}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Supervisor:</span>{" "}
          {project.supervisor}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Students:</span>{" "}
          {project.students.join(", ")}
        </p>
      </div>

      <div className="mb-4">
        <TechChips technologies={project.technologies} />
      </div>

      <div className="flex items-center gap-3">
        {href ? (
          <Button
            variant="outline"
            className="flex-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
            asChild
          >
            <Link href={href}>
              {actionLabel}
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="secondary"
            className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
            onClick={onSecondaryAction}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";

export function OriginalProjectCard({
  project,
  actionLabel = "View Details",
  onAction,
  href,
}: {
  project: OriginalProjectItem;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
}) {
  return (
    <div className="dashboard-card hover:border-indigo-500/30 group">
      <div className="flex items-start justify-between mb-3">
        <Badge
          variant="outline"
          className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
        >
          {project.domain}
        </Badge>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
          <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {project.originalityScore}%
          </span>
        </div>
      </div>

      <h4 className="text-base font-semibold text-foreground mb-2 group-hover:text-indigo-600 dark:text-indigo-400 transition-colors">
        {project.title}
      </h4>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {project.description}
      </p>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-muted-foreground">{project.meta}</span>
        <StatusBadge status={project.status} />
      </div>

      {href ? (
        <Button variant="ghost" className="w-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-700 dark:text-indigo-300" asChild>
          <Link href={href}>
            {actionLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      ) : (
        <Button
          variant="ghost"
          className="w-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-700 dark:text-indigo-300"
          onClick={onAction}
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}

export function ProjectTable({
  rows,
  actionLabel = "Open Details",
  onAction,
}: {
  rows: ProjectTableRow[];
  actionLabel?: string;
  onAction?: (projectId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border/50 bg-muted/50">
            <th className="px-6 py-4 font-medium">Project</th>
            <th className="px-6 py-4 font-medium">Team</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Originality</th>
            {onAction && <th className="px-6 py-4 font-medium">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <td className="px-6 py-5 min-w-72">
                <p className="font-medium text-foreground">{row.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{row.subtitle}</p>
              </td>
              <td className="px-6 py-5 text-foreground">{row.team}</td>
              <td className="px-6 py-5">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-6 py-5">
                <span
                  className={
                    row.originalityScore < 70
                      ? "font-semibold text-red-600 dark:text-red-400"
                      : "font-semibold text-emerald-700 dark:text-emerald-400"
                  }
                >
                  {row.originalityScore}%
                </span>
              </td>
              {onAction && (
                <td className="px-6 py-5">
                  <Button
                    variant="outline"
                    className="text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/100/10"
                    onClick={() => onAction(row.id)}
                  >
                    {actionLabel}
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NotificationList({
  items,
  onRead,
}: {
  items: NotificationListItem[];
  onRead?: (id: string) => void;
}) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-border/50">
      {items.map((notification) => {
        const Icon = notification.icon;

        const content = (
          <div
            className={`px-6 py-5 flex items-start gap-4 hover:bg-muted/50 transition-colors ${notification.unread ? 'bg-muted/20' : ''}`}
            onMouseEnter={() => notification.unread && onRead?.(notification.id)}
          >
            <div
              className={`p-3 rounded-xl ${statToneMap[notification.tone]} shrink-0`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {notification.title}
                    </p>
                    {notification.type && (
                      <Badge variant="outline">{notification.type}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                </div>
                {notification.unread && (
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {notification.timestamp}
              </p>
            </div>
          </div>
        );

        if (notification.href) {
          return (
            <Link key={notification.id} href={notification.href} className="block group">
              {content}
            </Link>
          );
        }

        return <div key={notification.id} className="group">{content}</div>;
      })}
    </div>
  );
}
