"use client";

import { useMemo, useState } from "react";
import { MessageSquareText, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PageHeader,
  ProjectTable,
  SectionCard,
} from "../_components";
import {
  feedbackHistory,
  projects as initialProjects,
  Project,
} from "../_data";
import { ProjectDetailsDialog } from "../ProjectDetailsDialog";

const decisionTone = {
  "Proposal Approved": "bg-blue-500/20 text-blue-800 border-blue-200",
  "Proposal Rejected": "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/20",
  "Submission Accepted": "bg-emerald-500/20 text-emerald-800 border-emerald-500/20",
  "Submission Rejected": "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/20",
};

export default function ProjectManagement() {
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(query) ||
        project.team.toLowerCase().includes(query) ||
        project.domain.toLowerCase().includes(query),
    );
  }, [projects, searchQuery]);

  const pendingProjects = filteredProjects.filter(
    (project) => project.status === "draft" || project.status === "submitted",
  );
  const submissionFeedback = feedbackHistory.filter((item) =>
    item.decision.startsWith("Submission"),
  );
  const toRows = (rows: Project[]) =>
    rows.map((project) => ({
      id: project.id,
      title: project.title,
      subtitle: project.domain,
      team: project.team,
      status: project.status,
      originalityScore: project.originalityScore,
    }));
  const openProject = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    if (project) setSelectedProject(project);
  };

  const setSystemStatus = (projectId: string, status: Project["status"]) => {
    setProjects((currentProjects) => {
      const targetProject = currentProjects.find((p) => p.id === projectId);
      let nextProjects = currentProjects;

      if ((status === "in-progress" || status === "completed") && targetProject) {
        // Auto-cancel other active submissions from the same team
        nextProjects = currentProjects.filter(
          (p) => p.id === projectId || p.team !== targetProject.team || p.status === "completed"
        );
      }

      return nextProjects.map((project) =>
        project.id === projectId ? { ...project, status } : project,
      );
    });
    setSelectedProject((currentProject) =>
      currentProject?.id === projectId
        ? { ...currentProject, status }
        : currentProject,
    );
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Project Management"
        description="Review assigned projects and complete proposal or final submission decisions."
      />

      <div className="dashboard-surface p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assigned projects, teams, or domains..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="px-3 py-2 rounded-lg bg-muted border border-border/50">
              {filteredProjects.length} assigned
            </span>
            <span className="px-3 py-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100">
              {pendingProjects.length} pending
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="assigned" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="assigned">
            Assigned ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingProjects.length})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            Feedback ({submissionFeedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned">
          <SectionCard title="Assigned Projects">
            <ProjectTable
              rows={toRows(filteredProjects)}
              actionLabel="Open Review"
              onAction={openProject}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="pending">
          <SectionCard title="Pending Decisions">
            <ProjectTable
              rows={toRows(pendingProjects)}
              actionLabel="Open Review"
              onAction={openProject}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="feedback">
          <SectionCard title="Submission Feedback History">
            <div className="space-y-4">
              {submissionFeedback.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-muted rounded-xl border border-border/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <MessageSquareText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {item.projectTitle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.team} - {item.createdAt}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={decisionTone[item.decision]}
                    >
                      {item.decision}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <ProjectDetailsDialog
        project={selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
        onApproveProposal={(projectId) => setSystemStatus(projectId, "in-progress")}
        onRejectProposal={(projectId) => setSystemStatus(projectId, "draft")}
        onAcceptSubmission={(projectId) => setSystemStatus(projectId, "completed")}
        onRejectSubmission={(projectId) => setSystemStatus(projectId, "in-progress")}
      />
    </div>
  );
}
