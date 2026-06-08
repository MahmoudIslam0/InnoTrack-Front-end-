"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Member {
  id?: number;
  name: string;
  role?: "Leader" | "Member";
}

export default function MemberCard({ member, isLeaderView, onRemove }: { member: Member; isLeaderView?: boolean; onRemove?: (name: string, id?: number)=>void }) {
  return (
    <div className="bg-card p-2 rounded-xl border border-border/50 flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-primary/90 text-sm">{member.name.split(" ").map(n=>n[0]).join("")}</div>
        <div>
          <div className="font-semibold text-sm">{member.name}</div>
          <div className="text-xs text-muted-foreground">{member.role || 'Member'}</div>
        </div>
      </div>
      {isLeaderView && member.role !== "Leader" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer"
              onClick={() => onRemove?.(member.name, member.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
