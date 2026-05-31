"use client";

import { useState, useEffect } from "react";
import { Download, FileText, ImageIcon, Paperclip, Send, ChevronDown, ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface TeamChatMessage {
  id: string;
  author: string;
  initials: string;
  role: "Professor" | "Student";
  content?: string;
  timestamp: string;
  file?: {
    name: string;
    size: string;
    type: "pdf" | "image" | "document";
  };
}

export interface TeamChatMember {
  id: string;
  name: string;
  initials: string;
  role: "Professor" | "Student";
  online?: boolean;
}

export function TeamChatWorkspace({
  title,
  subtitle,
  initialMembers,
  initialMessages,
  currentUserName,
  currentUserRole,
  className,
}: {
  title: string;
  subtitle: string;
  initialMembers: TeamChatMember[];
  initialMessages: TeamChatMessage[];
  currentUserName: string;
  currentUserRole: "Professor" | "Student";
  isTeamLeader?: boolean;
  className?: string;
}) {
  const [draftMessage, setDraftMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [members, setMembers] = useState(initialMembers);
  
  const [isSharedFilesOpen, setIsSharedFilesOpen] = useState(true);

  // Check for removed members and filter them out
  useEffect(() => {
    if (typeof window !== "undefined") {
      queueMicrotask(() => {
      // Check for abandoned project
      const abandonmentInfo = localStorage.getItem("projectAbandonment");
      if (abandonmentInfo) {
        try {
          const info = JSON.parse(abandonmentInfo);
          setMessages((prev) => [
            ...prev,
            {
              id: `abandonment-${Date.now()}`,
              author: "System",
              initials: "SYS",
              role: "Professor",
              content: `⚠️ **PROJECT ABANDONED** - Team Leader ${info.teamLeader} has abandoned the project "${info.projectTitle}".\n\n**Reason:** ${info.reason}`,
              timestamp: info.timestamp,
            }
          ]);
          toast.error("Project has been abandoned by the team!");
          localStorage.removeItem("projectAbandonment");
        } catch (e) {
          console.error("Failed to parse abandonment info:", e);
        }
      }

      // Check for removed members
      const removedMembers = JSON.parse(localStorage.getItem("removedTeamMembers") || "[]");
      if (removedMembers.length > 0) {
        setMembers((prev) => 
          prev.filter(member => !removedMembers.includes(member.name))
        );
        // Add system message for each removed member
        removedMembers.forEach((removedName: string) => {
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}-${removedName}`,
              author: "System",
              initials: "SYS",
              role: "Professor",
              content: `${removedName} has been removed from the team by the team leader.`,
              timestamp: "Just now",
            }
          ]);
        });
        // Clear the removed members list
        localStorage.removeItem("removedTeamMembers");
        toast.info(`${removedMembers.length} member(s) removed from team chat`);
      }
      });
    }
  }, []);

  const sendMessage = () => {
    const content = draftMessage.trim();
    if (!content) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `new-${Date.now()}`,
        author: currentUserName,
        initials: initialsFor(currentUserName),
        role: currentUserRole,
        content,
        timestamp: "Just now",
      },
    ]);
    setDraftMessage("");
  };

  return (
    <section
      className={cn(
        "dashboard-surface flex h-[calc(100vh-154px)] min-h-[700px] flex-col overflow-hidden",
        className,
      )}
    >
      <div className="bg-card/30 backdrop-blur-md border-b border-border/50 px-6 py-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1 font-medium">{subtitle}</p>
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_288px]">
        <div className="flex min-h-0 flex-col border-r border-border/50">
          <div className="flex-1 min-h-0 space-y-5 overflow-y-auto p-5">
            {messages.map((message) => {
              const isOwnMessage = message.author === currentUserName;

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isOwnMessage ? "justify-end" : ""
                  }`}
                >
                  {!isOwnMessage && (
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-muted/80 text-foreground border border-border/50 font-medium">
                        {message.initials}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`flex max-w-[78%] flex-col ${
                      isOwnMessage ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {message.author}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-muted/60 text-muted-foreground border-none px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider"
                      >
                        {message.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp}
                      </span>
                    </div>

                    {message.file ? (
                      <div className="flex min-w-[280px] items-center gap-3 rounded-2xl border border-border/50 bg-muted/20 backdrop-blur-sm text-foreground px-4 py-4 shadow-sm">
                        <div className="rounded-xl border border-border/50 bg-muted/50 p-3 text-muted-foreground">
                          {message.file.type === "image" ? (
                            <ImageIcon className="h-5 w-5" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {message.file.name}
                          </p>
                          <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                            {message.file.size}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:bg-muted/80 rounded-xl"
                          aria-label={`Download ${message.file.name}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm ${
                          isOwnMessage
                            ? "bg-indigo-500/10 border border-indigo-500/20 text-foreground rounded-tr-sm"
                            : "border border-border/50 bg-muted/40 text-foreground rounded-tl-sm"
                        }`}
                      >
                        {message.content}
                      </div>
                    )}
                  </div>

                  {isOwnMessage && (
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                        {message.initials}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 border-t border-border/50 bg-card/30 p-5">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 text-muted-foreground hover:bg-muted/80 rounded-xl"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              placeholder="Type a message..."
              className="h-12 rounded-xl border border-border/50 bg-muted/30 px-5 text-[15px] text-foreground shadow-none focus-visible:ring-1 focus-visible:ring-indigo-500/50"
            />
            <Button
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 shadow-none"
              onClick={sendMessage}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <aside className="bg-card/20 p-6 flex flex-col min-h-0 border-l border-border/50">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Team Members
              </h3>
              <Badge className="bg-muted/60 text-muted-foreground border-none">
                {members.length}
              </Badge>
            </div>
          </div>
          <div className="space-y-4 overflow-y-auto min-h-0 flex-1 pr-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted/80 text-foreground border border-border/50 font-medium">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[2.5px] border-background ${
                      member.online ? "bg-emerald-500" : "bg-slate-500/50"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Shared Files Section */}
          <div className="mt-8 mb-4">
            <button 
              className="flex items-center gap-2 w-full text-left focus:outline-none group mb-4"
              onClick={() => setIsSharedFilesOpen(!isSharedFilesOpen)}
            >
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex-1">
                Shared Files
              </h3>
              <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                {isSharedFilesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>
            
            {isSharedFilesOpen && (
              <div className="space-y-3">
                {messages
                  .filter((m) => m.file)
                  .map((message) => (
                    <div key={`file-${message.id}`} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors backdrop-blur-sm">
                      <div className="rounded-lg border border-border/50 bg-muted/50 p-2.5 text-muted-foreground shrink-0">
                        {message.file?.type === "image" ? (
                          <ImageIcon className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {message.file?.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                          {message.file?.size} • {message.author}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-muted/80 shrink-0 rounded-lg"
                        aria-label={`Download ${message.file?.name}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                {messages.filter((m) => m.file).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4 font-medium">No files shared yet.</p>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
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
