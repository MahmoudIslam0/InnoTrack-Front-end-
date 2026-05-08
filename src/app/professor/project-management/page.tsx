"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Award, Users, Clock, CheckCircle2,
  FileText, AlertTriangle, ChevronRight, Layers, ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge, OriginalityMeter } from "../_components";
import { projects as initialProjects, teams, Project } from "../_data";
import { ManageProjectDialog } from "./ManageProjectDialog";

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${color}`}>
      {value} {label}
    </span>
  );
}

function ProjectCard({ project, onManage, onViewDetails }: { project: Project; onManage: () => void; onViewDetails: () => void }) {
  const team = teams.find(t => t.projectId === project.id);
  const scoreColor =
    project.originalityScore >= 80 ? "text-emerald-600 dark:text-emerald-400"
    : project.originalityScore >= 70 ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";
  const scoreBg =
    project.originalityScore >= 80 ? "bg-emerald-500/10 border-emerald-500/20"
    : project.originalityScore >= 70 ? "bg-amber-500/10 border-amber-500/20"
    : "bg-red-500/10 border-red-500/20";

  return (
    <div className="bg-card text-card-foreground rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-200 overflow-hidden group">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-foreground truncate">{project.title}</h3>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-muted-foreground">{project.team} · {project.domain}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${scoreBg}`}>
            <Award className={`w-3.5 h-3.5 ${scoreColor}`} />
            <span className={`text-sm font-bold ${scoreColor}`}>{project.originalityScore}%</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies.slice(0, 3).map(tech => (
            <span key={tech} className="px-2 py-0.5 bg-muted text-foreground text-xs rounded-md font-medium">
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-md">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{team ? `${team.members.length} members` : "No team"}</span>
            <span className="text-border">·</span>
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(project.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={onViewDetails}
            >
              <ExternalLink className="w-3 h-3" />
              View Details
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 gap-1.5"
              onClick={onManage}
            >
              Manage
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfessorProjectManagement() {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dialogTab, setDialogTab] = useState<"overview" | "team" | "logs">("team");

  const openManage = (project: Project) => {
    setDialogTab("team");
    setSelectedProject(project);
  };

  const openViewDetails = (project: Project) => {
    router.push(`/professor/projects/${project.id}`);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter(p => {
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.team.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const counts = {
    all: projects.length,
    "in-progress": projects.filter(p => p.status === "in-progress").length,
    submitted: projects.filter(p => p.status === "submitted").length,
    completed: projects.filter(p => p.status === "completed").length,
    draft: projects.filter(p => p.status === "draft").length,
  };

  const setSystemStatus = (projectId: string, status: Project["status"]) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));
    setSelectedProject(prev => prev?.id === projectId ? { ...prev, status } : prev);
  };

  const statusFilters = [
    { key: "all", label: "All" },
    { key: "in-progress", label: "In Progress" },
    { key: "pending-review", label: "Pending Review" },
    { key: "completed", label: "Completed" },
    { key: "draft", label: "Draft" },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Project Management"
        description="Manage your assigned projects, review submissions, and oversee team progress."
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Assigned", value: counts.all, icon: Layers, color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400" },
          { label: "In Progress", value: counts["in-progress"], icon: Clock, color: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400" },
          { label: "Awaiting Review", value: counts.submitted, icon: AlertTriangle, color: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400" },
          { label: "Completed", value: counts.completed, icon: CheckCircle2, color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`flex items-center gap-3 p-4 rounded-xl border ${color} bg-opacity-50`}>
            <Icon className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="bg-card rounded-xl border border-border/50 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, teams, or domains..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                statusFilter === f.key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-muted text-muted-foreground border-border/50 hover:border-indigo-300"
              }`}
            >
              {f.label} {f.key !== "all" && counts[f.key as keyof typeof counts] > 0 && `(${counts[f.key as keyof typeof counts]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No projects match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onManage={() => openManage(project)}
              onViewDetails={() => openViewDetails(project)}
            />
          ))}
        </div>
      )}

      <ManageProjectDialog
        project={selectedProject}
        defaultTab={dialogTab}
        onOpenChange={open => !open && setSelectedProject(null)}
        onApproveProposal={id => setSystemStatus(id, "in-progress")}
        onRejectProposal={id => setSystemStatus(id, "draft")}
        onAcceptSubmission={id => setSystemStatus(id, "completed")}
        onRejectSubmission={id => setSystemStatus(id, "in-progress")}
      />
    </div>
  );
}
