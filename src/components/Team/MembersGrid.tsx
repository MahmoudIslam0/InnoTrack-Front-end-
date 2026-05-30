"use client";
import React from "react";
import MemberCard from "./MemberCard";

export default function MembersGrid({ members, isLeaderView, onRemove }:{ members: {name:string;role?:string}[]; isLeaderView?:boolean; onRemove?:(name:string)=>void }){
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {members.map(m => (
        <MemberCard key={m.name} member={m} isLeaderView={isLeaderView} onRemove={onRemove} />
      ))}
    </div>
  );
}
