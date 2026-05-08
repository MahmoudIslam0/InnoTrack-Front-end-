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
  UserPlus,
  Timer,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  KeyRound,
  Mail,
  Phone,
  GraduationCap,
  Building2,
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
const isTeamLeader = true;

interface ActiveProject {
  id: string;
  title: string;
  team: string;
  supervisor: string;
  status: "approved" | "in-progress";
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

interface AvailableStudent {
  id: string;
  name: string;
  department: string;
  gpa: number;
  skills: string[];
}

const mockAvailableStudents: AvailableStudent[] = [
  { id: "s1", name: "Alice Johnson", department: "Computer Science", gpa: 3.9, skills: ["React", "Node.js", "TypeScript"] },
  { id: "s2", name: "Omar Khalid", department: "Software Engineering", gpa: 3.7, skills: ["Python", "Machine Learning", "Data Analysis"] },
  { id: "s3", name: "Sara Ali", department: "Information Systems", gpa: 3.5, skills: ["Figma", "UI/UX", "Frontend"] },
];

interface JoinRequest {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  major: string;
  email: string;
  phone: string;
  message: string;
  date: string;
}

const mockJoinRequests: JoinRequest[] = [
  { id: "r1", studentId: "s4", studentName: "Kareem Hassan", department: "Computer Science", major: "Artificial Intelligence", email: "kareem.hassan@university.edu", phone: "+20 1012345678", message: "I have experience with React Native and ARKit. I think I would be a great fit!", date: "2 hours ago" },
];

function getProjectStatusLabel(status: ActiveProject["status"]) {
  return status === "in-progress" ? "In Progress" : "Approved";
}

function getProjectStatusClasses(status: ActiveProject["status"]) {
  return status === "in-progress"
    ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
}

export default function ProjectManagement() {
  const [drafts, setDrafts] = useState(savedDrafts);
  const [project, setProject] = useState(activeProject);
  
  const [isJoinCodeDialogOpen, setIsJoinCodeDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSavedDraftsOpen, setIsSavedDraftsOpen] = useState(true);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const router = useRouter();

  const [availableStudents] = useState<AvailableStudent[]>(mockAvailableStudents);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(mockJoinRequests);
  const [selectedStudent, setSelectedStudent] = useState<AvailableStudent | JoinRequest | null>(null);
  const [denyRequestId, setDenyRequestId] = useState<string | null>(null);
  const [denyFeedback, setDenyFeedback] = useState("");

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      
      // Auto-join simulation at 50s
      if (countdown === 50) {
        setProject((prev) => ({
          ...prev,
          members: [
            ...prev.members,
            { name: "Jane Doe", role: "Member" }
          ]
        }));
        toast.success("Jane Doe joined the project team!");
        setIsJoinCodeDialogOpen(false);
        setJoinCode(null);
        setCountdown(0);
      }
      return () => clearTimeout(timer);
    } else if (countdown === 0 && joinCode) {
      setJoinCode(null);
      toast.info("Join code expired.");
    }
  }, [countdown, joinCode]);

  const handleGenerateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setJoinCode(code);
    setCountdown(60);
    setCopied(false);
  };

  const handleCopy = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Join code copied to clipboard");
    }
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    setIsJoinCodeDialogOpen(false);
  };

  const handleDeleteDraft = (draftId: string) => {
    setDrafts(drafts.filter((d) => d.id !== draftId));
    toast.success("Draft deleted successfully");
  };

  const handleApproveRequest = (requestId: string) => {
    const req = joinRequests.find(r => r.id === requestId);
    if (req) {
      setProject(prev => ({ ...prev, members: [...prev.members, { name: req.studentName, role: "Member" }] }));
      setJoinRequests(joinRequests.filter(r => r.id !== requestId));
      toast.success(`${req.studentName} has been added to your team!`);
    }
  };

  const handleJoinByCode = () => {
    if (!joinCodeInput.trim()) {
      toast.error("Please enter a valid join code.");
      return;
    }
    toast.success("Successfully joined the project!");
    router.push("/team-chat");
  };

  const handleDenyRequest = () => {
    if (denyRequestId) {
      setJoinRequests(joinRequests.filter(r => r.id !== denyRequestId));
      toast.success("Join request denied. Feedback sent to the student.");
      setDenyRequestId(null);
      setDenyFeedback("");
    }
  };

  const handleInviteStudent = (studentName: string) => {
    toast.success(`Invitation sent to ${studentName}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-1">
          Project Management
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Submit new ideas or manage your existing projects and drafts
        </p>
      </div>

      <Tabs defaultValue="submit-idea" className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none mb-6 md:mb-8">
          <TabsList className="inline-flex w-max md:w-full bg-muted/60 border border-border/50 rounded-2xl p-1.5 gap-1 shadow-sm min-w-full">
            <TabsTrigger
              value="submit-idea"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/25 flex-1"
            >
              <Lightbulb className="w-4 h-4 shrink-0" />
              <span>Submit Idea</span>
            </TabsTrigger>
            <TabsTrigger
              value="my-projects"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/25 flex-1"
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">My Projects</span>
              <span className="sm:hidden">Projects</span>
            </TabsTrigger>
            <TabsTrigger
              value="submitted-projects"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/25 flex-1"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Submitted</span>
              <span className="sm:hidden">Done</span>
            </TabsTrigger>
            {isTeamLeader && (
              <TabsTrigger
                value="join-requests"
                className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/25 flex-1"
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Requests</span>
                <span className="sm:hidden">Requests</span>
                {joinRequests.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shrink-0">
                    {joinRequests.length}
                  </span>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="join-by-code"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/25 flex-1"
            >
              <KeyRound className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Join by Code</span>
              <span className="sm:hidden">Join</span>
            </TabsTrigger>
          </TabsList>
        </div>


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
                        Team: {project.team} · Supervisor:{" "}
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
                      <span>{project.members.length} members</span>
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
                    {project.members.map((member) => (
                      <div
                        key={member.name}
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50"
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
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 text-muted-foreground"
                          >
                            Member
                          </Badge>
                        )}
                      </div>
                    ))}
                    
                    {isTeamLeader && (
                      <Dialog open={isJoinCodeDialogOpen} onOpenChange={setIsJoinCodeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg border-dashed">
                            <UserPlus className="w-3.5 h-3.5" />
                            <span className="text-xs">Add Member</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Team Member</DialogTitle>
                            <DialogDescription>
                              Invite a student to join your project team.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col gap-6 py-4">
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium">Invite via Email</h4>
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="student@university.edu" 
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                />
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleInvite}>
                                  Send
                                </Button>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                  Or use join code
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Generate Temporary Code</h4>
                                {countdown > 0 && (
                                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Timer className="w-3 h-3" />
                                    {countdown}s remaining
                                  </span>
                                )}
                              </div>
                              
                              {joinCode ? (
                                <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
                                  <span className="text-2xl font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-400">{joinCode}</span>
                                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="outline" className="w-full" onClick={handleGenerateCode}>
                                  Generate 6-Digit Code
                                </Button>
                              )}
                              
                              <p className="text-xs text-muted-foreground mt-2">
                                Code expires in 60 seconds.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
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
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 text-base"
            >
              <Link href="/project-submission">
                <Lightbulb className="w-5 h-5 mr-2" />
                Start New Submission
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* ─── Tab 4: Join Requests ─── */}
        <TabsContent value="join-requests">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Pending Requests to Join Your Team</h2>
            {joinRequests.length === 0 ? (
              <div className="bg-card text-card-foreground rounded-xl border border-border/50 p-8 text-center">
                <p className="text-muted-foreground">No pending join requests.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {joinRequests.map(req => (
                  <div key={req.id} className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-lg">
                          {req.studentName[0]}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{req.studentName}</h4>
                          <p className="text-xs text-muted-foreground">{req.department} · Requested {req.date}</p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg text-sm text-foreground italic border border-border/50">
                        &quot;{req.message}&quot;
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setSelectedStudent(req)}>
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20" onClick={() => setDenyRequestId(req.id)}>
                        Deny
                      </Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApproveRequest(req.id)}>
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Tab 5: Join by Code ─── */}
        <TabsContent value="join-by-code">
          <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-8 md:p-10 text-center max-w-xl mx-auto mt-8">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <KeyRound className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Have a Join Code?
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter the join code provided by your team leader to instantly join the project team and access the team workspace.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <Input 
                placeholder="e.g. NOVA-26" 
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                className="h-12"
              />
              <Button onClick={handleJoinByCode} className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white">
                Join Team
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Profile Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="py-4 space-y-6">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                  {('studentName' in selectedStudent ? selectedStudent.studentName : selectedStudent.name).split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {'studentName' in selectedStudent ? selectedStudent.studentName : selectedStudent.name}
                  </h3>
                  <p className="text-muted-foreground">{selectedStudent.department}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <Building2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground block">Department</span>
                    <span className="text-sm font-semibold text-foreground">{selectedStudent.department}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <GraduationCap className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground block">Major</span>
                    <span className="text-sm font-semibold text-foreground">
                      {'major' in selectedStudent ? selectedStudent.major : 'Computer Science'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs text-muted-foreground block">Email</span>
                    <span className="text-sm font-semibold text-foreground truncate block">
                      {'email' in selectedStudent ? selectedStudent.email : 'student@university.edu'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <Phone className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground block">Phone</span>
                    <span className="text-sm font-semibold text-foreground">
                      {'phone' in selectedStudent ? selectedStudent.phone : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* GPA + Year */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <span className="text-xs text-muted-foreground block">GPA</span>
                  <span className="font-semibold text-foreground">
                    {'gpa' in selectedStudent ? selectedStudent.gpa : '3.8'}
                  </span>
                </div>
                <div className="space-y-1 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <span className="text-xs text-muted-foreground block">Current Year</span>
                  <span className="font-semibold text-foreground">4th Year</span>
                </div>
              </div>

              {/* Technical Skills */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {('skills' in selectedStudent ? selectedStudent.skills : ['React', 'Node.js', 'Python']).map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deny Request Dialog */}
      <Dialog open={!!denyRequestId} onOpenChange={(open) => !open && setDenyRequestId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Join Request</DialogTitle>
            <DialogDescription>
              Please provide feedback to the student on why their request is being denied. This helps them improve for future opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="feedback" className="mb-2 block">Feedback Message</Label>
            <Textarea 
              id="feedback"
              placeholder="e.g. We are looking for someone with more experience in backend development..."
              className="min-h-[100px]"
              value={denyFeedback}
              onChange={(e) => setDenyFeedback(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDenyRequestId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDenyRequest}>Deny Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
