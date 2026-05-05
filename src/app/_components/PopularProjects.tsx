import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OriginalProjectCard, OriginalProjectItem } from "./DashboardUI";

const thisYearProjects: OriginalProjectItem[] = [
  {
    id: "1",
    title: "Smart Campus Navigation System",
    domain: "IoT & Mobile",
    description:
      "An AI-powered indoor navigation app using AR technology to help students find classrooms and facilities.",
    originalityScore: 95,
    meta: "2026",
    status: "in-progress",
  },
  {
    id: "2",
    title: "Automated Exam Proctoring",
    domain: "AI & Computer Vision",
    description:
      "Machine learning system for detecting cheating behaviors during online examinations using facial recognition.",
    originalityScore: 92,
    meta: "2026",
    status: "in-progress",
  },
  {
    id: "3",
    title: "AI-Powered Learning Assistant",
    domain: "NLP & Education",
    description:
      "Personalized study assistant that summarizes lectures, generates quizzes, and recommends learning paths.",
    originalityScore: 91,
    meta: "2026",
    status: "in-progress",
  },
  {
    id: "4",
    title: "Green Campus Energy Optimizer",
    domain: "Sustainability",
    description:
      "IoT dashboard that predicts classroom energy demand and suggests efficient lighting and cooling schedules.",
    originalityScore: 88,
    meta: "2026",
    status: "in-progress",
  },
];

const allTimeProjects: OriginalProjectItem[] = [
  thisYearProjects[0],
  thisYearProjects[1],
  thisYearProjects[2],
  {
    id: "5",
    title: "Blockchain-Based Degree Verification",
    domain: "Blockchain",
    description:
      "Decentralized platform for issuing and verifying academic credentials using smart contracts.",
    originalityScore: 94,
    meta: "2025",
    status: "completed",
  },
];

export function PopularProjects() {
  return <OriginalProjectsSection thisYearProjects={thisYearProjects} allTimeProjects={allTimeProjects} />;
}

export function OriginalProjectsSection({
  thisYearProjects,
  allTimeProjects,
  actionLabel = "View Details",
  viewAllHref = "/projects",
}: {
  thisYearProjects: OriginalProjectItem[];
  allTimeProjects: OriginalProjectItem[];
  actionLabel?: string;
  viewAllHref?: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Most Original Projects
        </h3>
        <Link href={viewAllHref}>
          <Button
            variant="ghost"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-500/10"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="this-year" className="w-full">
        <TabsList className="w-full justify-start mb-6 bg-muted/50">
          <TabsTrigger value="this-year">This Year</TabsTrigger>
          <TabsTrigger value="all-time">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value="this-year">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {thisYearProjects.map((project) => (
              <OriginalProjectCard
                key={project.id}
                project={project}
                actionLabel={actionLabel}
                href={`/projects/${project.id}`}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all-time">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allTimeProjects.map((project) => (
              <OriginalProjectCard
                key={project.id}
                project={project}
                actionLabel={actionLabel}
                href={`/projects/${project.id}`}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
