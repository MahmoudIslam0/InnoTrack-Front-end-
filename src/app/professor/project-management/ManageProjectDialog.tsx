"use client";

import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, XCircle, Users,
  X, UserMinus, History, FileText, Award,
  Clock, Info, Save
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
import { formatPercent, normalizeStatusTone } from "@/lib/student-api";
import { professorApi } from "@/lib/professor-api";

interface ManageProjectDialogProps {
  project: any | null;
  teams: any[];
  defaultTab?: "overview" | "team" | "logs";
  onOpenChange: (open: boolean) => void;
  onApproveProposal: (id: string, feedback: string) => void;
  onRejectProposal: (id: string, feedback: string) => void;
  onAcceptSubmission: (id: string, feedback: string) => void;
  onRejectSubmission: (id: string, feedback: string) => void;
  onCancelSupervision?: (id: string, reason: string) => void;
  onRequestRevision?: (id: string, feedback: string) => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  by: string;
  type: "approval" | "rejection" | "edit" | "member" | "info" | "revision";
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
  teams,
  defaultTab = "team",
  onOpenChange,
  onApproveProposal,
  onRejectProposal,
  onAcceptSubmission,
  onRejectSubmission,
  onCancelSupervision,
  onRequestRevision,
}: ManageProjectDialogProps) {
  const [teamSizeLimit, setTeamSizeLimit] = useState("4");
  const [feedback, setFeedback] = useState("");
  const [decisionMode, setDecisionMode] = useState<string | null>(null);
  const [localTeams, setLocalTeams] = useState(teams);
  const [logs, setLogs] = useState<Record<string, LogEntry[]>>(initialLogs);
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  const team = project ? teams.find((t: any) => t.projectId === project.id) : null;
  const projectLogs = project ? (logs[project.id] ?? []) : [];

  const isRejecting = decisionMode === "reject-proposal" || decisionMode === "reject-submission" || decisionMode === "cancel-supervision" || decisionMode === "request-revision";
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
      prev.map((t: any) =>
        t.projectId === project.id
          ? { ...t, members: t.members.filter((m: any) => m.id !== memberId) }
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
      onApproveProposal(project.id, feedback);
      addLog(project.id, `Proposal approved.${feedback ? ` Feedback: ${feedback}` : ""}`, "approval");
    } else if (decisionMode === "reject-proposal") {
      onRejectProposal(project.id, feedback);
      addLog(project.id, `Proposal rejected. Feedback: ${feedback}`, "rejection");
    } else if (decisionMode === "accept-submission") {
      onAcceptSubmission(project.id, feedback);
      addLog(project.id, `Final submission accepted.${feedback ? ` Feedback: ${feedback}` : ""}`, "approval");
    } else if (decisionMode === "reject-submission") {
      onRejectSubmission(project.id, feedback);
      addLog(project.id, `Final submission rejected. Feedback: ${feedback}`, "rejection");
    } else if (decisionMode === "cancel-supervision") {
      onCancelSupervision?.(project.id, feedback);
      addLog(project.id, `Supervision cancelled. Reason: ${feedback}`, "rejection");
    } else if (decisionMode === "request-revision") {
      onRequestRevision?.(project.id, feedback);
      addLog(project.id, `Revision requested. Reason: ${feedback}`, "revision");
    }
    setDecisionMode(null);
    setFeedback("");
  };

  const logIcon = (type: LogEntry["type"]) => {
    if (type === "approval") return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (type === "rejection") return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
    if (type === "member") return <Users className="w-4 h-4 text-purple-500 shrink-0" />;
    if (type === "edit") return <Save className="w-4 h-4 text-blue-500 shrink-0" />;
    if (type === "revision") return <FileText className="w-4 h-4 text-orange-500 shrink-0" />;
    return <Info className="w-4 h-4 text-muted-foreground shrink-0" />;
  };

  const handleSendGeneralFeedback = async () => {
    if (!project || !generalFeedback.trim()) return;
    setIsSendingFeedback(true);
    try {
      await professorApi.addFeedback(project.id, generalFeedback);
      toast.success("Feedback sent to the team successfully.");
      addLog(project.id, `General feedback sent to team: "${generalFeedback}"`, "info");
      setGeneralFeedback("");
    } catch (e) {
      toast.error("Failed to send feedback.");
    } finally {
      setIsSendingFeedback(false);
    }
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
                  <p className="text-sm text-muted-foreground mt-1">{project.teamName || "No team"} · {project.domain}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={normalizeStatusTone(project.status) as any} />
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Math.round((project.originalityScore || 0) * 100)}%</span>
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
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
              <Tabs defaultValue={defaultTab}>
                <TabsList className="mb-5 bg-muted/60 border border-border/50 rounded-xl p-1">
                  <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-sm">
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> Overview
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-sm px-4 py-2">
                    <History className="w-4 h-4 mr-2" /> Activity Log
                  </TabsTrigger>
                </TabsList>

                {/* ── OVERVIEW TAB ── */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Project details */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                        <h4 className="text-sm font-bold text-foreground mb-3 tracking-wide uppercase opacity-80">Description</h4>
                        <p className="text-[15px] text-muted-foreground leading-relaxed">{project.description}</p>
                      </div>
                      
                      <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                        <h4 className="text-sm font-bold text-foreground mb-3 tracking-wide uppercase opacity-80">Abstract</h4>
                        <p className="text-[15px] text-muted-foreground leading-relaxed">{project.abstract}</p>
                      </div>
                      
                      <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                        <h4 className="text-sm font-bold text-foreground mb-3 tracking-wide uppercase opacity-80">Technologies</h4>
                        <div className="flex flex-wrap gap-2.5">
                          {(project.technologies || []).map((t: string) => (
                            <span key={t} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm rounded-lg font-medium border border-indigo-500/20 shadow-sm">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Similar Projects */}
                      {project.similarProjects?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Similar Projects</h4>
                          <div className="space-y-2">
                            {project.similarProjects.map((sp: any) => (
                              <div key={sp.title} className="flex items-start justify-between gap-3 p-3 bg-muted/40 rounded-lg border border-border/50">
                                <div>
                                  <p className="text-xs font-medium text-foreground">{sp.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{sp.reason}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0">{formatPercent(sp.similarity)}%</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Originality + Decisions */}
                    <div className="space-y-5">
                      <div className="p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl border border-indigo-500/20 shadow-sm flex justify-center">
                        <OriginalityMeter score={Math.round((project.originalityScore || 0) * 100)} />
                      </div>
                      <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground p-4 bg-card rounded-2xl border border-border/50 shadow-sm">
                        <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
                        Submitted: <span className="text-foreground">{project.submittedAt ? new Date(project.submittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A"}</span>
                      </div>

                      {/* Proposal decision */}
                      {normalizeStatusTone(project.status) === "submitted" && !decisionMode && (
                        <div className="p-4 bg-card rounded-xl border border-border/50 space-y-2">
                          <h4 className="text-sm font-semibold text-foreground mb-3">Proposal Decision</h4>
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setDecisionMode("approve-proposal")}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Proposal
                          </Button>
                          <Button variant="outline" className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-900/30 dark:hover:bg-orange-900/20" onClick={() => setDecisionMode("request-revision")}>
                            <FileText className="w-4 h-4 mr-2" /> Request Revision
                          </Button>
                          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20" onClick={() => setDecisionMode("reject-proposal")}>
                            <XCircle className="w-4 h-4 mr-2" /> Reject Proposal
                          </Button>
                        </div>
                      )}

                      {/* Danger Zone: Cancel Supervision */}
                      {normalizeStatusTone(project.status) === "in-progress" && !decisionMode && (
                        <div className="p-4 bg-card rounded-xl border border-red-500/20 space-y-2 mt-4">
                          <h4 className="text-sm font-semibold text-red-500 mb-1">Danger Zone</h4>
                          <p className="text-xs text-muted-foreground mb-3">Leave this team and cancel supervision.</p>
                          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20" onClick={() => setDecisionMode("cancel-supervision")}>
                            <AlertTriangle className="w-4 h-4 mr-2" /> Cancel Supervision
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
