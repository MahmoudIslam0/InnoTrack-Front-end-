"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { adminApi, AdminProjectDto } from "@/lib/admin-api";
import { DataTable } from "@/app/_components/DataTable";
import { PageHeader } from "@/app/_components/DashboardUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, AlertTriangle, RefreshCcw, Star, StarOff, PencilRuler } from "lucide-react";
import { normalizeStatusTone } from "@/lib/student-api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AdminProjects() {
  const [data, setData] = useState<AdminProjectDto[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // Status Override Modal State
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<AdminProjectDto | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<string>("");
  const [overrideReason, setOverrideReason] = useState<string>("");

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getProjects({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      });
      setData(result.items);
      setPageCount(result.totalPages);
    } catch (error: any) {
      toast.error("Failed to fetch projects", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [pagination]);

  const handleResetStuck = async () => {
    if (!confirm("This will scan for and fix stuck projects. Proceed?")) return;
    setIsResetting(true);
    try {
      await adminApi.resetStuckProjects();
      toast.success("Stuck projects have been reset successfully.");
      fetchProjects();
    } catch (error: any) {
      toast.error("Failed to reset stuck projects", { description: error.message });
    } finally {
      setIsResetting(false);
    }
  };

  const openOverrideModal = (project: AdminProjectDto) => {
    setSelectedProject(project);
    setOverrideStatus(project.status);
    setOverrideReason("");
    setIsOverrideOpen(true);
  };

  const submitOverride = async () => {
    if (!selectedProject || !overrideStatus || !overrideReason.trim()) return;
    try {
      await adminApi.overrideProjectStatus(selectedProject.id, overrideStatus, overrideReason);
      toast.success("Project status overridden successfully.");
      setIsOverrideOpen(false);
      fetchProjects();
    } catch (error: any) {
      toast.error("Failed to override status", { description: error.message });
    }
  };

  const handleToggleShowcase = async (project: AdminProjectDto) => {
    // Note: Assuming isShowcased is on project or we blindly toggle
    // Here we can fetch details first, or just hit the toggle based on UI intent
    // The endpoint might handle boolean value or just invert
    // Let's assume we prompt for true/false or simply toggle via API. 
    // The endpoint expects { isShowcased: boolean }.
    // If we don't have isShowcased in Dto, we could just send true for now, 
    // or we'd ideally have it in Dto. Let's assume we set it to true.
    const val = confirm("Do you want to flag this project as showcased? (Click OK for Yes, Cancel for No)");
    try {
      await adminApi.toggleShowcase(project.id, val);
      toast.success(`Project showcase status updated to ${val}`);
    } catch (error: any) {
      toast.error("Failed to update showcase status", { description: error.message });
    }
  };

  const columns: ColumnDef<AdminProjectDto>[] = [
    {
      accessorKey: "title",
      header: "Project Title",
      cell: ({ row }) => <div className="font-medium text-foreground max-w-[200px] truncate" title={row.getValue("title")}>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "domainName",
      header: "Domain",
    },
    {
      accessorKey: "teamName",
      header: "Team",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const tone = normalizeStatusTone(status);
        const colorClass = 
          tone === "completed" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
          tone === "in-progress" ? "bg-primary/10 text-primary" :
          tone === "submitted" ? "bg-blue-500/10 text-blue-700 dark:text-blue-400" :
          tone === "rejected" ? "bg-destructive/10 text-destructive dark:text-destructive" :
          "bg-secondary/50 text-muted-foreground";

        return <Badge className={`${colorClass} hover:${colorClass}`}>{status}</Badge>;
      },
    },
    {
      accessorKey: "originalityScore",
      header: "Originality",
      cell: ({ row }) => {
        const score = row.getValue("originalityScore") as number;
        if (score === undefined || score === null) return <span className="text-muted-foreground italic">N/A</span>;
        
        let color = "text-emerald-500";
        if (score < 50) color = "text-amber-500";
        if (score < 20) color = "text-destructive";

        return <span className={`font-semibold ${color}`}>{score}%</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(project.id)}>
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openOverrideModal(project)}>
                <PencilRuler className="w-4 h-4 mr-2" />
                Override Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleShowcase(project)}>
                <Star className="w-4 h-4 mr-2" />
                Toggle Showcase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const possibleStatuses = ["Draft", "Submitted", "Approved", "Rejected", "InProgress", "Completed"];

  return (
    <div className="dashboard-page">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <PageHeader
          title="Project Database"
          description="Global view of all proposals and active projects. Enforce state transitions if required."
        />
        
        <Button 
          onClick={handleResetStuck} 
          disabled={isResetting}
          variant="outline"
          className="mt-2 sm:mt-0 border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-900 dark:text-amber-400 dark:bg-amber-950/30 dark:hover:bg-amber-950/50"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          {isResetting ? "Scanning..." : "Reset Stuck Projects"}
        </Button>
      </div>

      <div className="mt-8">
        <DataTable
          columns={columns}
          data={data}
          pageCount={pageCount}
          onPaginationChange={setPagination}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          isLoading={isLoading}
        />
      </div>

      <Dialog open={isOverrideOpen} onOpenChange={setIsOverrideOpen}>
        <DialogContent className="sm:max-w-[425px] border-border/50 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Override Project Status</DialogTitle>
            <DialogDescription>
              Force transition project <strong>{selectedProject?.title}</strong> to a new state. This action will be audited.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>New Status</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
              >
                {possibleStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Audit Reason</Label>
              <Input 
                value={overrideReason} 
                onChange={(e) => setOverrideReason(e.target.value)} 
                placeholder="e.g. Approved via administrative bypass"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOverrideOpen(false)}>Cancel</Button>
            <Button onClick={submitOverride} disabled={!overrideReason.trim() || overrideStatus === selectedProject?.status}>
              Confirm Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
