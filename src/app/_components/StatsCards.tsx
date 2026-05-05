import { CheckCircle2, FileText, TrendingUp } from "lucide-react";

import { StatCard } from "./DashboardUI";

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Last Project Originality"
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
      <StatCard
        title="Total Drafted"
        value="3"
        subtitle="1 approved, 2 draft projects"
        icon={FileText}
        tone="primary"
      />
    </div>
  );
}
