"use client";
import React from "react";
import ApplicantCard from "./ApplicantCard";

type JoinRequest = {
  id: string;
  fullName: string;
  department: string;
  skills?: string[];
};

export default function PendingRequestsList({ requests, onAccept, onReject }:{ requests: JoinRequest[]; onAccept:(id:string)=>void; onReject:(id:string)=>void }){
  if (!requests || requests.length === 0) {
    return <div className="bg-card p-6 rounded-xl border border-border/50 text-center text-muted-foreground">No pending requests. Share your join code to recruit members!</div>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto py-2">
      {requests.map(r => (
        <ApplicantCard key={r.id} applicant={r} onAccept={onAccept} onReject={onReject} />
      ))}
    </div>
  );
}
