// src/app/(public)/layout.tsx

import { Sidebar } from "../_components/Sidebar";
import { TopNav } from "../_components/TopNav";
import { MobileBottomNav } from "../_components/MobileBottomNav";
import { DashboardLayoutWrapper, MainContentArea } from "../_components/DashboardLayoutWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutWrapper>
      <Sidebar />
      <TopNav showNotifications />
      <MobileBottomNav />
      <MainContentArea>{children}</MainContentArea>
    </DashboardLayoutWrapper>
  );
}
