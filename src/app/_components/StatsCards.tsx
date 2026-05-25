import { CheckCircle2, FileText, TrendingUp } from "lucide-react";

import { StatCard } from "./DashboardUI";

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatCard
        title="Current Project Originality"
        value="85%"
        subtitle="Smart Campus Navigation System"
        icon={TrendingUp}
        tone="success"
      />
      <StatCard
        title="Project Status"
        value="In Progress"
        subtitle="Active development phase"
        icon={CheckCircle2}
        tone="info"
      />
    </div>
  );
}
