"use client";

import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import React from "react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      {children}
    </div>
  );
}

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>
        {children}
      </LayoutContent>
    </SidebarProvider>
  );
}

export function MainContentArea({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useSidebar();
  
  return (
    <main
      className={`pt-16 pb-20 md:pb-6 transition-all duration-500 ease-in-out ${
        isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
      }`}
    >
      {children}
    </main>
  );
}
