"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { adminApi, AuditLogDto } from "@/lib/admin-api";
import { DataTable } from "@/app/_components/DataTable";
import { PageHeader } from "@/app/_components/DashboardUI";

export default function AdminAuditLogs() {
  const [data, setData] = useState<AuditLogDto[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getAuditLogs({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      });
      setData(result.items);
      setPageCount(result.totalPages);
    } catch (error: any) {
      toast.error("Failed to fetch audit logs", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [pagination]);

  const columns: ColumnDef<AuditLogDto>[] = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => <div className="text-muted-foreground whitespace-nowrap">{new Date(row.getValue("timestamp")).toLocaleString()}</div>,
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => <div className="font-medium text-foreground uppercase text-xs">{row.getValue("action")}</div>,
    },
    {
      accessorKey: "userFullName",
      header: "User",
      cell: ({ row }) => <div>{row.getValue("userFullName") || <span className="text-muted-foreground italic">System</span>}</div>,
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => <div className="max-w-[400px] truncate" title={row.getValue("details")}>{row.getValue("details")}</div>,
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => <div className="text-muted-foreground text-xs font-mono">{row.getValue("ipAddress") || "N/A"}</div>,
    },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Audit Logs"
        description="Comprehensive timeline of system events, security actions, and data mutations."
      />

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
    </div>
  );
}
