"use client";

import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, XCircle, Users,
  X, UserMinus, History, FileText, Award,
  Clock, Info, Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { OriginalityMeter, StatusBadge } from "../_components";
import { Project, teams as initialTeams } from "../_data";

interface ManageProjectDialogProps {
  project: Project | null;
  defaultTab?: "overview" | "team" | "logs";
  onOpenChange: (open: boolean) => void;
  onApproveProposal: (id: string) => void;
  onRejectProposal: (id: string) => void;
  onAcceptSubmission: (id: string) => void;
  onRejectSubmission: (id: string) => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  by: string;
  type: "approval" | "rejection" | "edit" | "member" | "info";
}

const initialLogs: Record<string, LogEntry[]> = {
  p1: [
    { id: "l1", timestamp: "2026-04-29 11:05", action: "Proposal rejected — needs revision.", by: "Dr. Leila Hassan", type: "rejection" },
    { id: "l2", timestamp: "2026-04-29 09:00", action: "Project submitted for proposal review.", by: "John Smith", type: "info" },
  ],
  p2: [
    { id: "l3", timestamp: "2026-04-24 09:45", action: "Proposal approved.", by: "Dr. Leila Hassan", type: "approval" },
    { id: "l4", timestamp: "2026-04-21 10:00", action: "Project submitted for proposal review.", by: "Mohammed Ali", type: "info" },
  ],
  p3: [
    { id: "l5", timestamp: "2026-04-30 14:20", action: "Final submission accepted.", by: "Dr. Leila Hassan", type: "approval" },
    { id: "l6", timestamp: "2026-04-26 08:30", action: "Final submission uploaded.", by: "Amira Saleh", type: "info" },
  ],
  p4: [
    { id: "l7", timestamp: "2026-04-30 09:00", action: "Project submitted for proposal review.", by: "Care Loop Leader", type: "info" },
  ],
};

