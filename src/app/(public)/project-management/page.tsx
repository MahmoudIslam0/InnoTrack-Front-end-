"use client";

import { useState, useEffect } from "react";
import {
  Lightbulb,
  FolderOpen,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  Award,
  ShieldCheck,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { toast } from "sonner";

// Mock data — current user is team leader
interface ActiveProject {
  id: string;
  title: string;
  team: string;
  supervisor: string;
  status: "approved" | "in-progress" | "cancelled";
  originalityScore: number;
  submittedAt: string;
  approvedAt: string;
  technologies: string[];
  members: { name: string; role: "Leader" | "Member" }[];
}

interface Draft {
  id: string;
  title: string;
  date: string;
  originalityScore: number;
  lastEdited: string;
}

interface StoredTeam {
  id: string;
  name: string;
  leaderId?: string;
  members?: string[];
  supervisorName?: string;
}

const activeProject: ActiveProject = {
  id: "p1",
  title: "Smart Campus Navigation System",
  team: "Nova Path",
  supervisor: "Dr. Ahmed Hassan",
  status: "in-progress",
  originalityScore: 85,
  submittedAt: "2026-02-15",
  approvedAt: "2026-02-20",
  technologies: ["React Native", "ARKit", "Firebase"],
  members: [
    { name: "John Smith", role: "Leader" },
    { name: "Sarah Ahmed", role: "Member" },
  ],
};

const savedDrafts: Draft[] = [
  {
    id: "d1",
    title: "AI-Powered Learning Assistant",
    date: "2026-04-25",
    originalityScore: 72,
    lastEdited: "2 days ago",
  },
  {
    id: "d2",
    title: "Blockchain Voting System",
    date: "2026-04-18",
    originalityScore: 0,
    lastEdited: "1 week ago",
  },
];

function getProjectStatusLabel(status: ActiveProject["status"]) {
  if (status === "cancelled") return "Cancelled";
  return status === "in-progress" ? "In Progress" : "Approved";
}

function getProjectStatusClasses(status: ActiveProject["status"]) {
  if (status === "cancelled") {
    return "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20";
  }

  return status === "in-progress"
    ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
}

export default function ProjectManagement() {
  const [drafts, setDrafts] = useState(savedDrafts);
  const [project, setProject] = useState(activeProject);
  
  const [isSavedDraftsOpen, setIsSavedDraftsOpen] = useState(true);
  const [isAbandonDialogOpen, setIsAbandonDialogOpen] = useState(false);
  const [abandonReason, setAbandonReason] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] = useState(false);
  const router = useRouter();

  // Teams stored client-side (no backend endpoints per request)
  const [teams, setTeams] = useState<StoredTeam[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState(""); // comma-separated names
  const activeTeam = teams.find((team) => team.id === currentTeamId) || teams[0] || null;
  const projectTeamName = activeTeam?.name || project.team;
  const projectMembers =
    activeTeam
      ? normalizeTeamMembers(activeTeam.members || [], activeTeam.leaderId || "me").map((memberName) => ({
          name: displayMemberName(memberName),
          role: memberName === activeTeam.leaderId ? ("Leader" as const) : ("Member" as const),
        }))
      : project.members;
  const isTeamLeader = activeTeam ? activeTeam.leaderId === "me" : true;

  // Load teams from localStorage on mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem("teams") || "[]";
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const normalizedTeams = parsed.map((team) => normalizeStoredTeam(team));
          setTeams(normalizedTeams);
          localStorage.setItem("teams", JSON.stringify(normalizedTeams));
          if (normalizedTeams.length > 0) setCurrentTeamId(normalizedTeams[0].id || normalizedTeams[0].name);
        }
      } catch (e) {
        console.error("Failed to parse teams from localStorage", e);
      }
    });
  }, []);

  const handleCreateTeam = () => {
    const name = newTeamName.trim();
    if (!name) {
      toast.error("Please provide a team name.");
      return;
    }

    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const members = newTeamMembers
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Enforce one-team-per-student
    const memberToTeam: Record<string, string> = {};
    teams.forEach((t) => {
      (t.members || []).forEach((m) => {
        memberToTeam[m] = t.name;
      });
    });

    const conflicts = members.filter((m) => !!memberToTeam[m]);
    if (conflicts.length > 0) {
      toast.error(`Cannot add ${conflicts.join(", ")} — already in another team.`);
      return;
    }

    const teamObj = { id, name, leaderId: "me", members: normalizeTeamMembers(members, "me") };
    const updated = [...teams, teamObj];
    setTeams(updated);
    localStorage.setItem("teams", JSON.stringify(updated));
    setIsCreateTeamOpen(false);
    setNewTeamName("");
    setNewTeamMembers("");
    setCurrentTeamId(id);
    toast.success(`Team "${name}" created.`);
  };

  const handleDeleteDraft = (draftId: string) => {
    setDrafts(drafts.filter((d) => d.id !== draftId));
    toast.success("Draft deleted successfully");
  };

  const handleRemoveMember = (memberName: string) => {
    setMemberToRemove(memberName);
    setIsRemoveMemberDialogOpen(true);
  };

  const handleConfirmRemoveMember = () => {
    if (!memberToRemove) return;

    const leaderName = activeTeam?.leaderId ? displayMemberName(activeTeam.leaderId) : "John Smith";
    if (memberToRemove !== leaderName) {
      if (activeTeam) {
        const updatedTeams = teams.map((team) =>
          team.id === activeTeam.id
            ? {
                ...team,
                members: (team.members || []).filter(
                  (member) => displayMemberName(member) !== memberToRemove,
                ),
              }
            : team,
        );
        setTeams(updatedTeams);
        localStorage.setItem("teams", JSON.stringify(updatedTeams));
      } else {
        setProject(prev => ({
          ...prev,
          members: prev.members.filter(m => m.name !== memberToRemove)
        }));
      }
      
      // Also remove from team chat
      const removedMembers = JSON.parse(localStorage.getItem("removedTeamMembers") || "[]");
      removedMembers.push(memberToRemove);
      localStorage.setItem("removedTeamMembers", JSON.stringify(removedMembers));
      
      toast.success(`${memberToRemove} has been removed from the team and team chat.`);
      setIsRemoveMemberDialogOpen(false);
      setMemberToRemove(null);
    } else if (memberToRemove === leaderName) {
      toast.error("Cannot remove the team leader.");
    }
  };

  const handleAbandonProject = () => {
    if (!abandonReason.trim()) {
      toast.error("Please provide a reason for abandoning the project.");
      return;
    }
    
    // Store abandonment info in localStorage for team chat to pick up
    const abandonmentInfo = {
      projectTitle: project.title,
      reason: abandonReason,
      teamLeader: "John Smith",
      timestamp: new Date().toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: true 
      })
    };
    localStorage.setItem("projectAbandonment", JSON.stringify(abandonmentInfo));
    
    toast.success("Project abandoned. Your supervisor has been notified with your reason.");
    setIsAbandonDialogOpen(false);
    setAbandonReason("");
    setProject(prev => ({ ...prev, status: "cancelled" }));
    setTimeout(() => router.push("/project-management"), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
          Project Management
        </h1>
        <p className="text-muted-foreground">
          Submit new ideas or manage your existing projects and drafts
        </p>
      </div>

      <Tabs defaultValue="submit-idea" className="w-full">
        <TabsList className="mb-8 bg-transparent flex-wrap gap-2 h-auto p-0 justify-start">
          <TabsTrigger 
            value="submit-idea" 
            className="gap-2 rounded-lg border border-border/50 bg-card hover:bg-card/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/10 data-[state=active]:to-indigo-600/10 data-[state=active]:border-indigo-500/30 px-4 py-2.5 font-medium text-foreground data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all"
          >
            <Lightbulb className="w-4 h-4" />
            New Idea
          </TabsTrigger>
          <TabsTrigger 
            value="my-projects" 
            className="gap-2 rounded-lg border border-border/50 bg-card hover:bg-card/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/10 data-[state=active]:to-indigo-600/10 data-[state=active]:border-indigo-500/30 px-4 py-2.5 font-medium text-foreground data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all"
          >
            <FolderOpen className="w-4 h-4" />
            My Projects
          </TabsTrigger>
          <TabsTrigger 
            value="submitted-projects" 
            className="gap-2 rounded-lg border border-border/50 bg-card hover:bg-card/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/10 data-[state=active]:to-indigo-600/10 data-[state=active]:border-indigo-500/30 px-4 py-2.5 font-medium text-foreground data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            Submitted
          </TabsTrigger>
        </TabsList>

               {/* ─── Tab 3: Submit New Idea ─── */}
        <TabsContent value="submit-idea">
          <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-8 md:p-10 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <Lightbulb className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Submit a New Project Idea
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
              Share your innovative graduation project idea and get instant
              feedback on originality. Our AI-powered system helps you avoid
              redundancy and ensures your project stands out.
            </p>
            <div>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 text-base"
                onClick={() => {
                  if (!teams || teams.length === 0) {
                    setIsCreateTeamOpen(true);
                  } else {
                    const tid = currentTeamId || teams[0].id;
                    router.push(`/project-submission?teamId=${tid}`);
                  }
                }}
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Start New Submission
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {(!teams || teams.length === 0) ? (
                <p className="text-sm text-muted-foreground mt-3">
                  You must create a team before submitting a project. 
                  <button className="ml-1 underline text-sm" onClick={() => setIsCreateTeamOpen(true)}>Create a team</button>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-3">
                  Submitting as <strong>{teams.find(t => t.id === currentTeamId)?.name || teams[0].name}</strong> — you can change teams later.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── Tab 1: My Projects ─── */}
        <TabsContent value="my-projects">
          <div className="space-y-8">
            {/* Active Project */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Active Project
              </h2>
              <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {project.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={getProjectStatusClasses(project.status)}
                        >
                          {getProjectStatusLabel(project.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Team: {projectTeamName} · Supervisor:{" "}
                        {project.supervisor}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20">
                      <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {project.originalityScore}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Originality
                      </span>
                    </div>
                  </div>

                  {/* Project meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        Submitted:{" "}
                        {new Date(
                          project.submittedAt
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        Approved:{" "}
                        {new Date(
                          project.approvedAt
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{projectMembers.length} members</span>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 bg-muted text-foreground text-xs rounded-md font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Team Members */}
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    {projectMembers.map((member) => (
                      <div
                        key={member.name}
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50 group"
                      >
                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {member.name}
                        </span>
                        {member.role === "Leader" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400"
                          >
                            Leader
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 text-muted-foreground"
                            >
                              Member
                            </Badge>
                            {isTeamLeader && (
                              <button
                                onClick={() => handleRemoveMember(member.name)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                title="Remove member"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-600" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {isTeamLeader && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
                      <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Link
                          href={`/project-submission?edit=${project.id}&mode=details-only`}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Project Details
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/projects/1`}>
                          <FileText className="w-4 h-4 mr-2" />
                          View Full Project
                        </Link>
                      </Button>
                      <Dialog open={isAbandonDialogOpen} onOpenChange={setIsAbandonDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="ml-auto">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Abandon Project
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-red-600">Abandon Project</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to abandon this project? This action cannot be undone and all progress will be marked as abandoned.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="abandon-reason" className="text-foreground font-medium mb-2">
                                Reason for abandoning (required)
                              </Label>
                              <Textarea
                                id="abandon-reason"
                                placeholder="Please explain why you're abandoning this project..."
                                value={abandonReason}
                                onChange={(e) => setAbandonReason(e.target.value)}
                                className="mt-2 min-h-[100px]"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setIsAbandonDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={handleAbandonProject}
                              disabled={!abandonReason.trim()}
                            >
                              Yes, Abandon Project
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                  {!isTeamLeader && (
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground italic">
                        Only the team leader can edit project details.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Saved Drafts */}
            <section>
              <button 
                className="flex items-center gap-2 w-full text-left focus:outline-none group mb-4"
                onClick={() => setIsSavedDraftsOpen(!isSavedDraftsOpen)}
              >
                <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 flex-1">
                  Saved Drafts
                  <span className="text-sm font-normal text-muted-foreground">
                    ({drafts.length})
                  </span>
                </h2>
                <div className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                  {isSavedDraftsOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </button>

              {isSavedDraftsOpen && (
                <>
                  {drafts.length === 0 ? (
                    <div className="bg-card text-card-foreground rounded-xl border border-border/50 p-8 text-center">
                      <p className="text-muted-foreground">
                        No saved drafts. Start a new idea!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {drafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">
                              {draft.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Edited {draft.lastEdited}
                              </span>
                              {draft.originalityScore > 0 && (
                                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                  {draft.originalityScore}% originality
                                </span>
                              )}
                              {draft.originalityScore === 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30"
                                >
                                  Not checked
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 sm:shrink-0">
                            {isTeamLeader ? (
                              <>
                                <Button asChild variant="outline" size="sm" className="h-9">
                                  <Link href={`/project-submission?edit=${draft.id}`}>
                                    <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                                    Resume
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                  onClick={() => handleDeleteDraft(draft.id)}
                                  aria-label="Delete draft"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button asChild variant="outline" size="sm" className="h-9">
                                <Link href={`/project-submission?draft=${draft.id}&mode=view`}>
                                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                                  View Draft
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </TabsContent>

        {/* ─── Tab 2: Submitted Projects ─── */}
        <TabsContent value="submitted-projects">
          <div className="space-y-4">
            <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">Smart Campus Navigation System</h3>
                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                      Submitted
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Submitted to Dr. Ahmed Hassan · Feb 15, 2026</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => toast.success("Submission recalled successfully.")}
                  >
                    Unsend Submission
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/projects/1">View Project</Link>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Originality Score</p>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">85%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Team</p>
                  <p className="text-sm font-medium text-foreground">Nova Path</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`text-sm font-medium ${project.status === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {project.status === "approved" ? "Approved" : project.status === "in-progress" ? "In Progress" : project.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Team Dialog */}
      <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Team</DialogTitle>
            <DialogDescription>
              Create a team to manage members and submit projects as a group.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="team-name" className="mb-2 block">Team Name</Label>
              <Input id="team-name" placeholder="e.g. Nova Path" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="team-members" className="mb-2 block">Team Members (comma-separated)</Label>
              <Textarea id="team-members" placeholder="John Smith, Sarah Ahmed" value={newTeamMembers} onChange={(e) => setNewTeamMembers(e.target.value)} className="min-h-[80px]" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTeam}>Create Team</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Remove Member Dialog */}
      <Dialog open={isRemoveMemberDialogOpen} onOpenChange={setIsRemoveMemberDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{memberToRemove}</strong> from the team? They will lose access to the project.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" onClick={() => setIsRemoveMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmRemoveMember}
            >
              Remove Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function displayMemberName(name: string) {
  if (name === "me") return "John Smith";
  return name;
}

function normalizeStoredTeam(value: unknown): StoredTeam {
  const item =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const leaderId = typeof item.leaderId === "string" ? item.leaderId : "me";
  const members = Array.isArray(item.members)
    ? item.members.filter((member): member is string => typeof member === "string")
    : [];

  return {
    id: typeof item.id === "string" ? item.id : `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: typeof item.name === "string" ? item.name : "Untitled Team",
    leaderId,
    supervisorName:
      typeof item.supervisorName === "string"
        ? item.supervisorName
        : typeof item.supervisor === "string"
          ? item.supervisor
          : undefined,
    members: normalizeTeamMembers(members, leaderId),
  };
}

function normalizeTeamMembers(members: string[], leaderId: string) {
  return [...new Set([leaderId, ...members].filter(Boolean))];
}
