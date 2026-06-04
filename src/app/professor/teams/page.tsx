"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Loader2, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components";
import { professorApi } from "@/lib/professor-api";
import { Badge } from "@/components/ui/badge";

export default function ProfessorTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await professorApi.getSupervisedTeams();
        setTeams(data || []);
      } catch (err) {
        console.error("Failed to load teams:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeams();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Supervised Teams"
        description="Manage your assigned teams, monitor their progress, and collaborate via direct team chats."
      />

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl mt-6 shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">No Teams Assigned</h3>
          <p className="text-muted-foreground mt-3 max-w-md text-center leading-relaxed">
            You are not currently supervising any teams. Once students submit project proposals and you approve them, their teams will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
          {teams.map((team) => (
            <div 
              key={team.id} 
              className="bg-card text-card-foreground rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden group"
            >
              {/* Top accent bar */}
              <div className="h-1 w-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground truncate">{team.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {team.projectTitle || "No project assigned"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-primary/10 border-primary/20">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-bold text-primary">{team.members?.length || 0}</span>
                  </div>
                </div>

                {/* Members */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex -space-x-2 overflow-hidden">
                    {(team.members || []).slice(0, 4).map((member: any) => (
                      <div 
                        key={member.id} 
                        className="inline-flex h-8 w-8 rounded-full ring-2 ring-card bg-primary/10 text-primary items-center justify-center text-xs font-bold"
                        title={member.fullName}
                      >
                        {member.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {(team.members?.length || 0) > 4 && (
                      <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-card bg-muted items-center justify-center text-xs text-muted-foreground font-bold">
                        +{team.members.length - 4}
                      </div>
                    )}
                  </div>
                  {(!team.members || team.members.length === 0) && (
                    <span className="text-xs text-muted-foreground italic">No members</span>
                  )}
                </div>

                {/* Status badge if project exists */}
                {team.projectStatus && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2 py-0.5 bg-muted text-foreground text-xs rounded-md font-medium">
                      {team.projectStatus.replace("_", " ")}
                    </span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>Team</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/professor/teams/${team.id}?view=chat`}>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="h-8 text-muted-foreground hover:text-primary border-border/50"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        Chat
                      </Button>
                    </Link>
                    <Link href={`/professor/teams/${team.id}`}>
                      <Button 
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white h-8 gap-1.5"
                      >
                        Overview
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
