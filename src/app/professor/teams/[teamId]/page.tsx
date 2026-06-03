"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Users, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { professorApi } from "@/lib/professor-api";
import { useProfessorTeamChat } from "@/hooks/useProfessorTeamChat";
import { TeamChatWorkspace } from "@/app/_components/TeamChatWorkspace";
import MembersGrid from "@/components/Team/MembersGrid";

export default function ProfessorTeamDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const teamId = Number(params.teamId);
  const [team, setTeam] = useState<any>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  
  const [activeView, setActiveView] = useState<"overview" | "chat">(
    (searchParams.get("view") as "overview" | "chat") || "overview"
  );
  
  const [currentUserName, setCurrentUserName] = useState("Professor");

  const {
    messages,
    members: chatMembers,
    isLoading: isChatLoading,
    sendMessage,
    editMessage,
    deleteMessage,
    togglePin,
    reactToMessage,
    replyToMessage,
  } = useProfessorTeamChat(teamId);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) setCurrentUserName(u.name);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teams = await professorApi.getSupervisedTeams();
        const found = teams?.find((t: any) => t.id === teamId);
        setTeam(found || null);
      } catch (error) {
        console.error("Failed to load team details:", error);
      } finally {
        setIsLoadingTeam(false);
      }
    };
    fetchTeam();
  }, [teamId]);

  const handleActiveViewChange = (view: "overview" | "chat") => {
    setActiveView(view);
    router.replace(`/professor/teams/${teamId}?view=${view}`, { scroll: false });
  };

  if (isLoadingTeam) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="dashboard-page flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold mb-2">Team Not Found</h2>
        <p className="text-muted-foreground mb-4">You may not have access to this team.</p>
        <Button onClick={() => router.push("/professor/teams")}>Back to Teams</Button>
      </div>
    );
  }

  const visibleTeamMembers = (team.members || []).map((m: any) => ({
    id: m.id,
    name: m.fullName,
    role: m.role,
    email: m.email,
    gpa: m.gpa,
    skills: m.skills || []
  }));

  return (
    <div className={`dashboard-page flex flex-col ${activeView === "chat" ? "h-[calc(100vh-5rem)] overflow-hidden space-y-3 md:pt-5 md:pb-4" : "space-y-6"}`}>
      <div className="flex items-center gap-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.push("/professor/teams")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
          <p className="text-muted-foreground">{team.projectTitle || "No Project"}</p>
        </div>
      </div>

      <div className={`flex justify-center shrink-0 ${activeView === "chat" ? "mb-2" : "mb-8"}`}>
        <div className="grid w-full max-w-[440px] grid-cols-2 rounded-xl border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => handleActiveViewChange("overview")}
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
            onClick={() => handleActiveViewChange("chat")}
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
        <section className="dashboard-surface p-6 flex-1 overflow-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Team Roster</h2>
            <p className="text-sm text-muted-foreground">View the current members of this team.</p>
          </div>
          <MembersGrid
            members={visibleTeamMembers}
            isLeaderView={false} // Professor can't remove members from here directly
            onRemove={() => {}}
          />
        </section>
      ) : (
        <TeamChatWorkspace
          title="Team Chat"
          subtitle={`${team.projectTitle || "No project yet"} - ${team.name}`}
          members={chatMembers as any}
          messages={messages as any}
          currentUserName={currentUserName}
          currentUserRole="Professor"
          onSendMessage={sendMessage}
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
          onTogglePin={togglePin}
          onReactToMessage={reactToMessage}
          onReplyToMessage={replyToMessage}
          isLoading={isChatLoading}
          className="flex-1 min-h-0 rounded-2xl border border-border/50 shadow-sm"
        />
      )}
    </div>
  );
}
