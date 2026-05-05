import { CheckCircle2, ClipboardList, FolderKanban, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OriginalProjectItem } from "@/app/_components/DashboardUI";
import { OriginalProjectsSection } from "@/app/_components/PopularProjects";
import { TrendingTechnologies } from "@/app/_components/TrendingTechnologies";
import { projects, teams } from "../_data";
import {
  PageHeader,
  ProjectTable,
  ProfessorStatCard,
  SectionCard,
} from "../_components";

export default function ProfessorDashboard() {
  const pendingApprovals = projects.filter((project) => project.status === "draft");
  const mostOriginalProjects: OriginalProjectItem[] = [...projects]
    .sort(
      (firstProject, secondProject) =>
        secondProject.originalityScore - firstProject.originalityScore,
    )
    .slice(0, 4)
    .map((project) => ({
      id: project.id,
      title: project.title,
      domain: project.domain,
      description: project.description,
      originalityScore: project.originalityScore,
      meta: project.team,
      status: project.status,
    }));
  const projectRows = projects.map((project) => ({
    id: project.id,
    title: project.title,
    subtitle: project.domain,
    team: project.team,
    status: project.status,
    originalityScore: project.originalityScore,
  }));

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Professor Dashboard"
        description="Monitor supervised teams, proposal approvals, originality alerts, and recent updates."
      />

      <div className="bg-indigo-500/10 rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm mb-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                Review professor approvals
              </h2>
              <Badge
                variant="secondary"
                className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
              >
                {pendingApprovals.length} Pending
              </Badge>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Approve proposals when originality and scope are ready, or send
              targeted feedback before teams move from draft to in-progress.
            </p>
          </div>
          <Link href="/professor/project-management">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
              <ClipboardList className="w-4 h-4 mr-2" />
              Open Review Queue
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ProfessorStatCard
          title="Assigned Teams"
          value={String(teams.length)}
          subtitle="Across current graduation cycle"
          icon={Users}
          tone="primary"
        />
        <ProfessorStatCard
          title="Projects Supervised"
          value={String(projects.length)}
          subtitle="Draft, active, and submitted projects"
          icon={FolderKanban}
          tone="info"
        />
        <ProfessorStatCard
          title="Pending Approvals"
          value={String(pendingApprovals.length)}
          subtitle="Draft proposals need decision"
          icon={CheckCircle2}
          tone="warning"
        />
      </div>

      <div className="space-y-8">
          <SectionCard
            title="Projects Under Supervision"
            action={
              <Link href="/professor/project-management">
                <Button
                  variant="ghost"
                  className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                >
                  View All
                </Button>
              </Link>
            }
          >
            <ProjectTable rows={projectRows} />
          </SectionCard>

          <OriginalProjectsSection
            thisYearProjects={mostOriginalProjects}
            allTimeProjects={mostOriginalProjects}
            actionLabel="Open Review"
            viewAllHref="/professor/projects"
          />

          <TrendingTechnologies />
      </div>
    </div>
  );
}
