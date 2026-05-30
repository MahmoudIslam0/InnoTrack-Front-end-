"use client";

import { useEffect, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Copy,
  KeyRound,
  MessageSquare,
  Plus,
  ShieldCheck,
  Timer,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  TeamChatMember,
  TeamChatMessage,
  TeamChatWorkspace,
} from "@/app/_components/TeamChatWorkspace";
import MembersGrid from "@/components/Team/MembersGrid";
import PendingRequestsList from "@/components/Team/PendingRequestsList";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type JoinRequest = {
  id: string;
  fullName: string;
  department: string;
  skills?: string[];
};

type Team = {
  id: string;
  name: string;
  leaderId?: string;
  members: string[];
  supervisorName?: string;
};

type TeamMember = {
  name: string;
  role: "Leader" | "Member";
};

const fallbackRequests: JoinRequest[] = [
  {
    id: "r1",
    fullName: "Kareem Hassan",
    department: "Computer Science",
    skills: ["React", "ARKit"],
  },
];

const activeProjectChatContext = {
  title: "Smart Campus Navigation System",
  teamName: "Nova Path",
  supervisor: "Dr. Ahmed Hassan",
  students: ["John Smith", "Sarah Ahmed"],
  technologies: ["React Native", "ARKit", "Firebase"],
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [activeView, setActiveView] = useState<"overview" | "chat">("overview");
  const [showHint, setShowHint] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState("");
  const [memberContact, setMemberContact] = useState("");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [teamNameDraft, setTeamNameDraft] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteCountdown, setInviteCountdown] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const parsed = parseTeams(JSON.parse(localStorage.getItem("teams") || "[]"));
        setTeams(parsed);
        setTeam(parsed[0] || null);
        localStorage.setItem("teams", JSON.stringify(parsed));
      } catch (error) {
        console.error("Failed to load teams", error);
      }

      try {
        const reqs = parseRequests(
          JSON.parse(localStorage.getItem("joinRequests") || "[]"),
        );
        setRequests(reqs.length ? reqs : fallbackRequests);
      } catch (error) {
        console.error("Failed to load join requests", error);
      }

      setShowHint(localStorage.getItem("teamsWorkspaceHintDismissed") !== "true");
    });
  }, []);

  useEffect(() => {
    if (inviteCountdown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setInviteCountdown((value) => {
        const next = value - 1;
        if (next <= 0) setInviteCode(null);
        return next;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [inviteCountdown]);

  useEffect(() => {
    queueMicrotask(() => {
      setTeamNameDraft(team?.name || "");
      setIsEditingTeamName(false);
    });
  }, [team?.id, team?.name]);

  const saveTeams = (next: Team[], selectedId?: string) => {
    setTeams(next);
    localStorage.setItem("teams", JSON.stringify(next));

    const nextTeam =
      next.find((existingTeam) => existingTeam.id === (selectedId || team?.id)) ||
      next[0] ||
      null;
    setTeam(nextTeam);
  };

  const hasTeam = Boolean(team);
  const isLeader = hasTeam && team?.leaderId === "me";
  const teamName = team?.name || "";
  const supervisorName = team?.supervisorName || "";
  const chatSupervisorName = supervisorName || activeProjectChatContext.supervisor;
  const isApproved = Boolean(supervisorName);
  const teamMembers: TeamMember[] = (team?.members || []).map((name) => ({
    name,
    role: name === (team?.leaderId || "me") ? "Leader" : "Member",
  }));
  const visibleTeamMembers = teamMembers.map((member) => ({
    ...member,
    name: displayChatName(member.name),
  }));
  const currentChatUserName = displayChatName(teamMembers[0]?.name || "me");
  const chatStudentNames = uniqueNames(
    teamMembers.length
      ? teamMembers.map((member) => displayChatName(member.name))
      : activeProjectChatContext.students,
  );
  const chatMembers: TeamChatMember[] = [
    ...chatStudentNames.map((name, index) => ({
      id: `student-${index}-${name}`,
      name,
      initials: initialsFor(name),
      role: "Student" as const,
      online: true,
    })),
    ...(chatSupervisorName
      ? [
          {
            id: "supervisor",
            name: chatSupervisorName,
            initials: initialsFor(chatSupervisorName),
            role: "Professor" as const,
            online: true,
          },
        ]
      : []),
  ];
  const chatMessages = buildProjectChatMessages(
    activeProjectChatContext,
    chatSupervisorName,
    currentChatUserName,
  );

  const createTeam = () => {
    const name = newTeamName.trim();
    if (!name) {
      toast.error("Add a team name first.");
      return;
    }

    const extraMembers = newTeamMembers
      .split(",")
      .map((member) => member.trim())
      .filter(Boolean);
    const id = crypto.randomUUID();
    const newTeam: Team = {
      id,
      name,
      leaderId: "me",
      members: ["me", ...extraMembers],
    };

    saveTeams([...teams, newTeam], id);
    setNewTeamName("");
    setNewTeamMembers("");
    setActiveView("overview");
    toast.success(`Team "${name}" created.`);
  };

  const joinByCode = () => {
    if (!/^\d{6}$/.test(joinCodeInput)) {
      toast.error("Enter a 6-digit join code.");
      return;
    }

    const id = crypto.randomUUID();
    const joinedTeam: Team = {
      id,
      name: `Joined Team ${joinCodeInput}`,
      leaderId: "external",
      members: ["me"],
    };

    saveTeams([...teams, joinedTeam], id);
    setJoinCodeInput("");
    setActiveView("overview");
    toast.success("Joined the team workspace.");
  };

  const approve = (id: string) => {
    const req = requests.find((request) => request.id === id);
    if (!req || !team) return;

    if (team.members.includes(req.fullName)) {
      toast.error(`${req.fullName} is already in this team.`);
      return;
    }

    const updated = teams.map((existingTeam) =>
      existingTeam.id === team.id
        ? { ...existingTeam, members: [...existingTeam.members, req.fullName] }
        : existingTeam,
    );

    saveTeams(updated, team.id);
    setRequests(requests.filter((request) => request.id !== id));
    toast.success(`${req.fullName} added to team`);
  };

  const reject = (id: string) => {
    setRequests(requests.filter((request) => request.id !== id));
    toast.success("Request rejected");
  };

  const saveTeamName = () => {
    if (!team) return;
    const nextName = teamNameDraft.trim();
    if (!nextName) {
      toast.error("Team name cannot be empty.");
      return;
    }

    const updated = teams.map((existingTeam) =>
      existingTeam.id === team.id ? { ...existingTeam, name: nextName } : existingTeam,
    );
    saveTeams(updated, team.id);
    setIsEditingTeamName(false);
    toast.success("Team name updated.");
  };

  const removeMember = (name: string) => {
    if (!team) return;
    if (name === "me" || name === displayChatName(team.leaderId || "me")) {
      toast.error("The team leader cannot be removed.");
      return;
    }
    if (!confirm(`Remove ${name} from team?`)) return;

    const updated = teams.map((existingTeam) =>
      existingTeam.id === team.id
        ? {
            ...existingTeam,
            members: existingTeam.members.filter((member) => member !== name),
          }
        : existingTeam,
    );

    saveTeams(updated, team.id);
    toast.success(`${name} removed`);
  };

  const addMember = () => {
    if (!team) return;
    const contact = memberContact.trim();
    if (!contact) {
      toast.error("Enter a student name or email.");
      return;
    }

    const memberName = contact.includes("@")
      ? contact
          .split("@")[0]
          .split(/[._-]/)
          .filter(Boolean)
          .map((part) => part[0].toUpperCase() + part.slice(1))
          .join(" ")
      : contact;

    if (team.members.includes(memberName)) {
      toast.error(`${memberName} is already in this team.`);
      return;
    }

    const updated = teams.map((existingTeam) =>
      existingTeam.id === team.id
        ? { ...existingTeam, members: [...existingTeam.members, memberName] }
        : existingTeam,
    );

    saveTeams(updated, team.id);
    setMemberContact("");
    setIsAddMemberOpen(false);
    toast.success(`${memberName} added to the team.`);
  };

  const generateInviteCode = () => {
    setInviteCode(Math.floor(100000 + Math.random() * 900000).toString());
    setInviteCountdown(60);
    setCopied(false);
  };

  const copyInviteCode = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Join code copied");
  };

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem("teamsWorkspaceHintDismissed", "true");
  };

  return (
    <div className={`dashboard-page ${hasTeam && activeView === "chat" ? "space-y-4 md:pt-5 md:pb-4" : "space-y-6"}`}>
      <Link href="/project-management">
        <Button
          variant="ghost"
          className="gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to project management
        </Button>
      </Link>

      {!hasTeam ? (
        <NoTeamState
          joinCodeInput={joinCodeInput}
          setJoinCodeInput={setJoinCodeInput}
          joinByCode={joinByCode}
          newTeamName={newTeamName}
          setNewTeamName={setNewTeamName}
          newTeamMembers={newTeamMembers}
          setNewTeamMembers={setNewTeamMembers}
          createTeam={createTeam}
        />
      ) : (
        <>
        <div className="flex justify-center">
          <div className="grid w-full max-w-[440px] grid-cols-2 rounded-xl border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setActiveView("overview")}
              className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
                activeView === "overview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-4 w-4" />
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveView("chat")}
              className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
                activeView === "chat"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Team Chat
            </button>
          </div>
        </div>

        {activeView === "overview" ? (
        <section className="dashboard-surface overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-5 py-5 md:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 gap-4">
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarFallback className="bg-indigo-500/15 text-base font-bold text-indigo-700 dark:text-indigo-300">
                    {initialsFor(teamName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {!isApproved ? (
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      >
                        Under Review
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      >
                        Approved
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    >
                      {isLeader ? "Leader Access" : "Member"}
                    </Badge>
                  </div>
                  {isEditingTeamName ? (
                    <div className="mt-1 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        value={teamNameDraft}
                        onChange={(event) => setTeamNameDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") saveTeamName();
                          if (event.key === "Escape") {
                            setTeamNameDraft(teamName);
                            setIsEditingTeamName(false);
                          }
                        }}
                        className="h-11 text-lg font-semibold md:text-xl"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveTeamName}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTeamNameDraft(teamName);
                            setIsEditingTeamName(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-3">
                      <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
                        {teamName}
                      </h1>
                      {isLeader && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg"
                          onClick={() => setIsEditingTeamName(true)}
                        >
                          Rename
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {supervisorName && (
                      <span className="inline-flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        {supervisorName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      {teamMembers.length} members
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      {requests.length} pending
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:min-w-[220px]">
                <MetricCard label="Members" value={teamMembers.length.toString()} icon={Users} />
                <MetricCard label="Requests" value={requests.length.toString()} icon={ClipboardList} />
              </div>
            </div>
          </div>

          {showHint && (
            <div className="border-b border-border px-5 py-4 md:px-6">
              <div className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-900 dark:text-indigo-200">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="leading-5">
                  Manage members, join codes, and requests in Overview. Chat is for
                  team conversation and shared files.
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-2 -mt-1 h-7 w-7 shrink-0 hover:bg-indigo-500/10"
                  onClick={dismissHint}
                  aria-label="Dismiss tip"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

            <div className="p-5 md:p-6">
              <div className="space-y-8">
                <div className="space-y-8">
                  <section>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          Team Roster
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Add, remove, and review members from one place.
                        </p>
                      </div>
                      {isLeader && (
                        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                          <DialogTrigger asChild>
                            <Button className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
                              <UserPlus className="h-4 w-4" />
                              Add Member
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add Team Member</DialogTitle>
                              <DialogDescription>
                                Invite a student or generate a temporary code for this team.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-6 py-3">
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium">Invite via Email</h4>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="student@university.edu or student name"
                                    value={memberContact}
                                    onChange={(event) => setMemberContact(event.target.value)}
                                  />
                                  <Button
                                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                                    onClick={addMember}
                                  >
                                    Send
                                  </Button>
                                </div>
                              </div>

                              <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                  <span className="w-full border-t border-border/50" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                  <span className="bg-popover px-2 text-muted-foreground">
                                    Or use join code
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium">Generate Temporary Code</h4>
                                  {inviteCountdown > 0 && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                      <Timer className="h-3 w-3" />
                                      {inviteCountdown}s remaining
                                    </span>
                                  )}
                                </div>

                                {inviteCode ? (
                                  <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3">
                                    <span className="text-2xl font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                                      {inviteCode}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={copyInviteCode}>
                                      {copied ? (
                                        <Check className="h-4 w-4 text-emerald-500" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                ) : (
                                  <Button variant="outline" className="w-full" onClick={generateInviteCode}>
                                    Generate 6-Digit Code
                                  </Button>
                                )}

                                <p className="text-xs text-muted-foreground">
                                  Code expires in 60 seconds.
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <MembersGrid
                      members={visibleTeamMembers}
                      isLeaderView={isLeader}
                      onRemove={removeMember}
                    />
                  </section>

                  {isLeader && (
                    <section>
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold text-foreground">
                          Pending Requests
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Review applicants before they join this team.
                        </p>
                      </div>
                      <PendingRequestsList
                        requests={requests}
                        onAccept={approve}
                        onReject={reject}
                      />
                    </section>
                  )}
                </div>
              </div>
            </div>
        </section>
        ) : (
            <TeamChatWorkspace
              title="Team Chat"
              subtitle={`${activeProjectChatContext.title} - ${activeProjectChatContext.teamName}`}
              initialMembers={chatMembers}
              initialMessages={chatMessages}
              currentUserName={currentChatUserName}
              currentUserRole="Student"
              isTeamLeader={false}
              className="h-[calc(100vh-260px)] min-h-0"
            />
        )}
        </>
      )}
    </div>
  );
}

function NoTeamState({
  joinCodeInput,
  setJoinCodeInput,
  joinByCode,
  newTeamName,
  setNewTeamName,
  newTeamMembers,
  setNewTeamMembers,
  createTeam,
}: {
  joinCodeInput: string;
  setJoinCodeInput: (value: string) => void;
  joinByCode: () => void;
  newTeamName: string;
  setNewTeamName: (value: string) => void;
  newTeamMembers: string;
  setNewTeamMembers: (value: string) => void;
  createTeam: () => void;
}) {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="dashboard-surface p-6 md:p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <KeyRound className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Join a team</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter the 6-digit code from your team leader to unlock the team workspace.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Enter 6-digit code"
            value={joinCodeInput}
            onChange={(event) =>
              setJoinCodeInput(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="h-12 text-center tracking-[0.35em]"
            inputMode="numeric"
          />
          <Button
            onClick={joinByCode}
            className="h-12 shrink-0 bg-indigo-600 px-6 text-white hover:bg-indigo-700"
          >
            Join Team
          </Button>
        </div>
      </div>

      <div className="dashboard-surface p-6 md:p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Plus className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Create your team</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Start your own team, then invite members and manage requests from Overview.
        </p>
        <div className="mt-6 space-y-3">
          <Input
            placeholder="Team name"
            value={newTeamName}
            onChange={(event) => setNewTeamName(event.target.value)}
            className="h-12"
          />
          <Input
            placeholder="Optional members, comma-separated"
            value={newTeamMembers}
            onChange={(event) => setNewTeamMembers(event.target.value)}
            className="h-12"
          />
          <Button
            onClick={createTeam}
            className="h-12 w-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Create Team
          </Button>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-lg font-semibold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function parseTeams(value: unknown): Team[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => {
      const leaderId = typeof item.leaderId === "string" ? item.leaderId : "me";
      const members = Array.isArray(item.members)
        ? item.members.filter((member): member is string => typeof member === "string")
        : [];

      return {
        id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
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
    });
}

function normalizeTeamMembers(members: string[], leaderId: string) {
  return uniqueNames([leaderId, ...members].filter(Boolean));
}

function displayChatName(name: string) {
  if (name === "me") return activeProjectChatContext.students[0];
  return name;
}

function uniqueNames(names: string[]) {
  return names.filter((name, index, list) => list.indexOf(name) === index);
}

function buildProjectChatMessages(
  project: typeof activeProjectChatContext,
  supervisorName: string,
  currentUserName: string,
): TeamChatMessage[] {
  const teammate = project.students.find((student) => student !== currentUserName) || project.students[1];

  return [
    {
      id: "m1",
      author: supervisorName,
      initials: initialsFor(supervisorName),
      role: "Professor",
      content:
        `Good morning ${project.teamName}. I reviewed the ${project.title} proposal. The core idea is strong; please tighten the indoor route fallback and clarify how ${project.technologies[1]} handles low-light areas.`,
      timestamp: "09:30 AM",
    },
    {
      id: "m2",
      author: supervisorName,
      initials: initialsFor(supervisorName),
      role: "Professor",
      timestamp: "09:31 AM",
      file: {
        name: "Navigation_Feedback_Round1.pdf",
        size: "245 KB",
        type: "pdf",
      },
    },
    {
      id: "m3",
      author: currentUserName,
      initials: initialsFor(currentUserName),
      role: "Student",
      content:
        "Thanks doctor. We will update the proposal today and add the route fallback section before sending the next draft.",
      timestamp: "10:15 AM",
    },
    {
      id: "m4",
      author: teammate,
      initials: initialsFor(teammate),
      role: "Student",
      content:
        `I updated the ${project.technologies[1]} wayfinding flow and linked it with the ${project.technologies[2]} location checkpoints.`,
      timestamp: "11:20 AM",
    },
    {
      id: "m5",
      author: teammate,
      initials: initialsFor(teammate),
      role: "Student",
      timestamp: "11:21 AM",
      file: {
        name: "Campus_AR_Wireflow.png",
        size: "1.2 MB",
        type: "image",
      },
    },
    {
      id: "m6",
      author: supervisorName,
      initials: initialsFor(supervisorName),
      role: "Professor",
      content:
        "Great. Once the updated flow is ready, share the Firebase schema and I will review the data model before your next milestone.",
      timestamp: "12:05 PM",
    },
  ];
}

function parseRequests(value: unknown): JoinRequest[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      fullName: typeof item.fullName === "string" ? item.fullName : "Unknown Student",
      department: typeof item.department === "string" ? item.department : "Unassigned",
      skills: Array.isArray(item.skills)
        ? item.skills.filter((skill): skill is string => typeof skill === "string")
        : [],
    }));
}
