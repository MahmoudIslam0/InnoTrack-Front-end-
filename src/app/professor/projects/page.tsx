"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCatalogCard } from "@/app/_components/DashboardUI";
import {
  professorProfile,
  projects as initialProjects,
  Project,
  teams,
} from "../_data";

interface ProjectData {
  id: string;
  title: string;
  year: number;
  category: string;
  supervisor: string;
  status: string;
  technologies: string[];
  students: string[];
}

export default function ProfessorProjects() {
  const [projects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");

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
  }, [projects, searchQuery])
  const getProjectData = (project: Project): ProjectData => {
    const assignedTeam = teams.find((team) => team.projectId === project.id);
    const studentNames = assignedTeam?.members.map((member) => member.name) ?? [project.team];

    return {
      id: project.id,
      title: project.title,
      year: 2026,
      category: project.domain,
      supervisor: professorProfile.name,
      status: project.status,
      technologies: project.technologies,
      students: studentNames,
    };
  };

  const thisYearProjects = filteredProjects.filter(
    (project) => project.status !== "completed",
  );
  const completedProjects = filteredProjects.filter(
    (project) => project.status === "completed",
  );

  return (
    <div className="dashboard-page">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Projects</h1>
        <p className="text-muted-foreground">Browse and search graduation projects</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects by title, category, supervisor, or students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-colors text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="current">
            This Year ({thisYearProjects.length})
          </TabsTrigger>
          <TabsTrigger value="old">
            Old Projects ({completedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thisYearProjects.map((project) => (
              <ProjectCatalogCard
                key={project.id}
                project={getProjectData(project)}
                href={`/professor/projects/${project.id}`}
              />
            ))}
          </div>
          {thisYearProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="old">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedProjects.map((project) => (
              <ProjectCatalogCard
                key={project.id}
                project={getProjectData(project)}
                href={`/professor/projects/${project.id}`}
              />
            ))}
          </div>
          {completedProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
