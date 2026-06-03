"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Loader2, MessageSquare, ChevronRight, Briefcase, Award } from "lucide-react";
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
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
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
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">No Teams Assigned</h3>
          <p className="text-muted-foreground mt-3 max-w-md text-center leading-relaxed">
            You are not currently supervising any teams. Once students submit project proposals and you approve them, their teams will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {teams.map((team) => (
            <div 
              key={team.id} 
              className="group relative bg-card border border-border/60 hover:border-indigo-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
            >
              {/* Header section */}
              <div className="flex items-start justify-between mb-4">
                <div className="min-w-0 pr-4">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {team.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{team.projectTitle || "No project assigned"}</span>
                  </div>
                </div>
                
                {/* Minimal size badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 text-xs font-semibold shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                  <Users className="w-3.5 h-3.5" />
                  {team.members?.length || 0}
                </div>
              </div>

              {/* Members Section */}
              <div className="flex-1 mt-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex -space-x-2 overflow-hidden">
                    {(team.members || []).slice(0, 5).map((member: any) => (
                      <div 
                        key={member.id} 
                        className="inline-flex h-8 w-8 rounded-full ring-2 ring-card bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 items-center justify-center text-xs font-bold shadow-sm transition-transform hover:-translate-y-1 relative"
                        title={member.fullName}
                      >
                        {member.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {(team.members?.length || 0) > 5 && (
                      <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-card bg-muted items-center justify-center text-[10px] text-muted-foreground font-semibold shadow-sm z-0">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>
                  {(!team.members || team.members.length === 0) ? (
                    <span className="text-sm text-muted-foreground italic">No members found</span>
                  ) : null}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Link href={`/professor/teams/${team.id}?view=chat`}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 transition-colors px-2"
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    Chat
                  </Button>
                </Link>
                <Link href={`/professor/teams/${team.id}`}>
                  <Button 
                    variant="default"
                    size="sm"
                    className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm px-3"
                  >
                    Overview
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
