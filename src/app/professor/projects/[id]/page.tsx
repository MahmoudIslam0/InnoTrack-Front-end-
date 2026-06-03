"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, Users, BookOpen, Code,
  CheckCircle, Clock, Award, FileText, AlertTriangle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { studentApi, ProjectCatalogDetailDto, formatPercent } from "@/lib/student-api";

function getStatusClasses(status: string) {
  const normalized = status.toLowerCase().replace("_", "");
  if (normalized.includes("complete")) return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  if (normalized.includes("progress")) return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
  if (normalized.includes("submit") || normalized.includes("review")) return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  if (normalized.includes("reject")) return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
  return "bg-muted text-muted-foreground border-border/50";
}

function getStatusLabel(status: string) {
  const normalized = status.toLowerCase().replace("_", "");
  if (normalized.includes("progress")) return "In Progress";
  if (normalized.includes("review")) return "Under Review";
  if (normalized.includes("submit")) return "Submitted";
  if (normalized.includes("complete")) return "Completed";
  if (normalized.includes("reject")) return "Rejected";
  if (normalized.includes("draft")) return "Draft";
  return status;
}

export default function ProfessorProjectDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<ProjectCatalogDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    studentApi.getProject(id)
      .then(setProject)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Project not found.</p>
          <Button onClick={() => router.back()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const scoreColor = "text-indigo-600 dark:text-indigo-400";

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-5 -ml-3 text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Button>

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-semibold text-foreground mb-3">{project.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20">
              {project.domain}
            </Badge>
            <Badge variant="secondary" className={getStatusClasses(project.status)}>
              {getStatusLabel(project.status)}
            </Badge>
            {project.originalityScore !== null && project.originalityScore !== undefined && project.originalityScore < 0.7 && (
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 gap-1">
                <AlertTriangle className="w-3 h-3" /> Low Originality
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-card text-card-foreground rounded-xl p-4 border border-border/50 shadow-sm min-w-[140px]">
          <div className={`text-3xl font-bold ${scoreColor}`}>
            {project.originalityScore !== null && project.originalityScore !== undefined ? `${Math.round(project.originalityScore * 100)}%` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Originality Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Project Description
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </div>

          {/* Abstract */}
          {project.abstract && (
            <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Abstract
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.abstract}</p>
            </div>
          )}

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Technologies Used
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map(tech => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm rounded-lg font-medium border border-indigo-500/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Project info */}
          <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Project Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Academic Year</p>
                  <p className="text-sm text-muted-foreground">{project.academicYear || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Supervisor</p>
                  <p className="text-sm text-muted-foreground">{project.supervisor || "Not assigned"}</p>
                </div>
              </div>
              {project.submittedAt && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Date Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.submittedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
              )}
              {project.status.toLowerCase().includes("complete") && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Completed</p>
                    <p className="text-sm text-muted-foreground">Project finished</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Members */}
          {project.students && project.students.length > 0 && (
            <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Team Members
              </h3>
              <div className="space-y-3">
                {project.students.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                      {member.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      {member.department && (
                        <p className="text-xs text-muted-foreground truncate">{member.department}</p>
                      )}
                    </div>
                    {member.role === "Leader" && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400 shrink-0">
                        Leader
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
