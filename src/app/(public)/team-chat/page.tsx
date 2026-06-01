"use client";

import { useEffect, useState } from "react";
import { TeamChatWorkspace } from "@/app/_components/TeamChatWorkspace";
import { useTeamChat } from "@/hooks/useTeamChat";
import { studentApi, MyTeamDto } from "@/lib/student-api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentTeamChat() {
  const { user } = useAuth();
  const [team, setTeam] = useState<MyTeamDto | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    studentApi.getMyTeam()
      .then(setTeam)
      .catch((err) => {
        console.error("Failed to load team", err);
        toast.error("You are not in a team or failed to load team details.");
      })
      .finally(() => setLoadingTeam(false));
  }, []);

  const { messages, members, projectTitle, isConnected, isLoading, sendMessage } = useTeamChat(team?.id || null);

  if (loadingTeam || isLoading) {
    return (
      <div className="flex h-[calc(100vh-154px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex h-[calc(100vh-154px)] items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">No Team Found</h2>
          <p className="text-muted-foreground">You must be part of a team to access the team chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-5 md:px-5 md:py-6">
      <TeamChatWorkspace
        title="Team Chat Workspace"
        subtitle={`${projectTitle || "Assigned Project"} - ${team.name}`}
        members={members as any}
        messages={messages as any}
        currentUserName={(user as any)?.name || (user as any)?.fullName || "Student"}
        currentUserRole="Student"
        onSendMessage={sendMessage}
        className="h-full border border-border/50 shadow-lg rounded-2xl"
      />
    </div>
  );
}
