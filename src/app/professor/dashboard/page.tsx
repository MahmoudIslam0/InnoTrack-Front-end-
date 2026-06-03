"use client";

import { CheckCircle2, ClipboardList, FolderKanban, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { professorApi } from "@/lib/professor-api";
import { studentApi, normalizeStatusTone } from "@/lib/student-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OriginalProjectItem } from "@/app/_components/DashboardUI";
import { PopularProjects } from "@/app/_components/PopularProjects";
import { TrendingTechnologies } from "@/app/_components/TrendingTechnologies";
import {
  PageHeader,
  ProjectTable,
  ProfessorStatCard,
  SectionCard,
} from "../_components";

export default function ProfessorDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await professorApi.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !dashboardData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const {
    totalSupervisedTeams,
    pendingReviewCount,
    activeProjectCount,
    approvedCount,
    rejectedCount,
    averageOriginalityScore,
    recentTeams,
  } = dashboardData;

  const projectRows = recentTeams.map((team: any) => ({
    id: team.projectId || team.id?.toString(),
    title: team.projectTitle || "No Project",
    subtitle: team.projectDomain || "General",
    team: team.name,
    status: normalizeStatusTone(team.projectStatus) as any,
    originalityScore: team.originalityScore || 0,
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
                {pendingReviewCount} Pending
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
          value={String(totalSupervisedTeams)}
          subtitle="Across current graduation cycle"
          icon={Users}
          tone="primary"
        />
        <ProfessorStatCard
          title="Projects Supervised"
          value={String(activeProjectCount + approvedCount + pendingReviewCount + rejectedCount)}
          subtitle="Draft, active, and submitted projects"
          icon={FolderKanban}
          tone="info"
        />
        <ProfessorStatCard
          title="Pending Approvals"
          value={String(pendingReviewCount)}
          subtitle="Draft proposals need decision"
          icon={CheckCircle2}
          tone="warning"
        />
      </div>

      <div className="space-y-8">
          <SectionCard
            title="Projects Under Supervision"
            action={
              <Link href="/professor/project-management?tab=inprogress">
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

          <PopularProjects
            actionLabel="Open Review"
            viewAllHref="/professor/projects"
            hrefPrefix="/professor/projects"
          />

          <TrendingTechnologies />
      </div>
    </div>
  );
}
