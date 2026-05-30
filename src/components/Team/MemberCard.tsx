"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Member {
  name: string;
  role?: "Leader" | "Member";
}

export default function MemberCard({ member, isLeaderView, onRemove }: { member: Member; isLeaderView?: boolean; onRemove?: (name: string)=>void }) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border/50 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">{member.name.split(" ").map(n=>n[0]).join("")}</div>
        <div>
          <div className="font-semibold">{member.name}</div>
          <div className="text-sm text-muted-foreground">{member.role || 'Member'}</div>
        </div>
      </div>
      {isLeaderView && member.role !== "Leader" && (
        <Button variant="destructive" size="sm" onClick={() => onRemove?.(member.name)}>
          <Trash2 className="w-4 h-4 mr-2" /> Remove
        </Button>
      )}
    </div>
  );
}
