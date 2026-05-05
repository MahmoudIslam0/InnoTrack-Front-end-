"use client";

import { useState } from "react";

import {
  TeamChatMember,
  TeamChatMessage,
  TeamChatWorkspace,
} from "@/app/_components/TeamChatWorkspace";
import { Badge } from "@/components/ui/badge";
import { professorProfile, projects, teamChats, teams } from "../_data";

export default function TeamChats() {
  const [selectedChatId, setSelectedChatId] = useState(teamChats[0]?.id ?? "");
  const selectedChat = teamChats.find((chat) => chat.id === selectedChatId);
  const selectedTeam = teams.find((team) => team.id === selectedChat?.teamId);
  const selectedProject = projects.find(
    (project) => project.id === selectedTeam?.projectId,
  );

  const members: TeamChatMember[] = [
    ...(selectedTeam?.members.map((member, index) => ({
      id: member.id,
      name: member.name,
      initials: initialsFor(member.name),
      role: "Student" as const,
      online: index < 2,
    })) ?? []),
    {
      id: "professor",
      name: professorProfile.name,
      initials: professorProfile.profilePicture,
      role: "Professor" as const,
      online: true,
    },
  ];

  const messages: TeamChatMessage[] = [
    ...(selectedChat?.messages.map((message) => ({
      id: message.id,
      author: message.author,
      initials: initialsFor(message.author),
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    })) ?? []),
    ...(selectedChat?.files.map((file) => ({
      id: file.id,
      author:
        selectedTeam?.members[0]?.name ?? `${selectedTeam?.name ?? "Team"} Member`,
      initials: initialsFor(selectedTeam?.members[0]?.name ?? "Team Member"),
      role: "Student" as const,
      timestamp: file.uploadedAt,
      file: {
        name: file.name,
        size: file.size,
        type: file.name.toLowerCase().endsWith(".png")
          ? ("image" as const)
          : ("pdf" as const),
      },
    })) ?? []),
  ];

  return (
    <div className="w-full px-4 py-5 md:px-5 md:py-6">
      

      <div className="grid min-h-[calc(100vh-154px)] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <TeamChatWorkspace
          key={selectedChatId}
          title="Team Chat"
          subtitle={`${selectedProject?.title ?? "Assigned Project"} - ${selectedTeam?.name ?? "Team"}`}
          initialMembers={members}
          initialMessages={messages}
          currentUserName={professorProfile.name}
          currentUserRole="Professor"
          className="h-full"
        />

        <aside className="dashboard-surface h-full overflow-hidden">
          <div className="border-b border-border/50 px-4 py-4">
            <h2 className="text-base font-semibold text-foreground">
              Supervised Projects
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Select a team chat to review.
            </p>
          </div>

          <div className="max-h-[calc(100vh-252px)] space-y-3 overflow-y-auto p-3">
            {teamChats.map((chat) => {
              const team = teams.find((item) => item.id === chat.teamId);
              const project = projects.find((item) => item.id === team?.projectId);
              const isSelected = chat.id === selectedChatId;

              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? "border-indigo-200 bg-indigo-500/10 shadow-sm"
                      : "border-border/50 bg-card text-card-foreground hover:border-indigo-200 hover:bg-muted"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {team?.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {project?.title}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <Badge className="shrink-0 bg-indigo-100 text-indigo-700 dark:text-indigo-400">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {team?.members.length} students
                  </p>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
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
