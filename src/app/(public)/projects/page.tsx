"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCatalogCard, StatusTone } from "@/app/_components/DashboardUI";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  year: number;
  category: string;
  supervisor: string;
  status: string;
  technologies: string[];
  students: string[];
}

const allProjects: Project[] = [
  {
    id: "1",
    title: "Smart Campus Navigation System",
    year: 2026,
    category: "IoT & Mobile",
    supervisor: "Dr. Ahmed Hassan",
    status: "In Progress",
    technologies: ["React Native", "ARKit", "Firebase"],
    students: ["John Smith", "Sarah Ahmed"],
  },
  {
    id: "2",
    title: "Automated Exam Proctoring",
    year: 2026,
    category: "AI & Computer Vision",
    supervisor: "Dr. Fatima Ali",
    status: "In Progress",
    technologies: ["Python", "OpenCV", "YOLOv8"],
    students: ["Mohammed Ali", "Noor Hassan"],
  },
  {
    id: "3",
    title: "Blockchain-Based Degree Verification",
    year: 2025,
    category: "Blockchain",
    supervisor: "Dr. Omar Khalil",
    status: "Completed",
    technologies: ["Ethereum", "Solidity", "React"],
    students: ["Layla Ibrahim", "Youssef Mahmoud"],
  },
  {
    id: "4",
    title: "Mental Health Support Chatbot",
    year: 2025,
    category: "NLP & Healthcare",
    supervisor: "Dr. Huda Nasser",
    status: "Completed",
    technologies: ["GPT-4", "Node.js", "MongoDB"],
    students: ["Amira Saleh", "Karim Zaki"],
  },
  {
    id: "5",
    title: "E-Commerce Recommendation Engine",
    year: 2024,
    category: "Machine Learning",
    supervisor: "Dr. Tariq Ahmed",
    status: "Completed",
    technologies: ["Python", "TensorFlow", "Flask"],
    students: ["Dina Farouk", "Hassan Omar"],
  },
];

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [requestDialogProject, setRequestDialogProject] = useState<Project | null>(null);
  const [requestMessage, setRequestMessage] = useState("");

  const hasTeam = false; // Mocking student without a team

  const currentYear = 2026;
  const thisYearProjects = allProjects.filter((p) => p.year === currentYear);
  const oldProjects = allProjects.filter((p) => p.year < currentYear);

  const filterProjects = (projects: Project[]) => {
    if (!searchQuery) return projects;

    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.students.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
  };

  const getStatusTone = (status: string): StatusTone => {
    if (status === "Completed") return "completed";
    return "in-progress";
  };

  const handleRequestSubmit = () => {
    if (!requestMessage.trim()) {
      toast.error("Please provide a brief message for your request.");
      return;
    }
    toast.success(`Request sent to team ${requestDialogProject?.title}`);
    setRequestDialogProject(null);
    setRequestMessage("");
  };

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
            Old Projects ({oldProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterProjects(thisYearProjects).map((project) => (
              <ProjectCatalogCard
                key={project.id}
                project={{
                  id: project.id,
                  title: project.title,
                  category: project.category,
                  status: getStatusTone(project.status),
                  year: project.year,
                  supervisor: project.supervisor,
                  students: project.students,
                  technologies: project.technologies,
                }}
                href={`/projects/${project.id}`}
                secondaryActionLabel={!hasTeam && project.status === "In Progress" ? "Request to Join" : undefined}
                onSecondaryAction={!hasTeam && project.status === "In Progress" ? () => setRequestDialogProject(project) : undefined}
              />
            ))}
          </div>
          {filterProjects(thisYearProjects).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="old">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterProjects(oldProjects).map((project) => (
              <ProjectCatalogCard
                key={project.id}
                project={{
                  id: project.id,
                  title: project.title,
                  category: project.category,
                  status: getStatusTone(project.status),
                  year: project.year,
                  supervisor: project.supervisor,
                  students: project.students,
                  technologies: project.technologies,
                }}
                href={`/projects/${project.id}`}
                secondaryActionLabel={!hasTeam && project.status === "In Progress" ? "Request to Join" : undefined}
                onSecondaryAction={!hasTeam && project.status === "In Progress" ? () => setRequestDialogProject(project) : undefined}
              />
            ))}
          </div>
          {filterProjects(oldProjects).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!requestDialogProject} onOpenChange={(open) => !open && setRequestDialogProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Join Team</DialogTitle>
            <DialogDescription>
              Write a message to the team leader of <strong>{requestDialogProject?.title}</strong> explaining why you are a good fit for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="e.g. I have experience in React Native and would love to contribute..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogProject(null)}>Cancel</Button>
            <Button onClick={handleRequestSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white">Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
