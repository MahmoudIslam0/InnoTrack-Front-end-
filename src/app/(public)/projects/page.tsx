"use client";

import { useState } from "react";
import { Search, X, Calendar, Archive } from "lucide-react";
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
  originality: number;
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
    originality: 85,
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
    originality: 78,
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
    originality: 92,
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
    originality: 88,
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
    originality: 75,
  },
];

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [requestDialogProject, setRequestDialogProject] = useState<Project | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter states
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDomain, setFilterDomain] = useState<string>("");
  const [filterSupervisor, setFilterSupervisor] = useState<string>("");
  const [filterTechnology, setFilterTechnology] = useState<string>("");
  const [filterMinOriginality, setFilterMinOriginality] = useState<string>("");

  const hasTeam = false;

  const currentYear = 2026;
  const thisYearProjects = allProjects.filter((p) => p.year === currentYear);
  const oldProjects = allProjects.filter((p) => p.year < currentYear);

  // Extract unique values for filter dropdowns
  const uniqueYears = Array.from(new Set(allProjects.map(p => p.year))).sort((a, b) => b - a);
  const uniqueStatuses = Array.from(new Set(allProjects.map(p => p.status)));
  const uniqueDomains = Array.from(new Set(allProjects.map(p => p.category))).sort();
  const uniqueSupervisors = Array.from(new Set(allProjects.map(p => p.supervisor))).sort();
  const uniqueTechnologies = Array.from(new Set(allProjects.flatMap(p => p.technologies))).sort();

  const filterProjects = (projects: Project[]) => {
    return projects.filter((p) => {
      // Search query filter
      const matchesSearch = !searchQuery || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.students.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      // Year filter
      const matchesYear = !filterYear || p.year.toString() === filterYear;

      // Status filter
      const matchesStatus = !filterStatus || p.status === filterStatus;

      // Domain filter
      const matchesDomain = !filterDomain || p.category === filterDomain;

      // Supervisor filter
      const matchesSupervisor = !filterSupervisor || p.supervisor === filterSupervisor;

      // Technology filter
      const matchesTechnology = !filterTechnology || p.technologies.includes(filterTechnology);

      // Min Originality filter
      const matchesOriginality = !filterMinOriginality || p.originality >= parseInt(filterMinOriginality);

      return matchesSearch && matchesYear && matchesStatus && matchesDomain && matchesSupervisor && matchesTechnology && matchesOriginality;
    });
  };

  const hasActiveFilters = filterYear || filterStatus || filterDomain || filterSupervisor || filterTechnology || filterMinOriginality;

  const clearAllFilters = () => {
    setFilterYear("");
    setFilterStatus("");
    setFilterDomain("");
    setFilterSupervisor("");
    setFilterTechnology("");
    setFilterMinOriginality("");
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

      {/* Filters Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-card to-card/50 border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Advanced Filters</h3>
                <p className="text-sm text-muted-foreground">Refine your project search</p>
              </div>
              <div className="flex items-center gap-4">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
                {/* Slider Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {showFilters ? "Hide" : "Show"}
                  </span>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      showFilters
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                        showFilters ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-in fade-in duration-300">
                {/* Year Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Year</label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border/50 rounded-lg hover:border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-foreground font-medium"
                  >
                    <option value="">All Years</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border/50 rounded-lg hover:border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-foreground font-medium"
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Domain Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Domain</label>
                  <select
                    value={filterDomain}
                    onChange={(e) => setFilterDomain(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border/50 rounded-lg hover:border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-foreground font-medium"
                  >
                    <option value="">All Domains</option>
                    {uniqueDomains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>

                {/* Supervisor Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Supervisor</label>
                  <select
                    value={filterSupervisor}
                    onChange={(e) => setFilterSupervisor(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border/50 rounded-lg hover:border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-foreground font-medium"
                  >
                    <option value="">All Supervisors</option>
                    {uniqueSupervisors.map(supervisor => (
                      <option key={supervisor} value={supervisor}>{supervisor}</option>
                    ))}
                  </select>
                </div>

                {/* Technology Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Technology</label>
                  <select
                    value={filterTechnology}
                    onChange={(e) => setFilterTechnology(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border/50 rounded-lg hover:border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-foreground font-medium"
                  >
                    <option value="">All Technologies</option>
                    {uniqueTechnologies.map(tech => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>

                {/* Min Originality Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Min Originality</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filterMinOriginality}
                      onChange={(e) => setFilterMinOriginality(e.target.value)}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border/50 rounded-lg hover:border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-foreground placeholder:text-muted-foreground font-medium"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-8 bg-card border border-border/50 rounded-xl p-1 h-auto gap-1 w-fit">
          <TabsTrigger 
            value="current" 
            className="rounded-lg border border-transparent data-[state=active]:border-indigo-500/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/10 data-[state=active]:to-indigo-600/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 px-4 py-2.5 font-semibold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>This Year</span>
            <span className="ml-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold">
              {filterProjects(thisYearProjects).length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="old"
            className="rounded-lg border border-transparent data-[state=active]:border-indigo-500/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/10 data-[state=active]:to-indigo-600/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 px-4 py-2.5 font-semibold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            <span>Old Projects</span>
            <span className="ml-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold">
              {filterProjects(oldProjects).length}
            </span>
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
