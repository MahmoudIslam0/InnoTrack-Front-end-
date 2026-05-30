"use client";
import React from "react";
import SkillTag from "./SkillTag";
import { Button } from "@/components/ui/button";

type Applicant = {
  id: string;
  fullName: string;
  department: string;
  skills?: string[];
};

export default function ApplicantCard({ applicant, onAccept, onReject }:{ applicant: Applicant; onAccept:(id:string)=>void; onReject:(id:string)=>void }){
  return (
    <div className="bg-card p-4 rounded-xl border border-border/50 w-80 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{applicant.fullName}</h4>
          <div className="text-sm text-muted-foreground">{applicant.department}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(applicant.skills || []).map((s:string)=> <SkillTag key={s} skill={s} />)}
      </div>

      <div className="flex gap-2 mt-2">
        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onAccept(applicant.id)}>Accept</Button>
        <Button variant="outline" className="flex-1 text-red-600" onClick={() => onReject(applicant.id)}>Reject</Button>
      </div>
    </div>
  );
}