export function ManageProjectDialog({
  project,
  defaultTab = "team",
  onOpenChange,
  onApproveProposal,
  onRejectProposal,
  onAcceptSubmission,
  onRejectSubmission,
}: ManageProjectDialogProps) {
  const [teamSizeLimit, setTeamSizeLimit] = useState("4");
  const [feedback, setFeedback] = useState("");
  const [decisionMode, setDecisionMode] = useState<string | null>(null);
  const [localTeams, setLocalTeams] = useState(initialTeams);
  const [logs, setLogs] = useState<Record<string, LogEntry[]>>(initialLogs);

  const team = project ? localTeams.find(t => t.projectId === project.id) : null;
  const projectLogs = project ? (logs[project.id] ?? []) : [];

  const isRejecting = decisionMode === "reject-proposal" || decisionMode === "reject-submission";
  const cannotConfirm = isRejecting && !feedback.trim();

  const addLog = (projectId: string, action: string, type: LogEntry["type"]) => {
    const entry: LogEntry = {
      id: `l${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }),
      action,
      by: "Dr. Leila Hassan",
      type,
    };
    setLogs(prev => ({ ...prev, [projectId]: [entry, ...(prev[projectId] ?? [])] }));
  };

  const handleClose = () => {
    setDecisionMode(null);
    setFeedback("");
    onOpenChange(false);
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!project) return;
    setLocalTeams(prev =>
      prev.map(t =>
        t.projectId === project.id
          ? { ...t, members: t.members.filter(m => m.id !== memberId) }
          : t
      )
    );
    addLog(project.id, `Member "${memberName}" removed from team.`, "member");
    toast.success(`${memberName} has been removed from the team.`);
  };

  const handleSaveTeamSize = () => {
    if (!project) return;
    toast.success(`Team size limit set to ${teamSizeLimit}.`);
    addLog(project.id, `Max team size updated to ${teamSizeLimit}.`, "edit");
  };

  const handleDecision = () => {
    if (!project || !decisionMode || cannotConfirm) return;
    if (decisionMode === "approve-proposal") {
      onApproveProposal(project.id);
      addLog(project.id, `Proposal approved.${feedback ? ` Feedback: ${feedback}` : ""}`, "approval");
      toast.success("Proposal approved!");
    } else if (decisionMode === "reject-proposal") {
      onRejectProposal(project.id);
      addLog(project.id, `Proposal rejected. Feedback: ${feedback}`, "rejection");
      toast.error("Proposal rejected.");
    } else if (decisionMode === "accept-submission") {
      onAcceptSubmission(project.id);
      addLog(project.id, `Final submission accepted.${feedback ? ` Feedback: ${feedback}` : ""}`, "approval");
      toast.success("Submission accepted!");
    } else if (decisionMode === "reject-submission") {
      onRejectSubmission(project.id);
      addLog(project.id, `Final submission rejected. Feedback: ${feedback}`, "rejection");
      toast.error("Submission rejected.");
    }
    setDecisionMode(null);
    setFeedback("");
  };

  const logIcon = (type: LogEntry["type"]) => {
    if (type === "approval") return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (type === "rejection") return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
    if (type === "member") return <Users className="w-4 h-4 text-purple-500 shrink-0" />;
    if (type === "edit") return <Save className="w-4 h-4 text-blue-500 shrink-0" />;
    return <Info className="w-4 h-4 text-muted-foreground shrink-0" />;
  };

  return (
    <Dialog open={Boolean(project)} onOpenChange={handleClose}>
     <DialogContent className="w-[min(1100px,calc(100vw-32px))] sm:max-w-none max-h-[90vh] border-border/50 p-0 shadow-xl flex flex-col [&>button]:hidden">
        {project && (
          <>
            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-5 border-b border-border/50 bg-muted/40">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <DialogTitle className="text-xl font-semibold text-foreground">{project.title}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">{project.team} · {project.domain}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={project.status} />
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{project.originalityScore}%</span>
                  </div>
                  <button
                    onClick={handleClose}
                    className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border/50 transition-all duration-150"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </DialogHeader>

            {/* Tabs */}
            <div className="px-6 pb-6 pt-4">
              <Tabs defaultValue={defaultTab}>
                <TabsList className="mb-5 bg-muted/60 border border-border/50 rounded-xl p-1">
                  <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-sm">
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> Overview
                  </TabsTrigger>
                  <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-sm">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Team
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-sm">
                    <History className="w-3.5 h-3.5 mr-1.5" /> Activity Log
                  </TabsTrigger>
                </TabsList>

                {/* ── OVERVIEW TAB ── */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Project details */}
                    <div className="lg:col-span-2 space-y-5">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Abstract</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{project.abstract}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map(t => (
                            <span key={t} className="px-2.5 py-1 bg-muted text-foreground text-xs rounded-md font-medium">{t}</span>
                          ))}
                        </div>
                      </div>
                      {/* Similar Projects */}
                      {project.similarProjects.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Similar Projects</h4>
                          <div className="space-y-2">
                            {project.similarProjects.map(sp => (
                              <div key={sp.title} className="flex items-start justify-between gap-3 p-3 bg-muted/40 rounded-lg border border-border/50">
                                <div>
                                  <p className="text-xs font-medium text-foreground">{sp.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{sp.reason}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0">{sp.similarity}%</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Originality + Decisions */}
                    <div className="space-y-4">
                      <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <OriginalityMeter score={project.originalityScore} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted/40 rounded-lg border border-border/50">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        Submitted: {new Date(project.submittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </div>

                      {/* Proposal decision */}
                      {project.status === "draft" && !decisionMode && (
                        <div className="p-4 bg-card rounded-xl border border-border/50 space-y-2">
                          <h4 className="text-sm font-semibold text-foreground mb-3">Proposal Decision</h4>
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setDecisionMode("approve-proposal")}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Proposal
                          </Button>
                          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20" onClick={() => setDecisionMode("reject-proposal")}>
                            <XCircle className="w-4 h-4 mr-2" /> Reject Proposal
                          </Button>
                        </div>
                      )}

                      {/* Submission decision */}
                      {project.status === "submitted" && !decisionMode && (
                        <div className="p-4 bg-card rounded-xl border border-border/50 space-y-2">
                          <h4 className="text-sm font-semibold text-foreground mb-3">Submission Decision</h4>
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setDecisionMode("accept-submission")}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Submission
                          </Button>
                          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20" onClick={() => setDecisionMode("reject-submission")}>
                            <XCircle className="w-4 h-4 mr-2" /> Reject Submission
                          </Button>
                        </div>
                      )}

                      {/* Decision feedback form */}
                      {decisionMode && (
                        <div className="p-4 bg-muted rounded-xl border border-border/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-foreground capitalize">
                              {decisionMode.replace(/-/g, " ")}
                            </h4>
                            <button
                              onClick={() => { setDecisionMode(null); setFeedback(""); }}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <Textarea
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            placeholder={isRejecting ? "Explain what needs to be revised (required)..." : "Add optional notes for the team..."}
                            className="min-h-[80px] resize-none text-sm"
                          />
                          {cannotConfirm && (
                            <p className="text-xs text-red-500">Feedback is required for rejection.</p>
                          )}
                          <Button
                            className={`w-full text-white ${isRejecting ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
                            onClick={handleDecision}
                            disabled={cannotConfirm}
                          >
                            {isRejecting
                              ? <AlertTriangle className="w-4 h-4 mr-2" />
                              : <CheckCircle2 className="w-4 h-4 mr-2" />
                            }
                            Confirm
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* ── TEAM TAB ── */}
                <TabsContent value="team" className="space-y-5">
                  {/* Team size limit */}
                  <div className="p-4 bg-card rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-sm font-semibold text-foreground">Team Size Limit</h4>
                    </div>
                    <div className="flex gap-2 max-w-xs">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={teamSizeLimit}
                        onChange={e => setTeamSizeLimit(e.target.value)}
                        className="h-9"
                      />
                      <Button size="sm" className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveTeamSize}>
                        <Save className="w-3.5 h-3.5 mr-1.5" /> Save
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Current team has {team?.members.length ?? 0} member(s). Limit is {teamSizeLimit}.
                    </p>
                  </div>

                  {/* Members list */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Team Members</h4>
                    {!team || team.members.length === 0 ? (
                      <div className="p-6 text-center bg-muted/40 rounded-xl border border-border/50">
                        <p className="text-sm text-muted-foreground">No members in this team yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {team.members.map(member => (
                          <div key={member.id} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 hover:border-indigo-500/30 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.role} · GPA {member.gpa}</p>
                              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <Badge
                                variant="outline"
                                className={member.role === "Leader"
                                  ? "text-indigo-600 border-indigo-500/30 text-[10px]"
                                  : "text-muted-foreground text-[10px]"
                                }
                              >
                                {member.role}
                              </Badge>
                              {member.role !== "Leader" && (
                                <button
                                  onClick={() => handleRemoveMember(member.id, member.name)}
                                  className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <UserMinus className="w-3 h-3" /> Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Skills overview */}
                  {team && team.members.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Team Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(team.members.flatMap(m => m.skills))].map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs rounded-md font-medium border border-indigo-500/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* ── ACTIVITY LOG TAB ── */}
                <TabsContent value="logs">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">All changes and decisions made for this project.</p>
                    {projectLogs.length === 0 ? (
                      <div className="p-8 text-center bg-muted/40 rounded-xl border border-border/50">
                        <History className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No activity logged yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {projectLogs.map(entry => (
                          <div key={entry.id} className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border/50">
                            <div className="mt-0.5">{logIcon(entry.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground">{entry.action}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">By {entry.by} · {entry.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

           
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
