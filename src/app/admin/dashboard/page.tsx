"use client";

import { CheckCircle2, ClipboardList, FolderKanban, Users, ShieldAlert, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  StatCard as ProfessorStatCard,
  SectionCard,
} from "@/app/_components/DashboardUI";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminApi.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const {
    totalStudents = 0,
    totalProfessors = 0,
    totalTeams = 0,
    totalProjects = 0,
    averageOriginalityScore = 0,
    healthAlerts = [],
    recentAuditLogs = [],
  } = dashboardData || {};

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Admin Dashboard"
        description="Monitor system health, view key metrics, and manage university operations."
      />

      {healthAlerts.length > 0 && (
        <div className="bg-destructive/10 rounded-2xl p-6 border border-destructive/20 shadow-sm mb-8 backdrop-blur-xl flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-destructive w-6 h-6" />
            <h2 className="text-lg font-semibold text-destructive">System Health Alerts</h2>
          </div>
          <ul className="list-disc list-inside space-y-1 text-destructive/90 ml-2">
            {healthAlerts.map((alert: string, idx: number) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ProfessorStatCard
          title="Total Students"
          value={String(totalStudents)}
          subtitle="Registered in system"
          icon={Users}
          tone="primary"
          isLoading={isLoading}
        />
        <ProfessorStatCard
          title="Total Professors"
          value={String(totalProfessors)}
          subtitle="Registered supervisors"
          icon={ClipboardList}
          tone="info"
          isLoading={isLoading}
        />
        <ProfessorStatCard
          title="Active Teams"
          value={String(totalTeams)}
          subtitle="Across all departments"
          icon={Users}
          tone="warning"
          isLoading={isLoading}
        />
        <ProfessorStatCard
          title="Projects"
          value={String(totalProjects)}
          subtitle={`Avg score: ${averageOriginalityScore}%`}
          icon={FolderKanban}
          tone="success"
          isLoading={isLoading}
        />
      </div>

      <div className="space-y-8">
        <SectionCard
          title="Recent Audit Logs"
          action={
            <Link href="/admin/audit-logs">
              <Button
                variant="ghost"
                className="text-primary dark:text-primary hover:bg-primary/10"
              >
                View Full Logs
              </Button>
            </Link>
          }
        >
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border/40 bg-card/40 flex items-center justify-between">
                  <Skeleton className="h-5 w-64 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentAuditLogs.map((log: any) => (
                <div key={log.id} className="p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-accent/5 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {log.userFullName}
                    </span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {recentAuditLogs.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">No recent audit logs.</div>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
