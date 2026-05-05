"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCatalogCard } from "@/app/_components/DashboardUI";
import { PageHeader } from "../_components";
import {
  professorProfile,
  projects as initialProjects,
  Project,
  teams,
} from "../_data";
import { ProjectDetailsDialog } from "../ProjectDetailsDialog";

function ProfessorProjectCard({
  project,
  onView,
}: {
  project: Project;
  onView: (project: Project) => void;
}) {
  const assignedTeam = teams.find((team) => team.projectId === project.id);
  const studentNames =
    assignedTeam?.members.map((member) => member.name).join(", ") ??
    project.team;

  return (
    <ProjectCatalogCard
      project={{
        id: project.id,
        title: project.title,
        category: project.domain,
        status: project.status,
        year: 2026,
        supervisor: professorProfile.name,
        students: studentNames.split(", "),
        technologies: project.technologies,
      }}
      onAction={() => onView(project)}
    />
  );
}

export default function ProfessorProjects() {
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
        project.domain.toLowerCase().includes(query) ||
        project.technologies.some((tech) => tech.toLowerCase().includes(query)),
    );
  }, [projects, searchQuery]);

  const thisYearProjects = filteredProjects.filter(
    (project) => project.status !== "completed",
  );
  const completedProjects = filteredProjects.filter(
    (project) => project.status === "completed",
  );

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
    <div className="p-4 md:p-8 max-w-300 mx-auto">
      <PageHeader
        title="Projects"
        description="Browse and search graduation projects"
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects by title, category, supervisor, or students..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card text-card-foreground border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors"
          />
        </div>
      </div>

      <Tabs defaultValue="assigned" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="assigned" className="rounded-full px-4">
            This Year ({thisYearProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-full px-4">
            Old Projects ({completedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {thisYearProjects.map((project) => (
              <ProfessorProjectCard
                key={project.id}
                project={project}
                onView={setSelectedProject}
              />
            ))}
          </div>
          {thisYearProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No assigned projects found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {completedProjects.map((project) => (
              <ProfessorProjectCard
                key={project.id}
                project={project}
                onView={setSelectedProject}
              />
            ))}
          </div>
          {completedProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No completed projects found</p>
            </div>
          )}
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
