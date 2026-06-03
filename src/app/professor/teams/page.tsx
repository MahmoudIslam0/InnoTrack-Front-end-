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
              className="group relative bg-card text-card-foreground rounded-3xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Animated Top Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="p-7 flex flex-col h-full z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="min-w-0 flex-1 pr-4">
                    <h3 className="text-xl font-bold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Briefcase className="w-4 h-4 shrink-0 text-indigo-500" />
                      <span className="truncate">{team.projectTitle || "No project assigned"}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    <span className="text-lg font-bold leading-none">{team.members?.length || 0}</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider mt-1 opacity-80">Size</span>
                  </div>
                </div>

                {/* Member Avatars */}
                <div className="flex flex-col mb-7">
                  <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-3">Team Members</p>
                  <div className="flex -space-x-3 overflow-hidden">
                    {(team.members || []).slice(0, 5).map((member: any) => (
                      <div 
                        key={member.id} 
                        className="inline-flex h-10 w-10 rounded-full ring-2 ring-card bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center text-white text-xs font-bold shadow-sm transition-transform hover:-translate-y-1 hover:z-10 relative"
                        title={member.fullName}
                      >
                        {member.fullName?.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                    ))}
                    {(team.members?.length || 0) > 5 && (
                      <div className="inline-flex h-10 w-10 rounded-full ring-2 ring-card bg-muted items-center justify-center text-xs text-muted-foreground font-semibold shadow-sm z-0">
                        +{team.members.length - 5}
                      </div>
                    )}
                    {(!team.members || team.members.length === 0) && (
                      <span className="text-sm text-muted-foreground italic">No members found</span>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                  <Link href={`/professor/teams/${team.id}`} className="block">
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-500/20 transition-all group/btn"
                    >
                      <Users className="w-4 h-4 mr-2 opacity-80" />
                      Overview
                      <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                    </Button>
                  </Link>
                  <Link href={`/professor/teams/${team.id}?view=chat`} className="block">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl border-border/60 hover:bg-muted hover:border-border transition-colors text-foreground"
                    >
                      <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" />
                      Chat
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
